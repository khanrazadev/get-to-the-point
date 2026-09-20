import { useEffect, useState } from "react";

import { useAuth } from "@clerk/react";
import {
  ArrowUpRight,
  Link as LinkIcon,
  Upload,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  createYouTubeContent,
  getContent,
} from "@/lib/api";

import type { Content } from "@/types/content";

import ContentList from "@/components/library/ContentList";

function HomePage() {
  const { getToken } = useAuth();

  const [url, setUrl] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadContent() {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in");
      }

      const response = await getContent(token);

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

  useEffect(() => {
    void loadContent();
  }, []);

  async function handleSubmit() {
    if (!url.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in");
      }

      const response = await createYouTubeContent(
        url.trim(),
        token,
      );

      setContent((current) => [
        response.data,
        ...current,
      ]);

      setUrl("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <section className="shrink-0 border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Editorial Intelligence Archive
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Make sense of the things you don't have time to watch.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Turn videos and audio into concise summaries,
            searchable transcripts, and answers grounded in
            the original content.
          </p>

          <div className="mt-10 max-w-3xl border border-border bg-card">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <LinkIcon className="hidden size-4 shrink-0 text-muted-foreground sm:block" />

              <input
                type="url"
                value={url}
                onChange={(event) =>
                  setUrl(event.target.value)
                }
                placeholder="Paste a YouTube or Instagram URL..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Analyzing..." : "Analyze"}

                <ArrowUpRight className="size-4" />
              </button>
            </div>

            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Upload className="size-4" />
                Upload audio or video
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider">
              Recent
            </h2>

            <span className="font-mono text-xs text-muted-foreground">
              {content.length}{" "}
              {content.length === 1
                ? "item"
                : "items"}
            </span>
          </div>

          <ContentList
            content={content}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
}

export default HomePage;