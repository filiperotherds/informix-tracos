import { Module } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";
import { CreateServiceOrder } from "./controllers/create-service-order.controller";
import { EquipmentService } from "../equipment/equipment.service";
import { ServiceOrderService } from "./service-order.service";
import { EquipmentModule } from "../equipment/equipment.module";
import { ServiceOrderRepository } from "./service-order.repository";
import { FinishServiceOrder } from "./controllers/finish-service-order.controller";

@Module({
    imports: [
        EquipmentModule
    ],
    controllers: [
        CreateServiceOrder,
        FinishServiceOrder
    ],
    providers: [
        InformixService,
        ServiceOrderService,
        ServiceOrderRepository
    ],
})

export class ServiceOrderModule { }