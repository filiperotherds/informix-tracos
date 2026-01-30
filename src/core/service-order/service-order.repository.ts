import z from "zod";
import { Injectable } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";
import { CreateSchema } from "./schemas/create.schema";
import { UpdateOsMin } from "./schemas/update-os-min.schema";
import { UpdateAtivOsn } from "./schemas/update-ativ-osn.schema";
import { UpdateCodEquipSchema } from "./schemas/update-cod-equip.schema";

const materialBalanceSchema = z.coerce.number()

const expenseTypeSchema = z.coerce.number()

@Injectable()
export class ServiceOrderRepository {
    constructor(private informix: InformixService) { }

    async getOrderById(num_os: string, connection?: any) {
        const db = connection || this.informix

        const order = await db.query(
            `SELECT * FROM os_min WHERE num_os = ?`,
            [num_os],
        );

        return order[0]
    }

    async create({
        cod_cent_trab,
        cod_empresa,
        num_os,
        cod_equip
    }: CreateSchema, connection?: any) {
        const db = connection || this.informix

        const transactionDate = new Date()

        const dateString = transactionDate.toISOString().slice(0, 10)
        const timeString = transactionDate.toTimeString().slice(0, 8)

        await db.query(`
            INSERT INTO os_min (
                cod_empresa,
                num_os,
                cod_cent_trab_resp,
                cod_cent_trab_sol,
                dat_solic,
                hor_solic,
                dat_prg_ini_exec,
                dat_prg_fim_exec,
                num_matricula_sol,
                num_matricula_rec,
                ies_tip_os,
                ies_status_os,
                cod_projeto,
                val_custo_estim,
                cod_moeda_custo,
                cod_fornecedor,
                dat_receb,
                hor_receb,
                dat_rprg_ini_exec,
                dat_rprg_fim_exec,
                dat_ini_exec,
                hor_ini_exec,
                dat_conclusao,
                hor_conclusao,
                cod_mot_repr,
                cod_mot_canc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 3095, 3095, 'N', 'A', null, 0, 1, null, null, null, null, null, null, null, null, null, null, null)`,
            [
                cod_empresa,
                num_os,
                cod_cent_trab,
                cod_cent_trab,
                dateString,
                timeString,
                dateString,
                dateString
            ],
        );

        await db.query(`
            INSERT INTO ativ_osn (
            cod_empresa,
            num_os,
            cod_equip,
            cod_motivo_manut,
            des_motivo_manut,
            des_serv_exec,
            des_serv_solic,
            mot_solic_os,
            grupo_ativ,
            ativ,
            dat_ini,
            dat_fim,
            sit_ativ,
            tip_ativ,
            criticid,
            parado,
            centro_trabalho,
            des_ativ_ordem)
            VALUES (?, ?, ?, 0, '', null, 'TRAC_OS', '0', null, 0, null, null, 'A', '0', '1', 'N', ?, '')`,
            [
                cod_empresa,
                num_os,
                cod_equip,
                cod_cent_trab
            ]
        );
    }

    async updateOsMin({
        ies_status_os,
        cod_empresa,
        num_os
    }: UpdateOsMin, connection?: any) {
        const db = connection || this.informix

        const transactionDate = new Date()

        const dateString = transactionDate.toISOString().slice(0, 10)
        const timeString = transactionDate.toTimeString().slice(0, 8)

        await db.query(`
            UPDATE
                os_min
            SET 
                ies_status_os = ?,
                dat_ini_exec  = ?,
                dat_conclusao = ?,
                hor_conclusao = ?
            WHERE
                cod_empresa = ?
                AND num_os = ?
            `,
            [
                ies_status_os,
                dateString,
                dateString,
                timeString,
                cod_empresa,
                num_os
            ]);
    }

    async updateAtivOsn({
        des_serv_exec,
        cod_empresa,
        num_os,
        cod_equip
    }: UpdateAtivOsn, connection?: any) {
        const db = connection || this.informix

        await db.query(`
            UPDATE
                ativ_osn
            SET 
                des_serv_exec = ?
            WHERE
                ativ_osn.cod_empresa = ?
                AND ativ_osn.num_os = ?
                AND ativ_osn.cod_equip = ?
            `,
            [
                des_serv_exec,
                cod_empresa,
                num_os,
                cod_equip
            ]);
    }

    async updateCodEquip({
        num_os,
        cod_equip,
        cod_empresa,
        cod_cent_trab
    }: UpdateCodEquipSchema, connection?: any) {
        const db = connection || this.informix

        await db.query(`
                UPDATE
                    os_min
                SET
                    cod_cent_trab_sol = ?,
                    cod_cent_trab_resp = ?
                WHERE
                    cod_empresa = ?
                    AND num_os = ?`,
            [
                cod_cent_trab,
                cod_cent_trab,
                cod_empresa,
                num_os
            ]
        )

        await db.query(`
                UPDATE
                    ativ_osn
                SET
                    cod_equip = ?,
                    centro_trabalho = ?
                WHERE
                    cod_empresa = ?
                    AND num_os = ?`,
            [
                cod_equip,
                cod_cent_trab,
                cod_empresa,
                num_os
            ]
        )
    }
}