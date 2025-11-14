import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InformixService } from '../informix/informix.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation-pipe';
import { z } from 'zod';
import {
  type CreateServiceOrderBodySchema,
  createServiceOrderBodySchema
} from '../schema/create-service-order.schema';

import { date, time } from '../common/formatted-date'

class CreateServiceOrderDto extends createZodDto(createServiceOrderBodySchema) { }

@ApiTags('Ordem de Serviço')
@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class CreateServiceOrder {
  constructor(private informix: InformixService) { }

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

    const orderWithSameId = await this.informix.query(
      `SELECT * FROM os_min WHERE num_os = ?`,
      [num_os],
    );

    if (orderWithSameId[0]) {
      throw new ConflictException('Order with same ID already exists.');
    }

    const equipmentData = await this.informix.query(
      `SELECT cod_empresa, cod_cent_trab FROM equipamento WHERE cod_equip = ?`,
      [cod_equip],
    )

    if (!equipmentData[0]) {
      throw new Error('Equipment not found.');
    }

    const cod_empresa = equipmentData[0].cod_empresa;
    const cod_cent_trab = equipmentData[0].cod_cent_trab;

    await this.informix.query(
      `
        INSERT INTO os_min (
            cod_empresa,
            num_os,
            num_matricula_sol,
            num_matricula_rec,
            dat_solic,
            hor_solic,
            dat_prg_ini_exec,
            dat_prg_fim_exec,
            cod_cent_trab_resp,
            cod_cent_trab_sol,
            ies_tip_os,
            ies_status_os,
            cod_projeto,
            val_custo_estim,
            cod_moeda_custo,
            cod_fornecedor,
            dat_receb,
            hor_receb,
            dat_rprg_ini_exec,
            dat_rprg_fim_exec,
            dat_ini_exec,
            hor_ini_exec,
            dat_conclusao,
            hor_conclusao,
            cod_mot_repr,
            cod_mot_canc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 3095, 3095, 'N', 'R', null, 0, 1, null, null, null, null, null, null, null, null, null, null, null)`,
      [
        cod_empresa,
        num_os,
        cod_cent_trab,
        cod_cent_trab,
        date,
        time,
        date,
        date
      ],
    );

    await this.informix.query(
      `
        INSERT INTO ativ_osn (
          cod_empresa,
          num_os,
          cod_equip,
          cod_motivo_manut,
          des_motivo_manut,
          des_serv_exec,
          des_serv_solic,
          mot_solic_os,
          grupo_ativ,
          ativ,
          dat_ini,
          dat_fim,
          sit_ativ,
          tip_ativ,
          criticid,
          parado,
          centro_trabalho,
          des_ativ_ordem)
        VALUES (?, ?, ?, 0, '', null, 'TRAC_OS', '0', null, 0, null, null, 'A', '0', '1', 'N', ?, '')`,
      [
        cod_empresa,
        num_os,
        cod_equip,
        cod_cent_trab
      ]
    );

  }
}
