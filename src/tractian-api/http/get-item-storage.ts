import { api } from "../api-client";
import { GetItemStorageResponse } from "../schemas/get-item-storage-response";

interface GetItemStorageRequest {
    id: string;
}

export async function getItemStorage({
    id,
}: GetItemStorageRequest) {
    const result = await api.get(`item-storage/item-id/${id}`).json<GetItemStorageResponse>()

    return result
}