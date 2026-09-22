import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import type { ContentDetails } from "@/types/content";

type ContentHeaderProps = {
  content: ContentDetails;
};

function ContentHeader({ content }: ContentHeaderProps) {
  const title =
    content.title ??
    content.sourceUrl ??
    "Untitled content";

  return (
    <header>
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to library
        </Link>

        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em]">
          <span className="text-accent">
            {content.type}
          </span>

          <span className="text-muted-foreground/40">
            /
          </span>

          <span className="text-muted-foreground">
            {content.status}
          </span>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl">
          {title}
        </h1>

        {content.sourceUrl && (
          <a
            href={content.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex max-w-full items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            <span className="truncate">
              {content.sourceUrl}
            </span>

            <ExternalLink className="size-3 shrink-0" />
          </a>
        )}
      </div>
    </header>
  );
}

export default ContentHeader;