import Image from "next/image";
import type { ReactNode } from "react";

type IntroBandProps = {
  name: string;
  image?: string;
  alt?: string;
  children: ReactNode;
};

export function IntroBand({ name, image, alt, children }: IntroBandProps) {
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .filter((char) => char && /[a-z0-9]/i.test(char))
    .slice(0, 2)
    .join("");

  return (
    <section
      aria-label="Introduction"
      className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-8 px-4 sm:flex-row sm:items-start sm:gap-10"
    >
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[color:var(--gradient-stop-2)] via-[color:var(--gradient-stop-3)] to-[color:var(--gradient-stop-4)] opacity-60 blur-[6px]" />
        <div className="relative aspect-square w-44 overflow-hidden rounded-2xl ring-1 ring-[color:var(--accent)]/40 sm:w-52">
          {image ? (
            <Image
              src={image}
              alt={alt ?? `Portrait of ${name}`}
              fill
              sizes="(min-width: 640px) 13rem, 11rem"
              priority
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[color:var(--gradient-stop-1)] via-[color:var(--gradient-stop-2)] to-[color:var(--gradient-stop-3)]"
            >
              <span className="font-display text-6xl tracking-widest text-[color:var(--gradient-stop-5)]/70">
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--accent)]">
          A portrait
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-[0.1em] text-[color:var(--fg)] sm:text-4xl">
          {name}
        </h2>
        <div className="mt-4 max-w-prose text-[1.05rem] leading-relaxed text-[color:var(--fg)]/85">
          {children}
        </div>
      </div>
    </section>
  );
}
