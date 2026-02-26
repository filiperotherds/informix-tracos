import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { envSchema } from './env';
import { AuthModule } from './auth/auth.module';
import { InformixModule } from './informix/informix.module';
import { PrismaModule } from './prisma/prisma.module';
import { TractianApiModule } from './tractian-api/tractian-api.module';
import { MaterialModule } from './core/material/material.module';
import { EquipmentModule } from './core/equipment/equipment.module';
import { ServiceOrderModule } from './core/service-order/service-order.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    InformixModule,
    PrismaModule,
    TractianApiModule,
    AuthModule,
    MaterialModule,
    EquipmentModule,
    ServiceOrderModule,
    JobsModule,
  ],
})
export class AppModule { }
