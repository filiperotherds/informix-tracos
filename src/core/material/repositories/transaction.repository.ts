import { Injectable } from '@nestjs/common';
import { InformixService } from '../../../informix/informix.service';
import { GetEstoqueTransSchema } from '../schemas/get-estoque-trans.schema';
import { CreateEstoqueTransSchema } from '../schemas/create-estoque-trans.schema';
import { CreateEstoqueTransEndSchema } from '../schemas/create-estoque-trans-end.schema';
import { CreateEstoqueAuditoriaSchema } from '../schemas/create-estoque-auditoria.schema';
import { CreateEstoqueTransRev } from '../schemas/create-estoque-trans-rev.schema';
import { GetEstoqueLoteEnderSchema } from '../schemas/get-estoque-lote-ender.schema';
import { UpdateEstoqueLoteEnder } from '../schemas/update-estoque-lote-ender.schema';
import { UpdateEstoqueLote } from '../schemas/update-estoque-lote.schema';

@Injectable()
export class TransactionRepository {
    constructor(private readonly informix: InformixService) { }

    async getEstoqueTrans(
        { cod_empresa, cod_item, num_transac }: GetEstoqueTransSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        const estoque_trans = await db.query(
            `SELECT
                estoque_trans.*
            FROM
                estoque_trans
            WHERE
                estoque_trans.cod_empresa = ? 
                AND estoque_trans.cod_item = ? 
                AND estoque_trans.num_docum = ?`,
            [cod_empresa, cod_item, num_transac],
        );

        return estoque_trans[0];
    }

    async createEstoqueTrans(
        {
            cod_empresa,
            cod_item,
            num_docum,
            num_conta,
            qtd_movto,
            num_secao_requis,
        }: CreateEstoqueTransSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        const transactionDate = new Date();
        const timeString = transactionDate.toTimeString().slice(0, 8);
        const dateString = transactionDate.toISOString().slice(0, 10);

        await db.query(
            `INSERT INTO ESTOQUE_TRANS (
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
                ?, ?, ?, ?, 'RM', ?, 0, 'R', ?, ?, ?, 'ALMCENFABR', '', NULL, NULL, 'L', 'L', NULL, 'tractian', ?, ?, 'SUP0710', 0, 0, 0, 0
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
                timeString,
            ],
        );

        const idResult = await db.query(
            `SELECT DBINFO('sqlca.sqlerrd1') AS new_id FROM systables WHERE tabid = 1`,
        );

        return idResult[0].new_id;
    }

    async createEstoqueTransEnd(
        { cod_empresa, cod_item, num_transac, qtd_movto }: CreateEstoqueTransEndSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        const dateString = new Date().toISOString().slice(0, 10);

        await db.query(
            `INSERT INTO ESTOQUE_TRANS_END (
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
            [cod_empresa, num_transac, qtd_movto, cod_item, dateString],
        );
    }

    async createEstoqueAuditoria(
        { cod_empresa, num_transac }: CreateEstoqueAuditoriaSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        const dateString = new Date().toISOString().slice(0, 10);

        await db.query(
            `INSERT INTO ESTOQUE_AUDITORIA (
                COD_EMPRESA,
                NUM_TRANSAC,
                NOM_USUARIO,
                DAT_HOR_PROCES,
                NUM_PROGRAMA
            ) VALUES 
                (?, ?, 'tractian', ?, 'SUP0710')`,
            [cod_empresa, num_transac, dateString],
        );

        await db.query(
            `INSERT INTO ESTOQUE_OBS (
                COD_EMPRESA,
                NUM_TRANSAC,
                TEX_OBSERV
            ) VALUES 
                (?, ?, 'Operation performed via TracOs.')`,
            [cod_empresa, num_transac],
        );
    }

    async createEstoqueTransRev(
        { cod_empresa, num_transac, new_num_transac }: CreateEstoqueTransRev,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `INSERT INTO
                ESTOQUE_TRANS_REV
            VALUES (?, ?, ?)`,
            [cod_empresa, num_transac, new_num_transac],
        );
    }

    async getEstoqueLoteEnder(
        { cod_empresa, cod_item }: GetEstoqueLoteEnderSchema,
        connection?: any,
    ) {
        const db = connection || this.informix;

        const response = await db.query(
            `SELECT
                num_transac, qtd_saldo 
            FROM
                estoque_lote_ender   
            WHERE
                cod_empresa = ?     
                AND cod_item = ?     
                AND cod_local = 'ALMCENFABR'     
                AND (num_lote IS NULL OR num_lote = ' ')
                AND ies_situa_qtd = 'L'`,
            [cod_empresa, cod_item],
        );

        return response[0];
    }

    async updateEstoqueLoteEnder(
        { qtd_saldo, cod_empresa, num_transac }: UpdateEstoqueLoteEnder,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `UPDATE
                estoque_lote_ender 
            SET 
                qtd_saldo = ?
            WHERE
                cod_empresa = ?
                AND num_transac = ?`,
            [qtd_saldo, cod_empresa, num_transac],
        );
    }

    async updateEstoqueLote(
        { qtd_reversao, cod_empresa, cod_item }: UpdateEstoqueLote,
        connection?: any,
    ) {
        const db = connection || this.informix;

        await db.query(
            `UPDATE
                ESTOQUE_LOTE 
            SET
                QTD_SALDO = QTD_SALDO + ?
            WHERE
                COD_EMPRESA=?
                AND COD_ITEM=?
                AND COD_LOCAL='ALMCENFABR' 
                AND IES_SITUA_QTD='L'`,
            [qtd_reversao, cod_empresa, cod_item],
        );
    }
}
