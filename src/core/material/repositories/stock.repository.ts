import z from 'zod';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InformixService, InformixConnection } from '../../../informix/informix.service';
import { type GetMaterialSchema } from '../schemas/get-material.schema';
import { getAllMaterialSchema, GetAllMaterialSchema } from '../schemas/get-all-material.schema';
import { UpdateEstoque } from '../schemas/update-estoque.schema';
import { UpdateEstoqueQtdLiberada } from '../schemas/update-estoque-qtd-liberada.schema';

const materialBalanceSchema = z.coerce.number();
const expenseTypeSchema = z.coerce.number();

@Injectable()
export class StockRepository {
    private readonly logger = new Logger(StockRepository.name);

    constructor(private readonly informix: InformixService) { }

    async getMaterialBalance(
        { cod_item, cod_empresa }: GetMaterialSchema,
        connection?: InformixConnection,
    ): Promise<number> {
        const db = connection || this.informix;

        const balanceResult = await db.query(
            `SELECT
                sum(qtd_saldo) AS qtd
            FROM
                estoque_lote
            WHERE
                cod_item = ?
                AND cod_empresa = ?`,
            [cod_item, cod_empresa],
        );

        return materialBalanceSchema.parse(balanceResult[0].qtd);
    }

    async getExpenseType(
        { cod_item, cod_empresa }: GetMaterialSchema,
        connection?: InformixConnection,
    ): Promise<number> {
        const db = connection || this.informix;

        const expenseTypeResult = await db.query(
            `SELECT
                cod_tip_despesa
            FROM
                ITEM_SUP
            WHERE
                COD_EMPRESA=?
                AND COD_ITEM=?`,
            [cod_empresa, cod_item],
        );

        if (!expenseTypeResult) {
            throw new ConflictException('Expense type not found.');
        }

        return expenseTypeSchema.parse(expenseTypeResult[0].cod_tip_despesa);
    }

    async getReservedMaterial(
        { cod_item, cod_empresa }: { cod_item: string; cod_empresa: string },
        connection?: InformixConnection,
    ) {
        const db = connection || this.informix;

        const reservedMaterial = await db.query(
            `SELECT
                qtd_reservada
            FROM
                ESTOQUE
            WHERE
                cod_empresa = ?
                AND cod_item = ?`,
            [cod_empresa, cod_item],
        );

        return reservedMaterial[0].qtd_reservada;
    }

    async getAllMaterialBalance(connection?: InformixConnection): Promise<GetAllMaterialSchema> {
        const db = connection || this.informix;

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
            WHERE item.cod_empresa = "01"
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

        return getAllMaterialSchema.parse(response);
    }

    async updateEstoqueQtdReservada(
        { cod_empresa, cod_item, qtd_reserva }: UpdateEstoque,
        connection?: InformixConnection,
    ) {
        const db = connection || this.informix;

        await db.query(
            `UPDATE 
                estoque
            SET
                qtd_reservada = ?
            WHERE
                cod_empresa = ?
                AND cod_item = ?`,
            [qtd_reserva, cod_empresa, cod_item],
        );
    }

    async updateEstoqueQtdLiberada(
        { qtd_liberada, cod_empresa, cod_item }: UpdateEstoqueQtdLiberada,
        connection?: InformixConnection,
    ) {
        const db = connection || this.informix;

        await db.query(
            `UPDATE
                ESTOQUE 
            SET
                QTD_LIBERADA = ?
            WHERE
                COD_EMPRESA = ?
                AND COD_ITEM = ?`,
            [qtd_liberada, cod_empresa, cod_item],
        );

        this.logger.debug(`Stock released quantity updated for item ${cod_item}`);
    }
}
