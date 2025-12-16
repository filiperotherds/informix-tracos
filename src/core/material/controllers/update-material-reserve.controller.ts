import { Body, Controller, Patch, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import {
    materialReserveBodySchema,
    type MaterialReserveBodySchema
} from "../schemas/body/material-reserve-body.schema";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { MaterialReserveDto } from "../material-reserve.dto";

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class UpdateMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Patch('/reserve')
    @ApiBody({
        type: MaterialReserveDto,
        description: 'Update an existing material reserve',
    })
    @UsePipes(new ZodValidationPipe(materialReserveBodySchema))
    async handle(@Body() body: MaterialReserveBodySchema) {
        const {
            cod_item,
            num_os,
            qtd_reserva,
            tracos_id
        } = body;

        await this.materialService.cancelReserve({
            cod_item,
            num_os,
            qtd_reserva,
            tracos_id
        })
    }
}