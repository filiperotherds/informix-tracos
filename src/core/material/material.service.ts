import { ConflictException, Injectable } from "@nestjs/common";
import { XrefRepository } from "./repositories/xref.repository";
import { StockRepository } from "./repositories/stock.repository";
import { ReservationRepository } from "./repositories/reservation.repository";
import { EquipmentRepository } from "../equipment/equipment.repository";
import { formattedDebitAccount } from "../../common/formatted-debit-account";
import { MaterialReserveBodySchema } from "./schemas/body/material-reserve.schema";
import { InformixService } from "@/informix/informix.service";
import { UpdateMaterialReserveBodySchema } from "./schemas/body/update-material-reserve.schema";
import { CancelMaterialReserveBodySchema } from "./schemas/body/cancel-material-reserve.scham";

@Injectable()
export class MaterialService {
    constructor(
        private readonly xrefRepository: XrefRepository,
        private readonly stockRepository: StockRepository,
        private readonly reservationRepository: ReservationRepository,
        private readonly equipmentRepository: EquipmentRepository,
        private readonly informixService: InformixService,
    ) { }

    async createReserve({
        cod_item,
        num_os,
        qtd_reserva,
        tracos_id
    }: MaterialReserveBodySchema, connection?: any) {
        const execute = async (conn: any) => {
            const { cod_empresa, cod_uni_funcio, cod_equip } = await this.equipmentRepository.getEquipmentDataByOs(num_os)

            const balance = await this.stockRepository.getMaterialBalance({ cod_empresa, cod_item }, conn)

            const reservedMaterial = await this.stockRepository.getReservedMaterial({
                cod_empresa,
                cod_item
            }, conn)

            const availableBalance = balance - reservedMaterial

            const new_qtd_reservada = reservedMaterial + Number(qtd_reserva)

            if (availableBalance < Number(qtd_reserva)) {
                throw new ConflictException('Insufficient material balance.')
            }

            const cod_centro_custo = await this.equipmentRepository.getEquipmentCostCenter({
                cod_empresa,
                cod_uni_funcio
            }, conn)

            if (!cod_centro_custo) {
                throw new ConflictException('Cost center not found.')
            }

            const cod_tip_despesa = await this.stockRepository.getExpenseType({
                cod_empresa,
                cod_item
            }, conn)

            const num_conta_deb = formattedDebitAccount({
                cod_centro_custo,
                cod_tip_despesa,
            })

            const requisitionId = await this.reservationRepository.createEstoqueLocReser({
                cod_empresa,
                cod_equip,
                cod_item,
                cod_uni_funcio,
                num_conta_deb,
                num_os,
                qtd_reserva,
            }, conn)

            await this.reservationRepository.createEstLocReserEnd({
                cod_empresa: cod_empresa,
                id: requisitionId
            }, conn)

            await this.reservationRepository.createSupParResvEst({
                cod_empresa,
                requisitionId,
                parametro: 'sit_est_reservada',
                des_parametro: 'Situação do estoque que está sendo reservado.',
                parametro_ind: 'L',
                parametro_texto: null,
                parametro_val: null,
                parametro_num: null
            }, conn)

            await this.reservationRepository.createSupParResvEst({
                cod_empresa,
                requisitionId,
                parametro: 'ordem_servico',
                des_parametro: 'Tipo e Número da Ordem de Servico relacionados a reserva.',
                parametro_ind: null,
                parametro_texto: null,
                parametro_val: null,
                parametro_num: null
            }, conn)

            await this.reservationRepository.createSupParResvEst({
                cod_empresa,
                requisitionId,
                parametro: 'qtd_resv_origem',
                des_parametro: 'Quantidade reservada original.',
                parametro_ind: null,
                parametro_texto: null,
                parametro_val: qtd_reserva,
                parametro_num: null
            }, conn)

            await this.reservationRepository.createSupParResvEst({
                cod_empresa,
                requisitionId,
                parametro: 'tipo_despesa_item',
                des_parametro: 'Tipo de despesa utilizado para montagem da conta debito.',
                parametro_ind: null,
                parametro_texto: null,
                parametro_val: cod_tip_despesa,
                parametro_num: null
            }, conn)

            await this.stockRepository.updateEstoqueQtdReservada({
                cod_empresa,
                cod_item,
                qtd_reserva: new_qtd_reservada
            }, conn)

            await this.xrefRepository.createDeParaId({
                logixId: requisitionId.toString(),
                tracosId: tracos_id
            })
        }

        if (connection) {
            return await execute(connection);
        } else {
            return await this.informixService.transaction(execute);
        }
    }

    async cancelReserve({
        tracos_id
    }: CancelMaterialReserveBodySchema, connection?: any) {
        const execute = async (conn: any) => {
            const logixId = await this.xrefRepository.getLogixId(tracos_id)

            const { cod_empresa, cod_item, old_value } = await this.reservationRepository.getEstoqueLocReserData({ logixId }, conn)

            const reservedMaterial = await this.stockRepository.getReservedMaterial({
                cod_empresa,
                cod_item
            }, conn)

            const new_qtd_reservada = reservedMaterial - Number(old_value)

            await this.stockRepository.updateEstoqueQtdReservada({
                cod_empresa,
                cod_item,
                qtd_reserva: new_qtd_reservada
            }, conn)

            await this.reservationRepository.deleteSupParResvEst({
                cod_empresa,
                num_reserva: logixId
            }, conn)

            await this.reservationRepository.deleteEstoqLocResObs({
                cod_empresa,
                num_reserva: logixId
            }, conn)

            await this.reservationRepository.deleteEstLocReserEnd({
                cod_empresa,
                num_reserva: logixId
            }, conn)

            await this.reservationRepository.deleteEstReserAreaLin({
                cod_empresa,
                num_reserva: logixId
            }, conn)

            await this.reservationRepository.deleteEstoqueLocReser({
                cod_empresa,
                num_reserva: logixId
            }, conn)

            await this.xrefRepository.cancelDeParaId({
                tracosId: tracos_id
            })
        }

        if (connection) {
            return await execute(connection);
        } else {
            return await this.informixService.transaction(execute);
        }
    }

    async updateReserveValue({
        tracos_id,
        new_value
    }: UpdateMaterialReserveBodySchema) {

        await this.informixService.transaction(async (connection) => {
            const logixId = await this.xrefRepository.getLogixId(tracos_id)

            const { cod_empresa, cod_item, old_value } = await this.reservationRepository.getEstoqueLocReserData({ logixId }, connection)

            const balance = await this.stockRepository.getMaterialBalance({ cod_empresa, cod_item }, connection)

            const reservedMaterial = await this.stockRepository.getReservedMaterial({
                cod_empresa,
                cod_item
            }, connection)

            const newReservedMaterial = reservedMaterial - old_value + Number(new_value)

            const availableBalance = balance - newReservedMaterial

            if (availableBalance < 0) {
                throw new ConflictException('Insufficient material balance.')
            }

            await this.reservationRepository.updateEstoqueLocReser({
                qtdReserva: Number(new_value),
                logixId
            }, connection)

            await this.reservationRepository.updateSupParResvEst({
                qtdReserva: Number(new_value),
                logixId
            }, connection)

            await this.stockRepository.updateEstoqueQtdReservada({
                qtd_reserva: newReservedMaterial,
                cod_empresa,
                cod_item
            }, connection)
        })
    }

    async getAllMaterialBalance() {
        const balance = await this.stockRepository.getAllMaterialBalance()

        return balance
    }
}