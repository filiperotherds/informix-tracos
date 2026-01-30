import { Body, Controller, Patch, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import {
    type MaterialReserveBodySchema,
    materialReserveBodySchema
} from "../schemas/body/material-reserve-body.schema";
import { MaterialReserveDto } from "../material-reserve.dto";

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class CancelMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Patch('/cancel-reserve')
    @ApiBody({
        type: MaterialReserveDto,
        description: 'Cancel an material reserve',
    })
    @UsePipes(new ZodValidationPipe(materialReserveBodySchema))
    async handle(@Body() {
        cod_item,
        num_os,
        qtd_reserva,
        tracos_id
    }: MaterialReserveBodySchema) {
        await this.materialService.cancelReserve({
            cod_item: cod_item,
            num_os: num_os,
            qtd_reserva: qtd_reserva,
            tracos_id: tracos_id
        })
    }
}