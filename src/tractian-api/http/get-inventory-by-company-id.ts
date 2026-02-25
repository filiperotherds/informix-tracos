import { api } from "../api-client";
import { GetInventoryByCompanyIdResponse } from "../schemas/get-inventory-by-company-id-response";

interface GetInventoryByCompanyIdRequest {
    id: string;
    limit: number;
    page: number;
}

export async function getInventoryByCompanyId({
    id,
    limit,
    page
}: GetInventoryByCompanyIdRequest) {
    const result = await api.get(`supply/companies/${id}/inventory?limit=${limit}&page=${page}`).json<GetInventoryByCompanyIdResponse>()

    return result
}