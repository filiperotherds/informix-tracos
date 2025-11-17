import z from "zod";
import { ConflictException, Injectable } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";

import {
    type GetMaterialSchema
} from "./schemas/get-material.schema";
import {
    type CreateEstoqueLocReserSchema
} from "./schemas/create-estoque-loc-reser.schema";
import { CreateEstLocReserEndSchema } from "./schemas/create-est-loc-reser-end.schema";
import { CrateSupParResvEstSchema } from "./schemas/create-sup-par-resv-est.schema";
import { getAllMaterialSchema, GetAllMaterialSchema } from "./schemas/get-all-material.schema";

const materialBalanceSchema = z.coerce.number()

const expenseTypeSchema = z.coerce.number()

@Injectable()
export class MaterialRepository {
    constructor(private informix: InformixService) { }

    async getMaterialBalance(materialProps: GetMaterialSchema): Promise<number> {
        const { cod_item, cod_empresa } = materialProps

        const balanceResult = await this.informix.query(`
            SELECT
                sum(qtd_saldo) AS qtd
            FROM
                estoque_lote
            WHERE
                cod_item = ?
                AND cod_empresa = ?`,
            [
                cod_item,
                cod_empresa
            ]
        )

        return materialBalanceSchema.parse(balanceResult[0].qtd)
    }

    async getExpenseType(materialProps: GetMaterialSchema): Promise<number> {
        const { cod_item, cod_empresa } = materialProps

        const expenseTypeResult = await this.informix.query(`
            SELECT
                cod_tip_despesa
            FROM
                ITEM_SUP
            WHERE
                COD_EMPRESA=?
                AND COD_ITEM=?`,
            [
                cod_empresa,
                cod_item,
            ]
        )

        if (!expenseTypeResult) {
            throw new ConflictException('Expense type not found.')
        }

        return expenseTypeSchema.parse(expenseTypeResult[0].cod_tip_despesa)
    }

    async createEstoqueLocReser(materialProps: CreateEstoqueLocReserSchema): Promise<number> {
        const {
            cod_empresa,
            cod_equip,
            cod_item,
            cod_uni_funcio,
            date,
            num_conta_deb,
            num_os,
            qtd_reserva
        } = materialProps

        await this.informix.query(`
            INSERT INTO ESTOQUE_LOC_RESER (
                COD_EMPRESA,
                COD_ITEM,
                COD_LOCAL,
                QTD_RESERVADA,
                NUM_LOTE,
                IES_ORIGEM,
                NUM_DOCUM,
                NUM_REFERENCIA,
                IES_SITUACAO,
                DAT_PREV_BAIXA,
                NUM_CONTA_DEB,
                COD_UNI_FUNCIO,
                NOM_SOLICITANTE,
                DAT_SOLICITACAO,
                NOM_APROVANTE,
                DAT_APROVACAO,
                QTD_ATENDIDA,
                DAT_ULT_ATUALIZ)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cod_empresa,
                cod_item,
                'ALMCENFABR',
                qtd_reserva,
                null,
                'I',
                num_os,
                cod_equip,
                'N',
                date,
                num_conta_deb,
                cod_uni_funcio,
                'pcgeovan',
                date,
                null,
                null,
                0,
                null
            ]
        )

        const idResult = await this.informix.query(
            `SELECT DBINFO('sqlca.sqlerrd1') AS new_id FROM systables WHERE tabid = 1`
        )

        return idResult[0].new_id
    }

    async createEstLocReserEnd(materialProps: CreateEstLocReserEndSchema) {
        const { cod_empresa, id } = materialProps

        await this.informix.query(`
            INSERT INTO EST_LOC_RESER_END (
                COD_EMPRESA,
                NUM_RESERVA,
                ENDERECO,
                NUM_VOLUME,
                COD_GRADE_1,
                COD_GRADE_2,
                COD_GRADE_3,
                COD_GRADE_4,
                COD_GRADE_5,
                DAT_HOR_PRODUCAO,
                NUM_PED_VEN,
                NUM_SEQ_PED_VEN,
                DAT_HOR_VALIDADE,
                NUM_PECA,
                NUM_SERIE,
                COMPRIMENTO,
                LARGURA,
                ALTURA,
                DIAMETRO,
                DAT_HOR_RESERV_1,
                DAT_HOR_RESERV_2,
                DAT_HOR_RESERV_3,
                QTD_RESERV_1,
                QTD_RESERV_2,
                QTD_RESERV_3,
                NUM_RESERV_1,
                NUM_RESERV_2,
                NUM_RESERV_3,
                TEX_RESERVADO,
                IDENTIF_ESTOQUE,
                DEPOSIT)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cod_empresa,
                id,
                '',
                0,
                '',
                '',
                '',
                '',
                '',
                '1900-01-01 00:00:00',
                0,
                0,
                '1900-01-01 00:00:00',
                '',
                '',
                0,
                0,
                0,
                0,
                '1900-01-01 00:00:00',
                '1900-01-01 00:00:00',
                '1900-01-01 00:00:00',
                0,
                0,
                0,
                0,
                0,
                0,
                '',
                null,
                null
            ]
        )
    }

    async createSupParResvEst(materialProps: CrateSupParResvEstSchema) {
        const {
            cod_empresa,
            des_parametro,
            parametro,
            parametro_ind,
            parametro_num,
            parametro_texto,
            parametro_val,
            requisitionId
        } = materialProps

        await this.informix.query(`
            INSERT INTO SUP_PAR_RESV_EST (
                EMPRESA,
                RESERVA,
                PARAMETRO,
                DES_PARAMETRO,
                PARAMETRO_IND,
                PARAMETRO_TEXTO,
                PARAMETRO_VAL,
                PARAMETRO_NUM,
                PARAMETRO_DAT)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cod_empresa,
                requisitionId,
                parametro,
                des_parametro,
                parametro_ind,
                parametro_texto,
                parametro_val,
                parametro_num,
                null
            ]
        )
    }

    async getAllMaterialBalance(): Promise<GetAllMaterialSchema> {
        const response = await this.informix.query(`
            SELECT DISTINCT 
                TRIM(item.cod_item) as cod_logix,
                (
                    SELECT  sum(el.qtd_saldo)
                    FROM   estoque_lote AS el, estoque AS e, item AS it
                    WHERE  el.cod_empresa   = "01"
                    AND    el.cod_item      = item.cod_item
                    AND    el.ies_situa_qtd = "L"
                    AND    el.cod_empresa   = e.cod_empresa
                    AND    el.cod_item      = e.cod_item
                    AND    el.cod_empresa   = it.cod_empresa
                    AND    el.cod_item      = it.cod_item
                ) as saldo_estoque,
                item_sup.pre_unit_ult_compr as preco_unit

            FROM item, familia, estoque, OUTER ordem_sup, OUTER item_sup
            WHERE item.cod_empresa     = "01"
            AND   item.ies_ctr_estoque = "S" 
            AND   item.ies_situacao    = "A" 
            AND   item.gru_ctr_estoq   = 65 
            AND   familia.cod_familia  = item.cod_familia 
            AND   familia.cod_empresa  = item.cod_empresa
            AND   estoque.cod_empresa  = item.cod_empresa 
            AND   estoque.cod_item     = item.cod_item 
            AND   estoque.qtd_liberada > 0
            AND   ordem_sup.cod_item   = item.cod_item
            AND   ordem_sup.cod_empresa= item.cod_empresa
            AND   item_sup.cod_empresa = item.cod_empresa
            AND   item_sup.cod_item    = item.cod_item
            GROUP BY 1,2,3
        `);

        const materialBalance = getAllMaterialSchema.parse(response)

        return materialBalance
    }
}