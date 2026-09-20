import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import type { ContentDetails } from "@/types/content";

type ContentHeaderProps = {
  content: ContentDetails;
};

function ContentHeader({
  content,
}: ContentHeaderProps) {
  return (
    <header>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to library
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {content.type}
        </span>

        <span className="text-border">/</span>

        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {content.status}
        </span>
      </div>

      {content.sourceUrl && (
        <a
          href={content.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="truncate">
            {content.sourceUrl}
          </span>

          <ExternalLink className="size-4 shrink-0" />
        </a>
      )}
    </header>
  );
}

export default ContentHeader;