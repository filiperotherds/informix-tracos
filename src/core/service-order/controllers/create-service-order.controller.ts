import {
  Body, Controller,
  Post,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  type ServiceOrderBodySchema,
  serviceOrderBodySchema
} from '../schemas/body/service-order.schema';

import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe';
import { ServiceOrderService } from '../service-order.service';
import { ServiceOrderDto } from '../service-order.dto';

@ApiTags('Ordem de Serviço')
@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class CreateServiceOrder {
  constructor(
    private readonly serviceOrderService: ServiceOrderService
  ) { }

  @Post()
  @ApiBody({
    type: ServiceOrderDto,
  })
  @UsePipes(new ZodValidationPipe(serviceOrderBodySchema))
  async handle(@Body() body: ServiceOrderBodySchema) {
    const {
      num_os,
      cod_equip
    } = body;

    await this.serviceOrderService.create({
      num_os: num_os,
      cod_equip: cod_equip
    })
  }
}
