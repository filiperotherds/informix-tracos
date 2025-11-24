import { ConflictException, Injectable } from "@nestjs/common";
import { ServiceOrderRepository } from "./service-order.repository";
import { CreateServiceOrderBodySchema } from "./schemas/create-service-order.schema";
import { EquipmentRepository } from "../equipment/equipment.repository";

@Injectable()
export class ServiceOrderService {
    constructor(
        private serviceOrderRepository: ServiceOrderRepository,
        private equipementRepository: EquipmentRepository
    ) { }

    async create(serviceOrderProps: CreateServiceOrderBodySchema) {
        const { cod_equip, num_os } = serviceOrderProps

        const orderWithSameId = await this.serviceOrderRepository.getOrderById(num_os)

        if (orderWithSameId) {
            throw new ConflictException('Order with same ID already exists.');
        }

        console.log(cod_equip, num_os)

        const equipment = await this.equipementRepository.getEquipmentDataByCod(cod_equip)

        if (!equipment) {
            throw new ConflictException('Equipment data not found.')
        }

        const { cod_cent_trab, cod_empresa } = equipment

        await this.serviceOrderRepository.create({
            num_os: num_os,
            cod_empresa: cod_empresa,
            cod_cent_trab: cod_cent_trab,
            cod_equip: cod_equip
        })
    }
}