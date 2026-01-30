import {
    Body, Controller,
    Patch, UseGuards,
    UsePipes
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

import { ZodValidationPipe } from '../../../common/pipes/zod-validation-pipe';
import { ServiceOrderService } from '../service-order.service';
import { updateCodEquipSchema } from '../schemas/update-cod-equip.schema';

class UpdateCodEquipDto extends createZodDto(updateCodEquipSchema) { }

@ApiTags('Ordem de Serviço')
@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class UpdateServiceOrder {
    constructor(
        private serviceOrderService: ServiceOrderService
    ) { }

    @Patch()
    @ApiBody({
        type: UpdateCodEquipDto,
    })
    @UsePipes(new ZodValidationPipe(updateCodEquipSchema))
    async handle(@Body() body: UpdateCodEquipDto) {
        const {
            num_os,
            cod_equip,
        } = body;

        await this.serviceOrderService.updateEquip({
            cod_equip: cod_equip,
            num_os: num_os,
        })
    }
}
