import { useState } from "react";

import { useAuth } from "@clerk/react";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { deleteContent } from "@/lib/api";

import type { Content } from "@/types/content";

type ContentListItemProps = {
  content: Content;
  onDeleted: (id: string) => void;
};

function ContentListItem({
  content,
  onDeleted,
}: ContentListItemProps) {
  const { getToken } = useAuth();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      "Delete this content? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in");
      }

      await deleteContent(content.id, token);

      onDeleted(content.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete content",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const title =
    content.title ??
    content.sourceUrl ??
    "Untitled content";

  const date = new Date(
    content.createdAt,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/content/${content.id}`}
      className="group block rounded-xl px-4 py-4 transition-colors hover:bg-white/[0.035]"
    >
      <article className="flex items-center gap-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-medium text-muted-foreground transition-colors group-hover:bg-accent/10 group-hover:text-accent">
          {content.type === "YOUTUBE"
            ? "YT"
            : content.type === "INSTAGRAM"
              ? "IG"
              : content.type === "AUDIO"
                ? "AU"
                : "VD"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            {title}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {content.type}
            </span>

            <span className="text-muted-foreground/40">
              ·
            </span>

            <span
              className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                content.status === "COMPLETED"
                  ? "text-accent"
                  : content.status === "FAILED"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {content.status}
            </span>
          </div>

          {error && (
            <p className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <span className="text-xs text-muted-foreground">
            {date}
          </span>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete content"
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
          </button>

          <ArrowUpRight className="size-4 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

        <div className="flex shrink-0 items-center sm:hidden">
          <ArrowUpRight className="size-4 text-muted-foreground/50" />
        </div>
      </article>
    </Link>
  );
}

export default ContentListItem;