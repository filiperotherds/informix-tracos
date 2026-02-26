import { Body, Controller, Patch, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import {
    type UpdateMaterialReserveBodySchema,
    updateMaterialReserveBodySchema,
    UpdateMaterialReserveDto,
} from "../schemas/body/update-material-reserve.schema";

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class UpdateMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Patch('/reserve')
    @ApiBody({
        type: UpdateMaterialReserveDto,
        description: 'Update an existing material reserve',
    })
    @UsePipes(new ZodValidationPipe(updateMaterialReserveBodySchema))
    async handle(@Body() {
        tracos_id,
        new_value,
    }: UpdateMaterialReserveBodySchema) {
        await this.materialService.updateReserveValue({
            tracos_id,
            new_value,
        })
    }
}