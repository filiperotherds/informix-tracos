import { Module } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";
import { EquipmentRepository } from "./equipment.repository";
import { EquipmentService } from "./equipment.service";

@Module({
    imports: [],
    controllers: [],
    providers: [
        InformixService,
        EquipmentService,
        EquipmentRepository,
    ],
    exports: [
        EquipmentRepository
    ]
})

export class EquipmentModule { }