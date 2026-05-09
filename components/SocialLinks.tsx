// components/SocialLinks.tsx
import { FaGithub, FaLinkedin } from "react-icons/fa";

interface SocialLinksProps {
  direction?: "horizontal" | "vertical";
}

export default function SocialLinks({ direction = "horizontal" }: SocialLinksProps) {
  const flexClass = direction === "horizontal" ? "flex-row space-x-4" : "flex-col space-y-4 items-center";

  return (
    <div className={`flex ${flexClass} items-center`}>
      <a 
        href="https://github.com" 
        target="_blank" 
        className="hover:text-gray-600 transition-colors"
      >
        <FaGithub size={28} />
      </a>
      <a 
        href="https://linkedin.com" 
        target="_blank" 
        className="text-[#0077b5] hover:opacity-80 transition-opacity"
      >
        <FaLinkedin size={28} />
      </a>
    </div>
  );
}
