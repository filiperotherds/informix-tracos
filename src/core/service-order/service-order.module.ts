import { Module } from "@nestjs/common";
import { CreateServiceOrder } from "./controllers/create-service-order.controller";
import { ServiceOrderService } from "./service-order.service";
import { EquipmentModule } from "../equipment/equipment.module";
import { ServiceOrderRepository } from "./service-order.repository";
import { FinishServiceOrder } from "./controllers/finish-service-order.controller";
import { UpdateServiceOrder } from "./controllers/update-service-order.controller";

@Module({
    imports: [
        EquipmentModule
    ],
    controllers: [
        CreateServiceOrder,
        FinishServiceOrder,
        UpdateServiceOrder
    ],
    providers: [
        ServiceOrderService,
        ServiceOrderRepository
    ],
})
export class ServiceOrderModule { }