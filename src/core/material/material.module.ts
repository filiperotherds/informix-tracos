import { Module } from "@nestjs/common";
import { CreateMaterialReserveController } from "./controllers/create-material-reserve.controller";
import { InformixService } from "../../informix/informix.service";
import { MaterialService } from "./material.service";
import { MaterialRepository } from "./material.repository";
import { EquipmentModule } from "../equipment/equipment.module";

@Module({
    imports: [
        EquipmentModule
    ],
    controllers: [
        CreateMaterialReserveController
    ],
    providers: [
        InformixService,
        MaterialService,
        MaterialRepository,
    ],
})

export class MaterialModule { }