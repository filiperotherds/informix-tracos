import z from "zod";
import { Injectable } from "@nestjs/common";
import { InformixService } from "../../informix/informix.service";


const materialBalanceSchema = z.coerce.number()

const expenseTypeSchema = z.coerce.number()

@Injectable()
export class ServiceOrderRepository {
    constructor(private informix: InformixService) { }

    async getOrderById() {
        
    }
}