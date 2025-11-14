import { Injectable } from "@nestjs/common";
import { EquipmentRepository } from "../equipment/equipment.repository";

@Injectable()
export class EquipmentService {
    constructor(
        private equipmentRepository: EquipmentRepository
    ) { }

}