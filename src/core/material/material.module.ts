import { Module } from "@nestjs/common";
import { CreateMaterialReserveController } from "./controllers/create-material-reserve.controller";
import { MaterialService } from "./material.service";
import { XrefRepository } from "./repositories/xref.repository";
import { StockRepository } from "./repositories/stock.repository";
import { ReservationRepository } from "./repositories/reservation.repository";
import { TransactionRepository } from "./repositories/transaction.repository";
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
        CancelMaterialReserveController,
    ],
    providers: [
        MaterialService,
        XrefRepository,
        StockRepository,
        ReservationRepository,
        TransactionRepository,
    ],
    exports: [
        ReservationRepository,
    ],
})
export class MaterialModule { }