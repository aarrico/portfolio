type NavItem = {
  href: string;
  label: string;
};

const items: NavItem[] = [
  { href: "#inspiration", label: "Inspiration" },
  { href: "#career", label: "Career" },
  { href: "#interests", label: "Interests" },
];

export function SectionNav() {
  return (
    <div className="sticky top-0 z-20 mt-12 border-y border-[color:var(--accent)]/15 bg-[color:var(--bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/70">
      <nav
        aria-label="About page sections"
        className="mx-auto max-w-3xl px-4 py-3"
      >
        <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex items-center rounded-full border border-[color:var(--accent)]/40 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[color:var(--fg)]/80 transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
