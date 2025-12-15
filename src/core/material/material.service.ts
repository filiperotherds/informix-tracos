import { ConflictException, Injectable } from "@nestjs/common";
import { MaterialRepository } from "./material.repository";
import { CreateMaterialReserveBodySchema } from "./schemas/material-reserve.schema";
import { EquipmentRepository } from "../equipment/equipment.repository";
import { formattedDebitAccount } from "../../common/formatted-debit-account";
import { date } from "../../common/formatted-date";
import { PatchMaterialReserveBodySchema } from "./schemas/patch-material-reserve.schema";

@Injectable()
export class MaterialService {
    constructor(
        private materialRepository: MaterialRepository,
        private equipmentRepository: EquipmentRepository
    ) { }

    async create(materialProps: CreateMaterialReserveBodySchema) {
        const { cod_item, num_os, qtd_reserva, tracos_id } = materialProps

        const { cod_empresa, cod_uni_funcio, cod_equip } = await this.equipmentRepository.getEquipmentDataByOs(num_os)

        const balance = await this.materialRepository.getMaterialBalance({ cod_empresa: cod_empresa, cod_item: cod_item })

        if (balance < qtd_reserva) {
            throw new ConflictException('Insufficient material balance.')
        }

        const cod_centro_custo = await this.equipmentRepository.getEquipmentCostCenter({
            cod_empresa,
            cod_uni_funcio
        })

        if (!cod_centro_custo) {
            throw new ConflictException('Cost center not found.')
        }

        const cod_tip_despesa = await this.materialRepository.getExpenseType({
            cod_empresa,
            cod_item
        })

        const num_conta_deb = formattedDebitAccount({
            cod_centro_custo,
            cod_tip_despesa,
        })

        const requisitionId = await this.materialRepository.createEstoqueLocReser({
            cod_empresa,
            cod_equip,
            cod_item,
            cod_uni_funcio,
            num_conta_deb,
            num_os,
            qtd_reserva,
            date: date
        })

        await this.materialRepository.createEstLocReserEnd({
            cod_empresa: cod_empresa,
            id: requisitionId
        })

        await this.materialRepository.createSupParResvEst({
            cod_empresa,
            requisitionId,
            parametro: 'sit_est_reservada',
            des_parametro: 'Situação do estoque que está sendo reservado.',
            parametro_ind: 'L',
            parametro_texto: null,
            parametro_val: null,
            parametro_num: null
        })

        await this.materialRepository.createSupParResvEst({
            cod_empresa,
            requisitionId,
            parametro: 'ordem_servico',
            des_parametro: 'Tipo e Número da Ordem de Servico relacionados a reserva.',
            parametro_ind: null,
            parametro_texto: null,
            parametro_val: null,
            parametro_num: null
        })

        await this.materialRepository.createSupParResvEst({
            cod_empresa,
            requisitionId,
            parametro: 'qtd_resv_origem',
            des_parametro: 'Quantidade reservada original.',
            parametro_ind: null,
            parametro_texto: null,
            parametro_val: qtd_reserva,
            parametro_num: null
        })

        await this.materialRepository.createSupParResvEst({
            cod_empresa,
            requisitionId,
            parametro: 'tipo_despesa_item',
            des_parametro: 'Tipo de despesa utilizado para montagem da conta debito.',
            parametro_ind: null,
            parametro_texto: null,
            parametro_val: cod_tip_despesa,
            parametro_num: null
        })

        await this.materialRepository.updateEstoque({
            cod_empresa,
            cod_item,
            qtd_reserva
        })

        await this.materialRepository.createDeParaId({
            logixId: requisitionId.toString(),
            tracosId: tracos_id
        })
    }

    async patch({ cod_item, num_os, qtd_reserva, tracos_id }: PatchMaterialReserveBodySchema) {
        const { cod_empresa, cod_uni_funcio, cod_equip } = await this.equipmentRepository.getEquipmentDataByOs(num_os)

        const cod_centro_custo = await this.equipmentRepository.getEquipmentCostCenter({
            cod_empresa,
            cod_uni_funcio
        })

        const cod_tip_despesa = await this.materialRepository.getExpenseType({
            cod_empresa,
            cod_item
        })

        const num_conta_deb = formattedDebitAccount({
            cod_centro_custo: cod_centro_custo,
            cod_tip_despesa: cod_tip_despesa,
        })

        const num_transac = await this.materialRepository.getNumTransac(tracos_id)

        const estoque_trans = await this.materialRepository.getEstoqueTrans({
            cod_empresa,
            cod_item,
            num_transac,
        })

        const new_num_transac = await this.materialRepository.createEstoqueTrans({
            cod_empresa,
            cod_item,
            num_conta: num_conta_deb,
            num_docum: estoque_trans.num_docum,
            num_secao_requis: estoque_trans.num_secao_requis,
            qtd_movto: estoque_trans.qtd_movto
        })

        await this.materialRepository.createEstoqueTransEnd({
            cod_empresa,
            cod_item,
            num_transac: new_num_transac,
            qtd_movto: estoque_trans.qtd_movto
        })

        await this.materialRepository.createEstoqueTransRev({
            cod_empresa,
            num_transac,
            new_num_transac
        })

        const estoqueLoteEnder = await this.materialRepository.getEstoqueLoteEnder({
            cod_empresa,
            cod_item
        })

        const saldo_reversao = Number(estoqueLoteEnder.qtd_saldo) + Number(estoque_trans.qtd_movto)

        await this.materialRepository.updateEstoqueLoteEnder({
            cod_empresa,
            qtd_saldo: saldo_reversao,
            num_transac: estoqueLoteEnder.num_transac
        })

        await this.materialRepository.updateEstoqueLote({
            qtd_reversao: estoque_trans.qtd_movto,
            cod_empresa,
            cod_item
        })

        
    }

    async getAllMaterialBalance() {
        const balance = await this.materialRepository.getAllMaterialBalance()

        return balance
    }
}