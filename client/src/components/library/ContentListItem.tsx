import { Link } from "react-router-dom";

import type { Content } from "@/types/content";

type ContentListItemProps = {
  content: Content;
};

function ContentListItem({ content }: ContentListItemProps) {
  return (
    <Link
      to={`/content/${content.id}`}
      className="group block border-b border-border py-5 transition-colors hover:bg-muted/40"
    >
      <article className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium transition-colors group-hover:text-accent">
            {content.title ?? content.sourceUrl ?? "Untitled content"}
          </p>

          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {content.type} · {content.status}
          </p>
        </div>

        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(content.createdAt).toLocaleDateString()}
        </span>
      </article>
    </Link>
  );
}

export default ContentListItem;