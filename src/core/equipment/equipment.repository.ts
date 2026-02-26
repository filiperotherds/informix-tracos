import { Injectable } from "@nestjs/common";
import { InformixService, InformixConnection } from "../../informix/informix.service";
import { EquipmentDataSchema, equipmentDataSchema } from "./schemas/equipment-data.schema";
import {
    type EquipmentCostCenterSchema
} from "./schemas/get-equipment-cost-center.schema";
import { GetEquipmentDataByCodSchema } from "./schemas/get-equipment-data-by-cod.schema";

@Injectable()
export class EquipmentRepository {
    constructor(private informix: InformixService) { }

    async getEquipmentDataByOs(num_os: string, connection?: InformixConnection): Promise<EquipmentDataSchema> {
        const db = connection || this.informix

        const equipmentResult = await db.query(`
            SELECT UNIQUE
                TRIM(ATIV_OSN.COD_EQUIP) AS COD_EQUIP,
                TRIM(EQUIPAMENTO.COD_UNI_FUNCIO) AS COD_UNI_FUNCIO,
                TRIM(EQUIPAMENTO.COD_EMPRESA) AS COD_EMPRESA
            FROM
                ATIV_OSN,EQUIPAMENTO
            WHERE
                ATIV_OSN.NUM_OS=?
            AND ATIV_OSN.COD_EQUIP=EQUIPAMENTO.COD_EQUIP
            AND ATIV_OSN.COD_EMPRESA=EQUIPAMENTO.COD_EMPRESA`,
            [
                num_os
            ]
        )

        if (!equipmentResult) {
            throw new Error('Equipment data not found.');
        }

        return equipmentDataSchema.parse(equipmentResult[0]);
    }

    async getEquipmentCostCenter(equipmentProps: EquipmentCostCenterSchema, connection?: InformixConnection): Promise<number> {
        const db = connection || this.informix

        const { cod_empresa, cod_uni_funcio } = equipmentProps

        const centroTrabalhoResult = await db.query(`
            SELECT
                cod_centro_custo
            FROM
                UNI_FUNCIONAL
            WHERE
                UNI_FUNCIONAL.COD_EMPRESA=?
                AND UNI_FUNCIONAL.COD_UNI_FUNCIO=?
                AND UNI_FUNCIONAL.DAT_VALIDADE_FIM>CURRENT YEAR TO SECOND`,
            [
                cod_empresa,
                cod_uni_funcio,
            ]
        )

        if (!centroTrabalhoResult) {
            throw new Error('COD_CENTRO_CUSTO not found.');
        }

        return centroTrabalhoResult[0].cod_centro_custo
    }

    async getEquipmentDataByCod(cod_equip: string, connection?: InformixConnection): Promise<GetEquipmentDataByCodSchema> {
        const db = connection || this.informix

        const equipment = await db.query(
            `SELECT cod_empresa, cod_cent_trab FROM equipamento WHERE cod_equip = ?`,
            [cod_equip],
        )

        return equipment[0]
    }
}