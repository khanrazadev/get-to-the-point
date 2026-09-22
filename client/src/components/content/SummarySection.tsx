type SummarySectionProps = {
  text: string | null;
};

function SummarySection({ text }: SummarySectionProps) {
  if (!text) {
    return (
      <div className="py-8">
        <p className="text-sm text-muted-foreground">
          No summary is available for this content.
        </p>
      </div>
    );
  }

  return (
    <article className="max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Summary
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          A concise overview of the important ideas in this content.
        </p>
      </div>

      <div className="whitespace-pre-line text-[15px] leading-8 text-foreground/90">
        {text}
      </div>
    </article>
  );
}

export default SummarySection;