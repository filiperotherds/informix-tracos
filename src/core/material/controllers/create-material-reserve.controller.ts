import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import {
    createMaterialReserveBodySchema,
    type CreateMaterialReserveBodySchema
} from "../schemas/material-reserve.schema";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";

class CreateMaterialReserveDto extends createZodDto(createMaterialReserveBodySchema) { }

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class CreateMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Post('/reserve')
    @ApiBody({
        type: CreateMaterialReserveDto,
        description: 'Create a new material reserve',
    })
    @UsePipes(new ZodValidationPipe(createMaterialReserveBodySchema))
    async handle(@Body() body: CreateMaterialReserveBodySchema) {
        const {
            cod_item,
            num_os,
            qtd_reserva,
            tracos_id
        } = body;

        await this.materialService.create({
            cod_item: cod_item,
            num_os: num_os,
            qtd_reserva: qtd_reserva,
            tracos_id: tracos_id
        })
    }
}