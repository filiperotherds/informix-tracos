import { Module } from "@nestjs/common";
import { CreateMaterialReserveController } from "./controllers/create-material-reserve.controller";
import { InformixService } from "../../informix/informix.service";
import { MaterialService } from "./material.service";
import { MaterialRepository } from "./material.repository";
import { EquipmentModule } from "../equipment/equipment.module";
import { GetAllMaterialBalance } from "./controllers/get-all-material-balance.controller";

@Module({
    imports: [
        EquipmentModule
    ],
    controllers: [
        CreateMaterialReserveController,
        GetAllMaterialBalance
    ],
    providers: [
        InformixService,
        MaterialService,
        MaterialRepository,
    ],
})

export class MaterialModule { }