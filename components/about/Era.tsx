import type { ReactNode } from "react";

type EraProps = {
  year: string;
  labels: string[];
  children: ReactNode;
};

export function Era({ year, labels, children }: EraProps) {
  return (
    <div className="not-prose my-10 md:my-14">
      {/* Mobile rail: one short uppercase line above the prose */}
      <div className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[color:var(--accent)] md:hidden">
        <span className="mr-2 text-[color:var(--accent)]">{year}</span>
        <span className="text-[color:var(--accent)]/60">
          {labels.join(" · ")}
        </span>
      </div>

      {/* Desktop rail: fixed-width left column, prose to the right */}
      <div className="md:grid md:grid-cols-[6.5rem_1fr] md:gap-10">
        <aside className="hidden md:block">
          <div className="font-mono text-2xl tracking-wide text-[color:var(--accent)]">
            {year}
          </div>
          <div className="mt-1 h-px w-8 bg-[color:var(--accent)]/40" />
          <ul className="mt-3 space-y-1 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[color:var(--accent)]/70">
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </aside>
        <div className="prose prose-invert max-w-none">{children}</div>
      </div>
    </div>
  );
}
