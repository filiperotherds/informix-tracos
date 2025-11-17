import {
  Body, Controller,
  Post,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import {
  type CreateServiceOrderBodySchema,
  createServiceOrderBodySchema
} from '../schemas/create-service-order.schema';

import { ZodValidationPipe } from '../../../common/pipes/zod-validation-pipe';
import { ServiceOrderService } from '../service-order.service';

class CreateServiceOrderDto extends createZodDto(createServiceOrderBodySchema) { }

@ApiTags('Ordem de Serviço')
@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class CreateServiceOrder {
  constructor(
    private serviceOrderService: ServiceOrderService
  ) { }

  @Post()
  @ApiBody({
    type: CreateServiceOrderDto,
  })
  @UsePipes(new ZodValidationPipe(createServiceOrderBodySchema))
  async handle(@Body() body: CreateServiceOrderBodySchema) {
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
