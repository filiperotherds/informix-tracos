import z from "zod";
import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
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
import { PrismaService } from "@/prisma/prisma.service";
import { CreateDeParaSchema } from "./schemas/de-para/create-de-para.schema";
import { UpdateEstoque } from "./schemas/update-estoque.schema";
import { GetEstoqueTransSchema } from "./schemas/get-estoque-trans.schema";
import { CreateEstoqueTransSchema } from "./schemas/create-estoque-trans.schema";
import { CreateEstoqueTransEndSchema } from "./schemas/create-estoque-trans-end.schema";
import { CreateEstoqueAuditoriaSchema } from "./schemas/create-estoque-auditoria.schema";
import { CreateEstoqueTransRev } from "./schemas/create-estoque-trans-rev.schema";
import { GetEstoqueLoteEnderSchema } from "./schemas/get-estoque-lote-ender.schema";
import { UpdateEstoqueLoteEnder } from "./schemas/update-estoque-lote-ender.schema";
import { UpdateEstoqueLote } from "./schemas/update-estoque-lote.schema";
import { DeleteDeParaSchema } from "./schemas/de-para/delete-de-para.schema";
import { DeleteMaterialReserveSchema } from "./schemas/delete-material-reserve.schema";

const materialBalanceSchema = z.coerce.number()

const expenseTypeSchema = z.coerce.number()

@Injectable()
export class MaterialRepository {
    constructor(
        private informix: InformixService,
        private prisma: PrismaService
    ) { }

    /* ===== Operações De/Para ===== */

    async createDeParaId({ logixId, tracosId }: CreateDeParaSchema) {
        await this.prisma.deParaReserva.create({
            data: {
                logixId,
                tracosId,
                status: "PENDENTE"
            }
        })
    }

    async cancelDeParaId({ tracosId }: DeleteDeParaSchema) {
        await this.prisma.deParaReserva.updateMany({
            where: {
                tracosId,
            },
            data: {
                status: "CANCELADA"
            }
        })
    }

    async getPendingRequests() {
        const pendingRequests = await this.prisma.deParaReserva.findMany({
            where: {
                status: "PENDENTE"
            }
        })

        return pendingRequests
    }

    async getLogixId(tracosId: string) {
        const result = await this.prisma.deParaReserva.findFirst({
            where: {
                tracosId
            },
            select: {
                logixId: true,
            }
        })

        if (!result) {
            throw new BadRequestException("Requisition ID not found.")
        }

        return Number(result.logixId)
    }

    /* ===== Operações De/Para ===== */

    async getMaterialBalance({
        cod_item, cod_empresa
    }: GetMaterialSchema, connection?: any): Promise<number> {
        const db = connection || this.informix

        const balanceResult = await db.query(`
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

    async getExpenseType({
        cod_item, cod_empresa
    }: GetMaterialSchema, connection?: any): Promise<number> {
        const db = connection || this.informix

        const expenseTypeResult = await db.query(`
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

    async createEstoqueLocReser({
        cod_empresa,
        cod_equip,
        cod_item,
        cod_uni_funcio,
        num_conta_deb,
        num_os,
        qtd_reserva
    }: CreateEstoqueLocReserSchema, connection?: any): Promise<number> {
        const db = connection || this.informix

        const transactionDate = new Date();
        const dateString = transactionDate.toLocaleDateString('en-CA', {
            timeZone: 'America/Sao_Paulo'
        });

        await db.query(`
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
                dateString,
                num_conta_deb,
                cod_uni_funcio,
                'pcgeovan',
                dateString,
                null,
                null,
                0,
                dateString
            ]
        )

        const idResult = await db.query(
            `SELECT DBINFO('sqlca.sqlerrd1') AS new_id FROM systables WHERE tabid = 1`
        )

        await db.query(`
            INSERT INTO ESTOQ_LOC_RES_OBS (
                COD_EMPRESA,
                NUM_RESERVA,
                TEX_OBSERV
            ) VALUES (?, ?, ?)`,
            [
                cod_empresa,
                idResult[0].new_id,
                ''
            ])

        return idResult[0].new_id
    }

    async createEstLocReserEnd({ cod_empresa, id }: CreateEstLocReserEndSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
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

    async createSupParResvEst(
        {
            cod_empresa,
            des_parametro,
            parametro,
            parametro_ind,
            parametro_num,
            parametro_texto,
            parametro_val,
            requisitionId
        }: CrateSupParResvEstSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
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

    async getAllMaterialBalance(
        connection?: any
    ): Promise<GetAllMaterialSchema> {
        const db = connection || this.informix

        const response = await db.query(`
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

    async getNumTransac(tracos_id: string) {
        const response = await this.prisma.deParaReserva.findFirst({
            select: {
                logixId: true,
            },
            where: {
                tracosId: tracos_id,
            }
        })

        if (!response) {
            throw new BadRequestException('No values found.')
        }

        const num_transac = Number(response.logixId)

        return num_transac
    }

    async updateEstoqueQtdReservada({
        cod_empresa,
        cod_item,
        qtd_reserva
    }: UpdateEstoque, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            UPDATE 
                estoque
            SET
                qtd_reservada = ?
            WHERE
                cod_empresa = ?
                AND cod_item = ?
            `,
            [
                qtd_reserva,
                cod_empresa,
                cod_item
            ]
        )
    }

    async getEstoqueTrans({
        cod_empresa,
        cod_item,
        num_transac
    }: GetEstoqueTransSchema, connection?: any) {
        const db = connection || this.informix

        const estoque_trans = await db.query(`
            SELECT
                estoque_trans.*
            FROM
                estoque_trans
            WHERE
                estoque_trans.cod_empresa = ? 
                AND estoque_trans.cod_item = ? 
                AND estoque_trans.num_docum = ?`,
            [
                cod_empresa,
                cod_item,
                num_transac
            ]
        )

        return estoque_trans[0]
    }

    async createEstoqueTrans({
        cod_empresa,
        cod_item,
        num_docum,
        num_conta,
        qtd_movto,
        num_secao_requis
    }: CreateEstoqueTransSchema, connection?: any) {
        const db = connection || this.informix

        const transactionDate = new Date();
        const timeString = transactionDate.toTimeString().slice(0, 8)
        const dateString = transactionDate.toISOString().slice(0, 10)

        await db.query(`
            INSERT INTO ESTOQUE_TRANS (
                COD_EMPRESA,
                COD_ITEM,
                DAT_MOVTO,
                DAT_REF_MOEDA_FORT,
                COD_OPERACAO,
                NUM_DOCUM,
                NUM_SEQ,
                IES_TIP_MOVTO,
                QTD_MOVTO,
                NUM_CONTA,
                NUM_SECAO_REQUIS,
                COD_LOCAL_EST_ORIG,
                COD_LOCAL_EST_DEST,
                NUM_LOTE_ORIG,
                NUM_LOTE_DEST,
                IES_SIT_EST_ORIG,
                IES_SIT_EST_DEST,
                COD_TURNO,
                NOM_USUARIO,
                DAT_PROCES,
                HOR_OPERAC,
                NUM_PROG,
                CUS_TOT_MOVTO_F,
                CUS_UNIT_MOVTO_F,
                CUS_TOT_MOVTO_P,
                CUS_UNIT_MOVTO_P
            ) VALUES (
                ?, ?, ?, ?, 'RM', ?, 0, 'R', ?, ?, ?, 'ALMCENFABR', '', NULL, NULL, 'L', 'L', NULL, 'pcgeovan', ?, ?, 'SUP0710', 0, 0, 0, 0
            )`,
            [
                cod_empresa,
                cod_item,
                dateString,
                dateString,
                num_docum,
                qtd_movto,
                num_conta,
                num_secao_requis,
                dateString,
                timeString
            ]
        )

        const idResult = await db.query(
            `SELECT DBINFO('sqlca.sqlerrd1') AS new_id FROM systables WHERE tabid = 1`
        )

        return idResult[0].new_id
    }

    async createEstoqueTransEnd({
        cod_empresa,
        cod_item,
        num_transac,
        qtd_movto
    }: CreateEstoqueTransEndSchema, connection?: any) {
        const db = connection || this.informix

        const dateString = new Date().toISOString().slice(0, 10);

        await db.query(`
            INSERT INTO ESTOQUE_TRANS_END (
                COD_EMPRESA,
                NUM_TRANSAC,
                ENDERECO,
                NUM_VOLUME,
                QTD_MOVTO,
                COD_GRADE_1,
                COD_GRADE_2,
                COD_GRADE_3,
                COD_GRADE_4,
                COD_GRADE_5,
                DAT_HOR_PROD_INI,
                DAT_HOR_PROD_FIM,
                VLR_TEMPERATURA,
                ENDERECO_ORIGEM,
                NUM_PED_VEN,
                NUM_SEQ_PED_VEN,
                DAT_HOR_PRODUCAO,
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
                CUS_UNIT_MOVTO_P,
                CUS_UNIT_MOVTO_F,
                CUS_TOT_MOVTO_P,
                CUS_TOT_MOVTO_F,
                COD_ITEM,
                DAT_MOVTO,
                COD_OPERACAO,
                IES_TIP_MOVTO,
                NUM_PROG,
                IDENTIF_ESTOQUE,
                DEPOSIT
            ) VALUES (
                ?,
                ?,
                '',
                0,
                ?,
                '',
                '',
                '',
                '',
                '',
                '1900-01-01 00:00:00',
                '1900-01-01 00:00:00',
                0.00,
                '',
                0,
                0,
                '1900-01-01 00:00:00',
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
                0,
                0,
                0,
                0,
                ?,
                ?,
                'RM',
                'R',
                'SUP0710',
                'NULL',
                'NULL'
            )`,
            [
                cod_empresa,
                num_transac,
                qtd_movto,
                cod_item,
                dateString
            ]
        )
    }

    async createEstoqueAuditoria({
        cod_empresa,
        num_transac
    }: CreateEstoqueAuditoriaSchema, connection?: any) {
        const db = connection || this.informix

        const dateString = new Date().toISOString().slice(0, 10);

        await db.query(`
            INSERT INTO ESTOQUE_AUDITORIA (
                COD_EMPRESA,
                NUM_TRANSAC,
                NOM_USUARIO,
                DAT_HOR_PROCES,
                NUM_PROGRAMA
            ) VALUES 
                (?, ?, 'pcgeovan', ?, 'SUP0710')`,
            [
                cod_empresa,
                num_transac,
                dateString
            ]
        )

        await db.query(`
            INSERT INTO ESTOQUE_OBS (
                COD_EMPRESA,
                NUM_TRANSAC,
                TEX_OBSERV
            ) VALUES 
                (?, ?, 'Operação realizada via TracOs.')`,
            [
                cod_empresa,
                num_transac
            ]
        )
    }

    async createEstoqueTransRev({
        cod_empresa,
        num_transac,
        new_num_transac
    }: CreateEstoqueTransRev, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            INSERT INTO
                ESTOQUE_TRANS_REV
            VALUES (?, ?, ?)`,
            [
                cod_empresa,
                num_transac,
                new_num_transac
            ]
        )
    }

    async getEstoqueLoteEnder({
        cod_empresa,
        cod_item
    }: GetEstoqueLoteEnderSchema, connection?: any) {
        const db = connection || this.informix

        const response = await db.query(`
            SELECT
                num_transac, qtd_saldo 
            FROM
                estoque_lote_ender   
            WHERE
                cod_empresa = ?     
                AND cod_item = ?     
                AND cod_local = 'ALMCENFABR'     
                AND (num_lote IS NULL OR num_lote = ' ')
                AND ies_situa_qtd = 'L'`,
            [
                cod_empresa,
                cod_item
            ]
        )

        return response[0]
    }

    async updateEstoqueLoteEnder({
        qtd_saldo,
        cod_empresa,
        num_transac
    }: UpdateEstoqueLoteEnder, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            UPDATE
                estoque_lote_ender 
            SET 
                qtd_saldo = ?
            WHERE
                cod_empresa = ?
                AND num_transac = ?`,
            [
                qtd_saldo,
                cod_empresa,
                num_transac
            ]
        )
    }

    async updateEstoqueLote({
        qtd_reversao,
        cod_empresa,
        cod_item
    }: UpdateEstoqueLote, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            UPDATE
                ESTOQUE_LOTE 
            SET
                QTD_SALDO = QTD_SALDO + ?
            WHERE
                COD_EMPRESA=?
                AND COD_ITEM=?
                AND COD_LOCAL='ALMCENFABR' 
                AND IES_SITUA_QTD='L'`,
            [
                qtd_reversao,
                cod_empresa,
                cod_item
            ]
        )
    }

    async updateEstoqueQtdLiberada({
        qtd_liberada,
        cod_empresa,
        cod_item
    }: any, connection?: any) {
        const db = connection || this.informix

        await db.query(`
                UPDATE
                    ESTOQUE 
                SET
                    QTD_LIBERADA = ?
                WHERE
                    COD_EMPRESA = ?
                    AND COD_ITEM = ?`,
            [
                qtd_liberada,
                cod_empresa,
                cod_item
            ]
        )

        console.log("Estoque Qtd Liberada Atualizado")
    }

    async getReservedMaterial({ cod_item, cod_empresa }: { cod_item: string, cod_empresa: string }, connection?: any) {
        const db = connection || this.informix

        const reservedMaterial = await db.query(`
                SELECT
                    qtd_reservada
                FROM
                    ESTOQUE
                WHERE
                    cod_empresa = ?
                    AND cod_item = ?`,
            [
                cod_empresa,
                cod_item
            ]
        )

        return reservedMaterial[0].qtd_reservada
    }

    // UPDATE QTD_RESERVADA

    async getEstoqueLocReserData({
        logixId
    }: {
        logixId: number
    }, connection?: any) {
        const db = connection || this.informix

        const response = await db.query(`
            SELECT
                cod_empresa, cod_item, qtd_reservada as old_value, num_docum as num_os
            FROM
                estoque_loc_reser
            WHERE
                num_reserva = ?
        `, [logixId])

        return response[0]
    }

    async updateEstoqueLocReser({
        qtdReserva,
        logixId
    }: {
        qtdReserva: number,
        logixId: number
    }, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            UPDATE
                estoque_loc_reser
            SET
                qtd_reservada = ?,
                qtd_atendida = 0
            WHERE
                num_reserva = ?
        `, [qtdReserva, logixId])
    }

    async updateSupParResvEst({
        qtdReserva,
        logixId
    }: {
        qtdReserva: number,
        logixId: number
    }, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            UPDATE
                sup_par_resv_est
            SET
                parametro_val = ?
            WHERE
                reserva = ?
                AND parametro = 'qtd_resv_origem'
        `, [qtdReserva, logixId])
    }

    // DELETE OPERATIONS

    async deleteSupParResvEst({
        cod_empresa,
        num_reserva
    }: DeleteMaterialReserveSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            DELETE FROM sup_par_resv_est 
            WHERE empresa = ? 
            AND reserva = ?`,
            [
                cod_empresa,
                num_reserva
            ]
        )
    }

    async deleteEstoqLocResObs({
        cod_empresa,
        num_reserva
    }: DeleteMaterialReserveSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            DELETE FROM estoq_loc_res_obs 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [
                cod_empresa,
                num_reserva
            ]
        )
    }

    async deleteEstReserAreaLin({
        cod_empresa,
        num_reserva
    }: DeleteMaterialReserveSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            DELETE FROM est_reser_area_lin 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [
                cod_empresa,
                num_reserva
            ]
        )
    }

    async deleteEstoqueLocReser({
        cod_empresa,
        num_reserva
    }: DeleteMaterialReserveSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            DELETE FROM estoque_loc_reser 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [
                cod_empresa,
                num_reserva
            ]
        )
    }

    async deleteEstLocReserEnd({
        cod_empresa,
        num_reserva
    }: DeleteMaterialReserveSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            DELETE FROM est_loc_reser_end 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [
                cod_empresa,
                num_reserva
            ]
        )
    }
}