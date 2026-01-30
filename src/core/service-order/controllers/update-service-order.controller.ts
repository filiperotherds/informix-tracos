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
import { ServiceOrderDto } from '../service-order.dto';
import {
    serviceOrderBodySchema,
    type ServiceOrderBodySchema
} from '../schemas/body/service-order.schema';

@ApiTags('Ordem de Serviço')
@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class UpdateServiceOrder {
    constructor(
        private serviceOrderService: ServiceOrderService
    ) { }

    @Patch()
    @ApiBody({
        type: ServiceOrderDto,
    })
    @UsePipes(new ZodValidationPipe(serviceOrderBodySchema))
    async handle(@Body() body: ServiceOrderBodySchema) {
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
