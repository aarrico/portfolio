"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="font-display text-3xl tracking-widest">Something broke.</h1>
      <p className="mt-4 text-sm opacity-70">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-sm border border-[color:var(--accent)] px-4 py-2 text-sm"
      >
        Try again
      </button>
    </section>
  );
}
