import Image from "next/image";
import type { ReactNode } from "react";

type InterestCardProps = {
  image?: string;
  alt?: string;
  title: string;
  children: ReactNode;
};

export function InterestCard({ image, alt, title, children }: InterestCardProps) {
  const initials = title
    .split(/\s+/)
    .map((word) => word[0])
    .filter((char) => char && /[a-z0-9]/i.test(char))
    .slice(0, 3)
    .join("");

  return (
    <article className="not-prose flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md ring-1 ring-[color:var(--accent)]/15">
        {image ? (
          <Image
            src={image}
            alt={alt ?? ""}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[color:var(--gradient-stop-1)] via-[color:var(--gradient-stop-2)] to-[color:var(--gradient-stop-3)]"
          >
            <span className="font-display text-5xl tracking-widest text-[color:var(--gradient-stop-5)]/60">
              {initials}
            </span>
          </div>
        )}
      </div>
      <h4 className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {title}
      </h4>
      <div className="prose prose-invert mt-2 max-w-none text-[0.95rem] leading-relaxed">
        {children}
      </div>
    </article>
  );
}
