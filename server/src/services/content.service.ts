import { prisma } from "../lib/prisma.js";

import type { CreateContentInput } from "../types/content.types.js";

/**
 * Creates a new content record for the authenticated user.
 *
 * @param userId The authenticated user's ID.
 * @param data Content metadata provided by the client.
 * @returns The newly created content record.
 */
export async function createContent(
    userId: string,
    data: CreateContentInput,
) {
    return prisma.content.create({
        data: {
            userId,
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

/**
 * Retrieves all content records for the authenticated user.
 *
 * @param userId The authenticated user's ID.
 * @returns A list of the user's content records.
 */
export async function getAllContent(userId: string) {
    return prisma.content.findMany({
        where: { userId },
        orderBy: {
            createdAt: "desc",
        },
    });
}

/**
 * Retrieves a content record by its ID for the authenticated user.
 *
 * @param userId The authenticated user's ID.
 * @param id The ID of the content record to retrieve.
 * @returns The content record if found and owned by the user, otherwise null.
 */
export async function getContentById(
    userId: string,
    id: string,
) {
    return prisma.content.findFirst({
        where: {
            id,
            userId,
        },
        include: {
            transcript: true,
            summary: true,
        },
    });
}

/**
 * Deletes a content record by its ID for the authenticated user.
 *
 * @param userId The authenticated user's ID.
 * @param id The ID of the content record to delete.
 * @returns The deleted content record count.
 */
export async function deleteContent(
    userId: string,
    id: string,
) {
    return prisma.content.deleteMany({
        where: {
            id,
            userId,
        },
    });
}

export async function updateContentStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
) {
    return prisma.content.update({
        where: { id },
        data: { status },
    });
}