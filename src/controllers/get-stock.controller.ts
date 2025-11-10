import { Controller, Get, UseGuards } from "@nestjs/common";
import { InformixService } from "../informix/informix.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiParam, ApiTags } from "@nestjs/swagger";

@ApiTags('Estoque')
@Controller('/stock')
@UseGuards(JwtAuthGuard)
export class GetStock {
    constructor(private informix: InformixService) { }

    @Get()
    async handle() {
        const stock = await this.informix.query(`
            SELECT DISTINCT 
                TRIM(item.cod_item) as cod_logix,
                REPLACE((
                    SELECT  sum(el.qtd_saldo)
                        FROM   estoque_lote AS el, estoque AS e, item AS it
                        WHERE  el.cod_empresa = "01"
                        AND    el.cod_item = item.cod_item
                        AND    el.ies_situa_qtd = "L"
                        AND    el.cod_empresa = e.cod_empresa
                        AND    el.cod_item    = e.cod_item
                        AND    el.cod_empresa = it.cod_empresa
                        AND    el.cod_item    = it.cod_item
                ),".",",") as saldo_estoque,
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

        return stock;
    }
}