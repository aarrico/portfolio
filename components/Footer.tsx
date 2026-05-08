import { HorizonLine } from "./aesthetic/HorizonLine";

export function Footer() {
  return (
    <footer className="mt-16">
      <HorizonLine />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm">
        <p>© {new Date().getFullYear()} Alexander Arrico</p>
        <ul className="flex gap-4">
          <li><a href="https://github.com/aarrico" target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/alexander-arrico" target="_blank" rel="noreferrer">LinkedIn</a></li>
        </ul>
      </div>
    </footer>
  );
}
