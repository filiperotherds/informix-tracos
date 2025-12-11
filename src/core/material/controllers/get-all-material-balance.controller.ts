import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { MaterialService } from "../material.service";

@ApiTags('Material')
@Controller('/material/balance')
@UseGuards(JwtAuthGuard)
export class GetAllMaterialBalance {
    constructor(private materialService: MaterialService) { }

    @Get()
    async handle() {
        const balance = await this.materialService.getAllMaterialBalance()

        return balance
    }
}