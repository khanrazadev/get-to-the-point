import { useEffect, useState } from "react";

import { useAuth } from "@clerk/react";
import { useParams } from "react-router-dom";

import ChatSection from "@/components/content/ChatSection";
import ContentHeader from "@/components/content/ContentHeader";
import SummarySection from "@/components/content/SummarySection";
import TranscriptSection from "@/components/content/TranscriptSection";

import { getContentById } from "@/lib/api";

import type { ContentDetails } from "@/types/content";

type ContentTab = "summary" | "transcript";

function ContentPage() {
  const { contentId } = useParams<{
    contentId: string;
  }>();

  const { getToken } = useAuth();

  const [content, setContent] =
    useState<ContentDetails | null>(null);

  const [activeTab, setActiveTab] =
    useState<ContentTab>("summary");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContent() {
      if (!contentId) {
        setError("Content not found");
        setIsLoading(false);
        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          throw new Error("You must be signed in");
        }

        const response = await getContentById(
          contentId,
          token,
        );

        setContent(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load content",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadContent();
  }, [contentId, getToken]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading content...
        </p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-destructive">
          {error || "Content not found"}
        </p>
      </div>
    );
  }

  if (content.status === "PROCESSING") {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <ContentHeader content={content} />

          <section className="py-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Processing
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              We're working through this content.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              The transcript, summary, and searchable knowledge
              are being prepared.
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (content.status === "FAILED") {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <ContentHeader content={content} />

          <section className="py-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-destructive">
              Processing failed
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              We couldn't process this content.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Please try submitting the source again.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <ContentHeader content={content} />
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r lg:pr-8">
            <div className="flex shrink-0 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`border-b-2 px-1 py-4 mr-6 text-sm transition-colors ${
                  activeTab === "summary"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Summary
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transcript")}
                className={`border-b-2 px-1 py-4 text-sm transition-colors ${
                  activeTab === "transcript"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Transcript
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-4">
              {activeTab === "summary" ? (
                <SummarySection
                  text={content.summary?.text ?? null}
                />
              ) : (
                <TranscriptSection
                  text={content.transcript?.text ?? null}
                />
              )}
            </div>
          </section>

          <ChatSection contentId={content.id} />
        </div>
      </div>
    </div>
  );
}

export default ContentPage;