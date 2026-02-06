import { createZodDto } from "nestjs-zod";
import { materialReserveBodySchema } from "./schemas/body/material-reserve.schema";
import { updateMaterialReserveBodySchema } from "./schemas/body/update-material-reserve.schema";
import { cancelMaterialReserveBodySchema } from "./schemas/body/cancel-material-reserve.scham";

export class MaterialReserveDto extends createZodDto(materialReserveBodySchema) { }

export class UpdateMaterialReserveDto extends createZodDto(updateMaterialReserveBodySchema) { }

export class CancelMaterialReserveDto extends createZodDto(cancelMaterialReserveBodySchema) { }