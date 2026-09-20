type TranscriptSectionProps = {
  text: string | null;
};

function TranscriptSection({
  text,
}: TranscriptSectionProps) {
  return (
    <section>
      <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
        {text ?? "No transcript available."}
      </p>
    </section>
  );
}

export default TranscriptSection;