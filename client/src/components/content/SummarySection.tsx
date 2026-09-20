type SummarySectionProps = {
  text: string | null;
};

function SummarySection({
  text,
}: SummarySectionProps) {
  return (
    <section>
      <div className="max-w-3xl">
        <p className="whitespace-pre-line text-sm leading-7">
          {text ?? "No summary available."}
        </p>
      </div>
    </section>
  );
}

export default SummarySection;