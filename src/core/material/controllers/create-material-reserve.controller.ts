import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import {
    type MaterialReserveBodySchema,
    materialReserveBodySchema
} from "../schemas/body/material-reserve.schema";
import { MaterialReserveDto } from "../material-reserve.dto";

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class CreateMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Post('/reserve')
    @ApiBody({
        type: MaterialReserveDto,
        description: 'Create a new material reserve',
    })
    @UsePipes(new ZodValidationPipe(materialReserveBodySchema))
    async handle(@Body() {
        cod_item,
        num_os,
        qtd_reserva,
        tracos_id
    }: MaterialReserveBodySchema) {
        await this.materialService.createReserve({
            cod_item,
            num_os,
            qtd_reserva,
            tracos_id
        })
    }
}