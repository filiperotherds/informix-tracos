import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import {
    createMaterialRequisitionBodySchema,
    type CreateMaterialRequisitionBodySchema
} from "../schemas/material-requisition-body.schema";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";

class CreateMaterialRequisitionDto extends createZodDto(createMaterialRequisitionBodySchema) { }

@ApiTags('Requisição de Material')
@Controller('/material/requisition')
@UseGuards(JwtAuthGuard)
export class CreateMaterialReserveController {
    constructor(private materialService: MaterialService) { }

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

        await this.materialService.create({ 
            cod_item: cod_item,
            num_os: num_os,
            qtd_reserva: qtd_reserva, 
        })
    }
}