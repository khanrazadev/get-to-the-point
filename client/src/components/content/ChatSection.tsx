import { useState } from "react";

import { useAuth } from "@clerk/react";
import { ArrowUp, Loader2 } from "lucide-react";

import { sendChatMessage } from "@/lib/api";

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

      setMessages((current) => [
        ...current,
        {
          role: "USER",
          content: trimmedQuestion,
        },
      ]);

      setQuestion("");

      const response = await sendChatMessage(
        contentId,
        trimmedQuestion,
        token,
        sessionId,
      );

      console.log("CHAT RESPONSE:", response);

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

  return (
    <section className="flex min-h-0 flex-col lg:pl-8">
      <div className="shrink-0 border-b border-border py-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Ask the archive
        </p>

        <h2 className="mt-1 text-base font-medium">Chat with this content</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <div className="max-w-xs">
            <p className="text-sm leading-6 text-muted-foreground">
              Ask a question about the transcript, ideas, or anything covered in
              this content.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {message.role === "USER" ? "You" : "Archive"}
                </p>

                <p className="whitespace-pre-line text-sm leading-7">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="border border-border bg-card"
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
            rows={3}
            disabled={isSending}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="text-[11px] text-muted-foreground">
              Enter to send
            </span>

            <button
              type="submit"
              disabled={!question.trim() || isSending}
              className="inline-flex size-8 items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
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
