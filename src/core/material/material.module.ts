import { Module } from "@nestjs/common";
import { CreateMaterialReserveController } from "./controllers/create-material-reserve.controller";
import { MaterialService } from "./material.service";
import { MaterialRepository } from "./material.repository";
import { EquipmentModule } from "../equipment/equipment.module";
import { GetAllMaterialBalance } from "./controllers/get-all-material-balance.controller";
import { UpdateMaterialReserveController } from "./controllers/update-material-reserve.controller";
import { CancelMaterialReserveController } from "./controllers/cancel-material-reserve.controller";

@Module({
    imports: [
        EquipmentModule
    ],
    controllers: [
        CreateMaterialReserveController,
        GetAllMaterialBalance,
        UpdateMaterialReserveController,
        CancelMaterialReserveController
    ],
    providers: [
        MaterialService,
        MaterialRepository,
    ],
})
export class MaterialModule { }