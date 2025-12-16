import { createZodDto } from "nestjs-zod";
import { materialReserveBodySchema } from "./schemas/body/material-reserve-body.schema";

export class MaterialReserveDto extends createZodDto(materialReserveBodySchema) { }