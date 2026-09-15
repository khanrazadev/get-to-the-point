import { prisma } from "../lib/prisma.js";
import type { CreateContentInput } from "../types/content.types.js";

/**
 * Creates a new content record for the authenticated user.
 *
 * @param data Content metadata provided by the client.
 * @returns The newly created content record.
 */
export async function createContent(data: CreateContentInput) {
    const user = await prisma.user.findUnique({
        where: {
            email: "dev@local.com",
        },
    });

    if (!user) {
        throw new Error("Development user not found");
    }
    
    return prisma.content.create({
        data: {
            userId: user.id,
            type: data.type,
            ...(data.sourceUrl !== undefined && {
                sourceUrl: data.sourceUrl,
            }),
            ...(data.filePath !== undefined && {
                filePath: data.filePath,
            }),
            ...(data.title !== undefined && {
                title: data.title,
            }),
        },
    });



}