import { Body, Controller, Delete, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@/common/pipes/zod-validation-pipe";
import { MaterialService } from "../material.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import {
    type CancelMaterialReserveBodySchema,
    cancelMaterialReserveBodySchema
} from "../schemas/body/cancel-material-reserve.scham";
import { CancelMaterialReserveDto } from "../material-reserve.dto";

@ApiTags('Material')
@Controller('/material')
@UseGuards(JwtAuthGuard)
export class CancelMaterialReserveController {
    constructor(private materialService: MaterialService) { }

    @Delete('/reserve')
    @ApiBody({
        type: CancelMaterialReserveDto,
        description: 'Cancel an material reserve',
    })
    @UsePipes(new ZodValidationPipe(cancelMaterialReserveBodySchema))
    async handle(@Body() {
        tracos_id
    }: CancelMaterialReserveBodySchema) {
        await this.materialService.cancelReserve({
            tracos_id: tracos_id,
        })
    }
}