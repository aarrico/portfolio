import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="border-b border-[color:var(--fg)]/10">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="font-display text-lg tracking-widest">
          ARRICO
        </Link>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm hover:text-[color:var(--accent)]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
