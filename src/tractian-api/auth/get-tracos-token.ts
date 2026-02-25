import { PrismaService } from "@/prisma/prisma.service";

export async function getTracosToken() {
    const prisma = new PrismaService()

    const response = await prisma.tracosToken.findFirst({
        select: {
            token: true
        }
    })

    if (!response) {
        throw new Error('Token not found.')
    }

    return response.token
}