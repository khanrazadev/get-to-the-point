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

/*
 * Retrieves all content records.
 *
 * @returns A list of all content records.
 */
export async function getAllContent() {
    return prisma.content.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}

/*
 * Retrieves a content record by its ID.
 *
 * @param id The ID of the content record to retrieve.
 * @returns The content record if found, otherwise null.
*/
export async function getContentById(id: string) {
    return prisma.content.findUnique({
        where: {
            id: id,
        },
    });
}

/*
    * Deletes a content record by its ID.   
*/
export async function deleteContent(id: string) {
    return prisma.content.delete({
        where: {
            id: id,
        },
    });
}