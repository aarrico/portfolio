import type { MDXComponents } from "mdx/types";
import { PullQuote } from "@/components/about/PullQuote";
import { Era } from "@/components/about/Era";
import { InterestGrid } from "@/components/about/InterestGrid";
import { InterestCard } from "@/components/about/InterestCard";

const components: MDXComponents = {
  code: ({ className, ...props }) => (
    <code
      className={`font-mono rounded bg-[color:var(--fg)]/10 px-1 py-0.5 text-[0.9em] ${className ?? ""}`}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={`font-mono overflow-x-auto rounded-md bg-[color:var(--fg)]/10 p-4 text-sm ${className ?? ""}`}
      {...props}
    />
  ),
  PullQuote,
  Era,
  InterestGrid,
  InterestCard,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
