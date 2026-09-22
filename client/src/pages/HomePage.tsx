import { useEffect, useRef, useState } from "react";

import { useAuth, useClerk } from "@clerk/react";

import { ArrowUpRight, Link as LinkIcon, Upload } from "lucide-react";

import { createYouTubeContent, getContent, uploadContent } from "@/lib/api";

import type { Content } from "@/types/content";

import ContentList from "@/components/library/ContentList";

type PendingAction =
  | {
      type: "YOUTUBE";
      url: string;
    }
  | {
      type: "UPLOAD";
      file: File;
    }
  | null;

function HomePage() {
  const { getToken, isSignedIn } = useAuth();

  const { openSignIn } = useClerk();

  const [url, setUrl] = useState("");
  const [content, setContent] = useState<Content[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadContent() {
    if (!isSignedIn) {
      setContent([]);
      setIsLoading(false);
      return;
    }

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
        error instanceof Error ? error.message : "Failed to load content",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContent();
  }, [isSignedIn]);

  async function analyzeYouTube(youtubeUrl: string) {
    try {
      setIsSubmitting(true);
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in");
      }

      const response = await createYouTubeContent(youtubeUrl, token);

      setContent((current) => [response.data, ...current]);

      setUrl("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadFile(file: File) {
    try {
      setIsSubmitting(true);
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in");
      }

      const response = await uploadContent(file, token);

      setContent((current) => [response.data, ...current]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload file",
      );
    } finally {
      setIsSubmitting(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit() {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return;
    }

    if (!isSignedIn) {
      setPendingAction({
        type: "YOUTUBE",
        url: trimmedUrl,
      });

      openSignIn();
      return;
    }

    await analyzeYouTube(trimmedUrl);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 100MB or less");

      event.target.value = "";
      return;
    }

    if (!isSignedIn) {
      setPendingAction({
        type: "UPLOAD",
        file,
      });

      event.target.value = "";
      openSignIn();
      return;
    }

    await uploadFile(file);
  }

  useEffect(() => {
    if (!isSignedIn || !pendingAction) {
      return;
    }

    const action = pendingAction;

    setPendingAction(null);

    if (action.type === "YOUTUBE") {
      void analyzeYouTube(action.url);
      return;
    }

    void uploadFile(action.file);
  }, [isSignedIn, pendingAction]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    const hasProcessingContent = content.some(
      (item) => item.status === "PROCESSING",
    );

    if (!hasProcessingContent) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadContent();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [content, isSignedIn]);

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
            Turn videos and audio into concise summaries, searchable
            transcripts, and answers grounded in the original content.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            className="mt-10 max-w-3xl border border-border bg-card"
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <LinkIcon className="hidden size-4 shrink-0 text-muted-foreground sm:block" />

              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste a YouTube or Instagram URL..."
                disabled={isSubmitting}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={!url.trim() || isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Analyzing..." : "Analyze"}

                <ArrowUpRight className="size-4" />
              </button>
            </div>

            <div className="border-t border-border px-4 py-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="size-4" />

                {isSubmitting ? "Processing..." : "Upload audio or video"}
              </button>
            </div>
          </form>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider">
              Recent
            </h2>

            <span className="font-mono text-xs text-muted-foreground">
              {content.length} {content.length === 1 ? "item" : "items"}
            </span>
          </div>

          <ContentList
            content={content}
            isLoading={isLoading}
            onDeleted={(id) => {
              setContent((current) => current.filter((item) => item.id !== id));
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default HomePage;
