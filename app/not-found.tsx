import Link from "next/link";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";

export default function NotFound() {
  return (
    <>
      <InnerPageHeader title="404" eyebrow="Lost in the dusk" />
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p>That page doesn&apos;t exist.</p>
        <Link href="/" className="mt-4 inline-block hover:text-[color:var(--accent)]">
          ← Home
        </Link>
      </section>
    </>
  );
}
