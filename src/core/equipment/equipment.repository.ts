import { Injectable } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";
import { EquipmentDataSchema, equipmentDataSchema } from "./schemas/equipment-data.schema";
import {
    type EquipmentCostCenterSchema
} from "./schemas/get-equipment-cost-center.schema";
import { GetEquipmentDataByCodSchema } from "./schemas/get-equipment-data-by-cod.schema";

@Injectable()
export class EquipmentRepository {
    constructor(private informix: InformixService) { }

    async getEquipmentDataByOs(num_os: string): Promise<EquipmentDataSchema> {
        const equipmentResult = await this.informix.query(`
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

    async getEquipmentCostCenter(equipmentProps: EquipmentCostCenterSchema): Promise<number> {
        const { cod_empresa, cod_uni_funcio } = equipmentProps

        console.log(cod_empresa, cod_uni_funcio)

        const centroTrabalhoResult = await this.informix.query(`
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

        console.log(centroTrabalhoResult[0].cod_centro_custo)

        return centroTrabalhoResult[0].cod_centro_custo
    }

    async getEquipmentDataByCod(cod_equip: string): Promise<GetEquipmentDataByCodSchema> {
        const equipment = await this.informix.query(
            `SELECT cod_empresa, cod_cent_trab FROM equipamento WHERE cod_equip = ?`,
            [cod_equip],
        )

        return equipment[0]
    }
}