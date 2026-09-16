import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { getResume } from "@/lib/resume";
import { SocialLinks } from "@/components/SocialLinks";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Alexander Arrico.",
};

export default function ContactPage() {
  const { basics } = getResume();
  return (
    <>
      <InnerPageHeader title="CONTACT" />
      <section className="mx-auto max-w-md px-4 py-12">
        <div className="flex flex-col items-center text-center">
          Feel free to reach out to me via email or connect with me on LinkedIn if you're looking for an engineer with my skills!
          <div className="mt-4">
            <SocialLinks direction="horizontal" />
          </div>
        </div>
      </section>
    </>
  );
}
