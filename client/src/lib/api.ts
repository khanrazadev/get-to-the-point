import type { ChatResponse } from "@/types/chat";
import type { Content, ContentDetails } from "@/types/content";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Missing VITE_API_URL");
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

async function apiRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(data?.message ?? "Request failed");
  }

  return response.json();
}

export async function createYouTubeContent(
  url: string,
  token: string,
) {
  return apiRequest<ApiResponse<Content>>(
    "/api/content/youtube",
    token,
    {
      method: "POST",
      body: JSON.stringify({ url }),
    },
  );
}

export async function getContent(token: string) {
  return apiRequest<ApiResponse<Content[]>>(
    "/api/content",
    token,
  );
}

export async function getContentById(
  id: string,
  token: string,
) {
  return apiRequest<ApiResponse<ContentDetails>>(
    `/api/content/${id}`,
    token,
  );
}

export async function sendChatMessage(
  contentId: string,
  question: string,
  token: string,
  sessionId?: string,
) {
  return apiRequest<ChatResponse>(
    `/api/content/${contentId}/chat`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        question,
        ...(sessionId && { sessionId }),
      }),
    },
  );
}