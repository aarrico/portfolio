import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="border-b border-[color:var(--fg)]/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-lg tracking-widest">
          ARRICO
        </Link>
        <ul className="hidden gap-6 sm:flex">
          {links.slice(1).map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm hover:text-[color:var(--accent)]">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
