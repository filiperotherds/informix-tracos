import { ConflictException, Injectable } from "@nestjs/common";
import { ServiceOrderRepository } from "./service-order.repository";
import { ServiceOrderBodySchema } from "./schemas/body/service-order.schema";
import { EquipmentRepository } from "../equipment/equipment.repository";
import { InformixService, InformixConnection } from "@/informix/informix.service";
import { UpdateCodEquipSchema } from "./schemas/update-cod-equip.schema";

@Injectable()
export class ServiceOrderService {
    constructor(
        private serviceOrderRepository: ServiceOrderRepository,
        private equipementRepository: EquipmentRepository,
        private informixService: InformixService
    ) { }

    async create({ cod_equip, num_os }: ServiceOrderBodySchema, connection?: InformixConnection) {
        return this.informixService.transaction(async (connection) => {
            const orderWithSameId = await this.serviceOrderRepository.getOrderById(num_os, connection)

            if (orderWithSameId) {
                throw new ConflictException('Order with same ID already exists.');
            }

            const equipment = await this.equipementRepository.getEquipmentDataByCod(cod_equip, connection)

            if (!equipment) {
                throw new ConflictException('Equipment data not found.')
            }

            const { cod_cent_trab, cod_empresa } = equipment

            await this.serviceOrderRepository.create({
                num_os: num_os,
                cod_empresa: cod_empresa,
                cod_cent_trab: cod_cent_trab,
                cod_equip: cod_equip
            }, connection)
        })
    }

    async finish({
        cod_equip,
        num_os
    }: ServiceOrderBodySchema) {
        return this.informixService.transaction(async (connection) => {

            const { cod_cent_trab, cod_empresa } = await this.equipementRepository.getEquipmentDataByCod(cod_equip, connection)

            await this.serviceOrderRepository.updateOsMin({
                cod_empresa,
                num_os,
                ies_status_os: 'R'
            }, connection)

            await this.serviceOrderRepository.updateAtivOsn({
                cod_empresa,
                cod_equip,
                num_os,
                des_serv_exec: 'Ordem realizada via TracOs'
            }, connection)
        })
    }

    async updateEquip({
        cod_equip,
        num_os
    }: UpdateCodEquipSchema, connection?: InformixConnection) {
        const { cod_cent_trab, cod_empresa } = await this.equipementRepository.getEquipmentDataByCod(cod_equip, connection)

        await this.serviceOrderRepository.updateCodEquip({
            cod_empresa,
            cod_equip,
            num_os,
            cod_cent_trab,
        })
    }
}