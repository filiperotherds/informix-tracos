import { Module } from "@nestjs/common";
import { CreateMaterialReserveController } from "./controllers/create-material-reserve.controller";
import { InformixService } from "../../informix/informix.service";
import { MaterialService } from "./material.service";
import { MaterialRepository } from "./material.repository";
import { EquipmentModule } from "../equipment/equipment.module";
import { GetAllMaterialBalance } from "./controllers/get-all-material-balance.controller";
import { UpdateMaterialReserveController } from "./controllers/update-material-reserve.controller";
import { PrismaService } from "@/prisma/prisma.service";
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
        InformixService,
        MaterialService,
        MaterialRepository,
        PrismaService
    ],
})

export class MaterialModule { }