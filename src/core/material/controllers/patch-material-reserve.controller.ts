import { Body, Controller, Patch, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import {
    patchMaterialReserveBodySchema,
    type PatchMaterialReserveBodySchema
} from "../schemas/patch-material-reserve.schema";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";

class PatchMaterialReserveDto extends createZodDto(patchMaterialReserveBodySchema) { }

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class PatcheMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Patch('/reserve')
    @ApiBody({
        type: PatchMaterialReserveDto,
        description: 'Update an existing material reserve',
    })
    @UsePipes(new ZodValidationPipe(patchMaterialReserveBodySchema))
    async handle(@Body() body: PatchMaterialReserveBodySchema) {
        const {
            cod_item,
            num_os,
            qtd_reserva,
            tracos_id
        } = body;

        await this.materialService.patch({
            cod_item,
            num_os,
            qtd_reserva,
            tracos_id
        })
    }
}