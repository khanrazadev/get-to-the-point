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
  const { contentId } = useParams<{ contentId: string }>();
  const { getToken } = useAuth();

  const [content, setContent] = useState<ContentDetails | null>(null);
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

        const response = await getContentById(contentId, token);

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
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Loading archive...
        </p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-destructive">
            {error || "Content not found"}
          </p>
        </div>
      </div>
    );
  }

  if (content.status === "PROCESSING") {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Processing
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            Your content is still being analyzed.
          </p>
        </div>
      </div>
    );
  }

  if (content.status === "FAILED") {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-destructive">
            Processing failed
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            We couldn&apos;t process this content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(#a7b79a 1px, transparent 1px),
            linear-gradient(90deg, #a7b79a 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black, transparent 75%)",
        }}
      />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col px-5 sm:px-8">
        <div className="shrink-0 py-7 sm:py-9">
          <ContentHeader content={content} />
        </div>

        <div className="min-h-0 flex-1 pb-6">
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="flex min-h-0 flex-col lg:pr-12">
              <div className="flex shrink-0 items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`relative pb-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    activeTab === "summary"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Summary

                  {activeTab === "summary" && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("transcript")}
                  className={`relative pb-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    activeTab === "transcript"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Transcript

                  {activeTab === "transcript" && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
                  )}
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pt-8 pr-2">
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
    </div>
  );
}

export default ContentPage;