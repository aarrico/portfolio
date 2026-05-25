import type { ReactNode } from "react";

type PullQuoteProps = {
  children: ReactNode;
  cite?: string;
};

export function PullQuote({ children, cite }: PullQuoteProps) {
  return (
    <figure className="not-prose my-12 md:my-16">
      <blockquote className="relative pl-12 pr-2 md:pl-16">
        <span
          aria-hidden="true"
          className="absolute -top-6 left-0 select-none font-display text-7xl leading-none text-[color:var(--gradient-stop-2)] md:-top-8 md:text-8xl"
        >
          &ldquo;
        </span>
        <div className="font-sans text-xl italic leading-relaxed text-[color:var(--fg)]/90 md:text-2xl md:leading-relaxed [&>p]:m-0">
          {children}
        </div>
        {cite && (
          <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]/80">
            — {cite}
          </figcaption>
        )}
      </blockquote>
    </figure>
  );
}
