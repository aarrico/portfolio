import { GradientSky } from "./GradientSky";
import { Sun } from "./Sun";
import { Palm } from "./Palm";

type InnerPageHeaderProps = {
  title: string;
  eyebrow?: string;
};

export function InnerPageHeader({ title, eyebrow }: InnerPageHeaderProps) {
  return (
    <GradientSky className="h-[140px] sm:h-[160px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <Sun size={56} withGlow={false} className="absolute right-12 top-6 opacity-90" />
        <div className="text-[color:var(--gradient-stop-5)] mix-blend-screen pointer-events-none absolute bottom-0 left-0">
          <Palm side="left" height={120} />
        </div>
        <div className="text-center">
          {eyebrow && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--gradient-stop-5)]/80">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl tracking-widest text-[color:var(--gradient-stop-5)] sm:text-4xl">
            {title}
          </h1>
        </div>
      </div>
    </GradientSky>
  );
}
