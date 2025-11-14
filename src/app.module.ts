import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { envSchema } from './env';
import { AuthModule } from './auth/auth.module';
import { InformixService } from './informix/informix.service';
import { CreateAccountController } from './auth/controllers/create-account.controller';
import { AuthenticateController } from './auth/controllers/authenticate.controller';
import { CreateServiceOrder } from './controllers/create-service-order.controller';
import { GetStock } from './controllers/get-stock.controller';
import { MaterialModule } from './core/material/material.module';
import { EquipmentModule } from './core/equipment/equipment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    MaterialModule,
    EquipmentModule
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateServiceOrder,
    GetStock,
  ],
  providers: [PrismaService, InformixService],
})
export class AppModule { }
