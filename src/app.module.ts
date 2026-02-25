import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { envSchema } from './env';
import { AuthModule } from './auth/auth.module';
import { InformixService } from './informix/informix.service';
import { CreateAccountController } from './auth/controllers/create-account.controller';
import { AuthenticateController } from './auth/controllers/authenticate.controller';
import { MaterialModule } from './core/material/material.module';
import { EquipmentModule } from './core/equipment/equipment.module';
import { ServiceOrderModule } from './core/service-order/service-order.module';
import { JobsModule } from './jobs/jobs.module';

/* VÓS QUE ENTRAIS, ABANDONAI TODA A ESPERANÇA */

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    MaterialModule,
    EquipmentModule,
    ServiceOrderModule,
    JobsModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
  ],
  providers: [
    PrismaService,
    InformixService,
  ],
})
export class AppModule { }
