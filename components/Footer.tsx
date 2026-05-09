import { HorizonLine } from "./aesthetic/HorizonLine";
import { SocialLinks } from "./SocialLinks";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-16">
      <HorizonLine />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm">
        <p>© {YEAR} Alexander Arrico</p>
        <SocialLinks />
      </div>
    </footer>
  );
}
