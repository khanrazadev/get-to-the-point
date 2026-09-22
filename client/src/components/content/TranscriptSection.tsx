type TranscriptSectionProps = {
  text: string | null;
};

function TranscriptSection({
  text,
}: TranscriptSectionProps) {
  if (!text) {
    return (
      <div className="py-8">
        <p className="text-sm text-muted-foreground">
          No transcript is available for this content.
        </p>
      </div>
    );
  }

  return (
    <article className="max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Transcript
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          The original text extracted from this content.
        </p>
      </div>

      <div className="whitespace-pre-line text-sm leading-8 text-foreground/80">
        {text}
      </div>
    </article>
  );
}

export default TranscriptSection;