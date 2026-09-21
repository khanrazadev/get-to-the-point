import { useState } from "react";

import { useAuth } from "@clerk/react";
import { Trash2 } from "lucide-react";
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

  return (
    <Link
      to={`/content/${content.id}`}
      className="group block border-b border-border py-5 transition-colors hover:bg-muted/40"
    >
      <article className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium transition-colors group-hover:text-accent">
            {content.title ??
              content.sourceUrl ??
              "Untitled content"}
          </p>

          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {content.type} · {content.status}
          </p>

          {error && (
            <p className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {new Date(
              content.createdAt,
            ).toLocaleDateString()}
          </span>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete content"
            className="p-1 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </article>
    </Link>
  );
}

export default ContentListItem;