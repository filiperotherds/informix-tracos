import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../pipes/zod-validation-pipe";
import { type CreateMaterialRequisitionBodySchema, createMaterialRequisitionBodySchema } from "../../schema/create-material-requisition.schema";
import { createZodDto } from "nestjs-zod";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";

import { date, time } from "../../common/formatted-date";
import z from "zod";

class CreateMaterialRequisitionDto extends createZodDto(createMaterialRequisitionBodySchema) { }

const equipmentDataSchema = z.object({
    cod_equip: z.string(),
    cod_uni_funcio: z.string(),
    cod_empresa: z.string(),
})

const centroTrabalhoSchema = z.object({
    cod_centro_custo: z.coerce.number(),
})

const tipoDespesaSchema = z.object({
    cod_tip_despesa: z.coerce.number(),
})

@ApiTags('Requisição de Material')
@Controller('/material-requisition')
//@UseGuards(JwtAuthGuard)
export class CreateMaterialRequisition {
    constructor(private informix: InformixService) { }

    @Post()
    @ApiBody({
        type: CreateMaterialRequisitionDto,
        description: 'Create a new material requisition',
    })
    @UsePipes(new ZodValidationPipe(createMaterialRequisitionBodySchema))
    async handle(@Body() body: CreateMaterialRequisitionBodySchema) {
        const {
            cod_item,
            num_os,
            qtd_reserva
        } = body;

        const equipmentResult = await this.informix.query(`
            SELECT UNIQUE
                TRIM(ATIV_OSN.COD_EQUIP) AS COD_EQUIP,
                TRIM(EQUIPAMENTO.COD_UNI_FUNCIO) AS COD_UNI_FUNCIO,
                TRIM(EQUIPAMENTO.COD_EMPRESA) AS COD_EMPRESA
            FROM
                ATIV_OSN,EQUIPAMENTO
            WHERE
                ATIV_OSN.NUM_OS='${num_os}'
            AND ATIV_OSN.COD_EQUIP=EQUIPAMENTO.COD_EQUIP
            AND ATIV_OSN.COD_EMPRESA=EQUIPAMENTO.COD_EMPRESA`)

        if (!equipmentResult) {
            throw new Error('Equipment data not found.');
        }

        const equipmentData = equipmentDataSchema.parse(equipmentResult[0]);

        const { cod_equip, cod_uni_funcio, cod_empresa } = equipmentData;

        const centroTrabalhoResult = await this.informix.query(`
            SELECT
                COD_CENTRO_CUSTO
            FROM
                UNI_FUNCIONAL
            WHERE
                UNI_FUNCIONAL.COD_EMPRESA='${cod_empresa}'
                AND UNI_FUNCIONAL.COD_UNI_FUNCIO='${cod_uni_funcio}'
                AND UNI_FUNCIONAL.DAT_VALIDADE_FIM>CURRENT YEAR TO SECOND`)
        
        if (!centroTrabalhoResult) {
            throw new Error('COD_CENTRO_CUSTO not found.');
        }

        const centroTrabalhoData = centroTrabalhoSchema.parse(centroTrabalhoResult[0]);

        const { cod_centro_custo } = centroTrabalhoData;

        const tipoDespesaResult = await this.informix.query(`
            SELECT
                cod_tip_despesa
            FROM
                ITEM_SUP
            WHERE
                COD_EMPRESA='${cod_empresa}'
                AND COD_ITEM='${cod_item}'`)
        
        if (!tipoDespesaResult) {
            throw new Error('COD_TIP_DESPESA not found.')
        }

        const tipoDespesaData = tipoDespesaSchema.parse(tipoDespesaResult[0]);

        const { cod_tip_despesa } = tipoDespesaData;

        const num_conta_deb = `${cod_centro_custo}0${cod_tip_despesa}`
        
        const estoqueLocReser = await this.informix.query(
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
    }
}