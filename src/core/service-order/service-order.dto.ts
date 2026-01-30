import { createZodDto } from "nestjs-zod";
import { serviceOrderBodySchema } from "./schemas/body/service-order.schema";

export class ServiceOrderDto extends createZodDto(serviceOrderBodySchema) { }