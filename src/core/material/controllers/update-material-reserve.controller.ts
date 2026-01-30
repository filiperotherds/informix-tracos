import { Body, Controller, Patch, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { MaterialReserveDto } from "../material-reserve.dto";

import z from "zod";

export const updateMaterialReserveBodySchema = z.object({
    cod_item: z.coerce.string(),
    num_os: z.string(),
    tracos_id: z.coerce.string(),
    new_value: z.coerce.number(),
    old_value: z.coerce.number(),
});

export type UpdateMaterialReserveBodySchema = z.infer<typeof updateMaterialReserveBodySchema>;

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
    @UsePipes(new ZodValidationPipe(updateMaterialReserveBodySchema))
    async handle(@Body() {
        cod_item,
        num_os,
        tracos_id,
        new_value,
        old_value
    }: UpdateMaterialReserveBodySchema) {
        await this.materialService.updateReserveValue({
            cod_item,
            num_os,
            tracos_id,
            new_value,
            old_value
        })
    }
}