import { FaGithub, FaLinkedin } from "react-icons/fa";
import { getResume } from "@/lib/data";

type SocialLinksProps = {
  direction?: "horizontal" | "vertical";
  iconSize?: number;
};

export function SocialLinks({
  direction = "horizontal",
  iconSize = 28,
}: SocialLinksProps) {
  const { basics } = getResume();
  const flexClass =
    direction === "horizontal" ? "flex-row gap-4" : "flex-col gap-4";

  return (
    <div className={`flex items-center ${flexClass}`}>
      <a
        href={basics.links.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="transition-colors hover:text-[color:var(--accent)]"
      >
        <FaGithub size={iconSize} />
      </a>
      <a
        href={basics.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="transition-colors hover:text-[color:var(--accent)]"
      >
        <FaLinkedin size={iconSize} />
      </a>
    </div>
  );
}
