import { GradientSky } from "./GradientSky";
import { Sun } from "./Sun";
import { Palm } from "./Palm";
import { GridFloor } from "./GridFloor";

type InnerPageHeaderProps = {
  title: string;
  eyebrow?: string;
};

export function InnerPageHeader({ title, eyebrow }: InnerPageHeaderProps) {
  return (
    <GradientSky className="h-[140px] sm:h-[160px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[58%] text-[color:var(--accent)]">
          <GridFloor height={300} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 right-2 origin-bottom-right scale-[0.55] opacity-80 sm:right-12 sm:scale-100 sm:opacity-90"
        >
          <Sun size={100} withGlow={false} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 origin-bottom-left scale-[0.6] text-[color:var(--gradient-stop-5)] mix-blend-screen sm:scale-100"
        >
          <Palm side="left" height={120} />
        </div>
        <div className="relative z-10 px-4 text-center">
          {eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--gradient-stop-5)]/80 sm:text-xs">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-xl tracking-wider text-[color:var(--gradient-stop-5)] sm:text-3xl sm:tracking-widest md:text-4xl">
            {title}
          </h1>
        </div>
      </div>
    </GradientSky>
  );
}
