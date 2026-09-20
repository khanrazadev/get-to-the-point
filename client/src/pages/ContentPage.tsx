import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { ContentDetails } from "@/types/content";
import { getContentById } from "@/lib/api";


function ContentPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const { getToken } = useAuth();

  const [content, setContent] = useState<ContentDetails | null>(null);
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
          error instanceof Error ? error.message : "Failed to load content",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadContent();
  }, [contentId, getToken]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to library
        </Link>

        <p className="mt-10 text-sm text-destructive">
          {error || "Content not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to library
      </Link>

      <header className="mt-10 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {content.type}
          </span>

          <span className="text-border">/</span>

          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {content.status}
          </span>
        </div>

        <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">
          {content.title ?? content.sourceUrl ?? "Untitled content"}
        </h1>

        {content.sourceUrl && (
          <a
            href={content.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex max-w-full items-center gap-2 truncate text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="truncate">{content.sourceUrl}</span>
            <ExternalLink className="size-4 shrink-0" />
          </a>
        )}
      </header>

      {content.status === "PROCESSING" && (
        <section className="border-b border-border py-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Processing
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            We're working through this content.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The transcript, summary, and searchable knowledge are being
            prepared.
          </p>
        </section>
      )}

      {content.status === "FAILED" && (
        <section className="border-b border-border py-12">
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
      )}

      {content.status === "COMPLETED" && (
        <section className="grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-t border-border pt-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Summary
            </p>

            <div className="mt-5 whitespace-pre-line text-sm leading-7">
              {content.summary?.text ?? "No summary available."}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Transcript
            </p>

            <div className="mt-5 max-h-[32rem] overflow-y-auto whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {content.transcript?.text ?? "No transcript available."}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ContentPage;
