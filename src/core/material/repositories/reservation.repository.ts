import { Injectable } from '@nestjs/common';
import { InformixService } from '../../../informix/informix.service';
import { type CreateEstoqueLocReserSchema } from '../schemas/create-estoque-loc-reser.schema';
import { CreateEstLocReserEndSchema } from '../schemas/create-est-loc-reser-end.schema';
import { CrateSupParResvEstSchema } from '../schemas/create-sup-par-resv-est.schema';
import { DeleteMaterialReserveSchema } from '../schemas/delete-material-reserve.schema';

@Injectable()
export class ReservationRepository {
    constructor(private readonly informix: InformixService) { }

    async createEstoqueLocReser(
        {
            cod_empresa,
            cod_equip,
            cod_item,
            cod_uni_funcio,
            num_conta_deb,
            num_os,
            qtd_reserva,
        }: CreateEstoqueLocReserSchema,
        connection?: any,
    ): Promise<number> {
        const db = connection || this.informix;

        const transactionDate = new Date();
        const dateString = transactionDate.toLocaleDateString('en-CA', {
            timeZone: 'America/Sao_Paulo',
        });

        await db.query(
            `INSERT INTO ESTOQUE_LOC_RESER (
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
                'tractian',
                dateString,
                null,
                null,
                0,
                dateString,
            ],
        );

        const idResult = await db.query(
            `SELECT DBINFO('sqlca.sqlerrd1') AS new_id FROM systables WHERE tabid = 1`,
        );

        await db.query(
            `INSERT INTO ESTOQ_LOC_RES_OBS (
                COD_EMPRESA,
                NUM_RESERVA,
                TEX_OBSERV
            ) VALUES (?, ?, ?)`,
            [cod_empresa, idResult[0].new_id, ''],
        );

        return idResult[0].new_id;
    }

    async createEstLocReserEnd(
        { cod_empresa, id }: CreateEstLocReserEndSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `INSERT INTO EST_LOC_RESER_END (
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
                null,
            ],
        );
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
            requisitionId,
        }: CrateSupParResvEstSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `INSERT INTO SUP_PAR_RESV_EST (
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
                null,
            ],
        );
    }

    async getEstoqueLocReserData(
        { logixId }: { logixId: number },
        connection?: any,
    ) {
        const db = connection || this.informix;

        const response = await db.query(
            `SELECT
                cod_empresa, cod_item, qtd_reservada as old_value, num_docum as num_os
            FROM
                estoque_loc_reser
            WHERE
                num_reserva = ?`,
            [logixId],
        );

        return response[0];
    }

    async updateEstoqueLocReser(
        { qtdReserva, logixId }: { qtdReserva: number; logixId: number },
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `UPDATE
                estoque_loc_reser
            SET
                qtd_reservada = ?,
                qtd_atendida = 0
            WHERE
                num_reserva = ?`,
            [qtdReserva, logixId],
        );
    }

    async updateSupParResvEst(
        { qtdReserva, logixId }: { qtdReserva: number; logixId: number },
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `UPDATE
                sup_par_resv_est
            SET
                parametro_val = ?
            WHERE
                reserva = ?
                AND parametro = 'qtd_resv_origem'`,
            [qtdReserva, logixId],
        );
    }

    // Delete operations

    async deleteSupParResvEst(
        { cod_empresa, num_reserva }: DeleteMaterialReserveSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `DELETE FROM sup_par_resv_est 
            WHERE empresa = ? 
            AND reserva = ?`,
            [cod_empresa, num_reserva],
        );
    }

    async deleteEstoqLocResObs(
        { cod_empresa, num_reserva }: DeleteMaterialReserveSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `DELETE FROM estoq_loc_res_obs 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [cod_empresa, num_reserva],
        );
    }

    async deleteEstReserAreaLin(
        { cod_empresa, num_reserva }: DeleteMaterialReserveSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `DELETE FROM est_reser_area_lin 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [cod_empresa, num_reserva],
        );
    }

    async deleteEstoqueLocReser(
        { cod_empresa, num_reserva }: DeleteMaterialReserveSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `DELETE FROM estoque_loc_reser 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [cod_empresa, num_reserva],
        );
    }

    async deleteEstLocReserEnd(
        { cod_empresa, num_reserva }: DeleteMaterialReserveSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `DELETE FROM est_loc_reser_end 
            WHERE cod_empresa = ? 
            AND num_reserva = ?`,
            [cod_empresa, num_reserva],
        );
    }
}
