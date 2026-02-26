import { Module } from "@nestjs/common";
import { EquipmentRepository } from "./equipment.repository";
import { EquipmentService } from "./equipment.service";

@Module({
    providers: [
        EquipmentService,
        EquipmentRepository,
    ],
    exports: [
        EquipmentRepository
    ]
})
export class EquipmentModule { }