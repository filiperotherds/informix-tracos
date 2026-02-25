import ky from "ky";
import { getTracosToken } from "./auth/get-tracos-token";
import { env } from "@/env";

export const api = ky.create({
    prefixUrl: env.TRACKIAN_API_URL,
    hooks: {
        beforeRequest: [
            async (request) => {
                const token = await getTracosToken();
                request.headers.set('Authorization', `Bearer ${token}`);
            }
        ]
    }
});