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
      (item) => item.status === "PENDING" || item.status === "PROCESSING",
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
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -inset-25 animate-grid-drift opacity-[0.08]"
          style={{
            backgroundImage: `
            linear-gradient(#6cae12 1px, transparent 1px),
            linear-gradient(90deg, #6cae12 1px, transparent 1px)
          `,
            backgroundSize: "100px 100px",
            maskImage:
              "radial-gradient(ellipse at center, black 15%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 15%, transparent 78%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 pb-20 sm:px-8">
        <section className="relative flex flex-col items-center pt-20 text-center sm:pt-28">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            Editorial Intelligence Archive
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-foreground sm:text-7xl">
            Make sense of the things you don&apos;t have time to watch.
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Turn videos and audio into concise summaries, searchable
            transcripts, and answers grounded in the original content.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            className="mt-10 w-full max-w-xl"
          >
            <div className="flex items-center rounded-xl bg-card p-1.5 ring-1 ring-white/6 transition-all duration-300 focus-within:ring-accent/30 focus-within:shadow-[0_0_30px_rgba(108,174,18,0.08)]">
              <LinkIcon className="ml-3 size-4 shrink-0 text-muted-foreground" />

              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste a YouTube or Instagram URL..."
                disabled={isSubmitting}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!url.trim() || isSubmitting}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isSubmitting ? "Analyzing..." : "Analyze"}

                <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </div>

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
              className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Upload className="size-3.5" />

              {isSubmitting ? "Processing..." : "Upload audio or video"}
            </button>
          </form>

          {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
        </section>

        <section className="relative mx-auto mt-24 w-full max-w-4xl">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_14px_rgba(108,174,18,0.7)]" />

              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Recent
              </h2>
            </div>

            <span className="font-mono text-[10px] text-muted-foreground">
              {content.length.toString().padStart(2, "0")}
            </span>
          </div>

          <ContentList
            content={content}
            isLoading={isLoading}
            onDeleted={(id) => {
              setContent((current) => current.filter((item) => item.id !== id));
            }}
          />
        </section>
      </div>
    </div>
  );
}

export default HomePage;
