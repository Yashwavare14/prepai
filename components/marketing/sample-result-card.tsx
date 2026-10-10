import { Meter } from "@/components/ui";

/**
 * Illustrative result card in the landing hero (design: index.html).
 * It is marketing artwork, labelled "Sample result", so it is exposed to assistive
 * technology as a single image with a description.
 */
export function SampleResultCard() {
  return (
    <div
      role="img"
      aria-label="Sample result card: score 152 out of 200, 88th percentile, with section accuracy for quantitative aptitude, reasoning and English"
      className="w-full max-w-[440px] rounded-hero bg-surface p-7 text-ink shadow-float"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <strong className="text-[15px]">SSC CGL Full Mock</strong>
        <span className="chip chip-info">Sample result</span>
      </div>

      <div className="mb-5 flex items-end gap-5">
        <div>
          <div className="text-sm font-semibold text-muted">Score</div>
          <div className="text-[44px] leading-none font-extrabold tracking-[-0.02em]">
            152<span className="text-xl font-semibold text-muted">/200</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-muted">Percentile</div>
          <div className="text-[30px] leading-tight font-extrabold text-ok">88th</div>
        </div>
      </div>

      <div className="grid gap-3" aria-hidden="true">
        <Meter label="Quantitative Aptitude" value={74} size="sm" tone="brand" />
        <Meter label="Reasoning" value={88} size="sm" tone="ok" />
        <Meter label="English" value={84} size="sm" tone="ok" />
      </div>

      <div className="mt-[18px] rounded-btn bg-warn-bg px-3.5 py-3 text-sm font-bold text-warn-fg">
        Focus next: Data Interpretation
      </div>
    </div>
  );
}
