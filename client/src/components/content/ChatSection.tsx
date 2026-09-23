import { useEffect, useRef, useState } from "react";

import { useAuth } from "@clerk/react";
import { ArrowUp, Loader2 } from "lucide-react";

import { getChatSession, sendChatMessage } from "@/lib/api";

type ChatMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

type ChatSectionProps = {
  contentId: string;
};

function ChatSection({ contentId }: ChatSectionProps) {
  const { getToken } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  async function handleSubmit() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in");
      }

      setQuestion("");

      setMessages((current) => [
        ...current,
        {
          role: "USER",
          content: trimmedQuestion,
        },
      ]);

      const response = await sendChatMessage(
        contentId,
        trimmedQuestion,
        token,
        sessionId,
      );

      setSessionId(response.sessionId);

      setMessages((current) => [
        ...current,
        {
          role: "ASSISTANT",
          content: response.answer,
        },
      ]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    async function loadChatSession() {
      try {
        const token = await getToken();

        if (!token) {
          return;
        }

        const response = await getChatSession(contentId, token);

        if (!response.data) {
          return;
        }

        setSessionId(response.data.id);
        setMessages(response.data.messages);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load chat history",
        );
      }
    }

    void loadChatSession();
  }, [contentId, getToken]);

  return (
    <section className="mt-10 flex min-h-0 flex-col lg:mt-0 lg:border-l lg:border-white/6 lg:pl-10">
      <div className="shrink-0 pb-5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent" />

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Ask the archive
          </p>
        </div>

        <h2 className="mt-2 text-sm font-medium text-foreground">
          Chat with this content
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {messages.length === 0 && !isSending ? (
          <div className="flex h-full min-h-56 items-center justify-center">
            <div className="max-w-xs text-center">
              <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <span className="text-sm">✦</span>
              </div>

              <p className="mt-4 text-sm text-foreground">
                Ask anything about this content.
              </p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Ask about the transcript, ideas, arguments, or details covered
                here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-7">
            {messages.map((message, index) => {
              const isUser = message.role === "USER";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={isUser ? "flex justify-end" : "flex justify-start"}
                >
                  {isUser ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-sm leading-6 text-accent-foreground">
                      {message.content}
                    </div>
                  ) : (
                    <p className="max-w-[92%] whitespace-pre-line text-sm leading-7 text-foreground/85">
                      {message.content}
                    </p>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start">
                <Loader2 className="size-4 animate-spin text-accent" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 pt-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="rounded-xl bg-card p-1.5 ring-1 ring-white/6 transition-all focus-within:ring-accent/30"
        >
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Ask something..."
            rows={2}
            disabled={isSending}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[9px] text-muted-foreground">
              Enter to send · Shift + Enter for new line
            </span>

            <button
              type="submit"
              disabled={!question.trim() || isSending}
              className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-25"
            >
              {isSending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ArrowUp className="size-3.5" />
              )}
            </button>
          </div>
        </form>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </section>
  );
}

export default ChatSection;