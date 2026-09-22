import { prisma } from "../lib/prisma.js";

type CreateChatSessionInput = {
  userId: string;
  contentId: string;
};

export async function createChatSession(
  data: CreateChatSessionInput,
) {
  return prisma.chatSession.create({
    data: {
      userId: data.userId,
      contentId: data.contentId,
    },
  });
}

export async function createMessage(data: {
  sessionId: string;
  role: "USER" | "ASSISTANT";
  content: string;
}) {
  return prisma.message.create({
    data,
  });
}

export async function getOrCreateChatSession(data: {
  userId: string;
  contentId: string;
  sessionId?: string;
}) {
  if (data.sessionId) {
    return prisma.chatSession.findFirstOrThrow({
      where: {
        id: data.sessionId,
        userId: data.userId,
        contentId: data.contentId,
      },
    });
  }

  return createChatSession({
    userId: data.userId,
    contentId: data.contentId,
  });
}

export async function getChatHistory(sessionId: string) {
  return prisma.message.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      role: true,
      content: true,
    },
  });
}

export async function getChatSession(
  userId: string,
  contentId: string,
) {
  return prisma.chatSession.findFirst({
    where: {
      userId,
      contentId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          role: true,
          content: true,
        },
      },
    },
  });
}