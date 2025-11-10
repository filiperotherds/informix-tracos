import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { CreateAccountController } from './controllers/create-account.controller';
import { envSchema } from './env';
import { AuthModule } from './auth/auth.module';
import { AuthenticateController } from './auth/controllers/authenticate.controller';
import { InformixService } from './informix/informix.service';
import { CreateServiceOrder } from './controllers/create-service-order.controller';
import { GetStock } from './controllers/get-stock.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
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
