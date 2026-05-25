import { GradientSky } from "@/components/aesthetic/GradientSky";
import { Sun } from "@/components/aesthetic/Sun";
import { Palm } from "@/components/aesthetic/Palm";
import { GridFloor } from "@/components/aesthetic/GridFloor";
import { Starfield } from "@/components/aesthetic/Starfield";

export function SitePreview() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <GradientSky className="relative h-full w-full">
        <div className="absolute inset-x-0 top-0 h-[55%] opacity-70">
          <Starfield />
        </div>

        <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
          <div className="sun-rise">
            <Sun size={90} withGlow={false} />
          </div>
        </div>

        <div className="absolute inset-x-0 top-[58%] bottom-0 text-[color:var(--accent)]">
          <GridFloor height={80} />
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 text-[color:var(--gradient-stop-1)]">
          <div className="absolute -left-2 bottom-0 opacity-90">
            <Palm side="left" height={70} />
          </div>
          <div className="absolute left-4 bottom-0 opacity-100">
            <Palm side="left" height={90} />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 text-[color:var(--gradient-stop-1)]">
          <div className="absolute -right-2 bottom-0 opacity-90">
            <Palm side="right" height={70} />
          </div>
          <div className="absolute right-4 bottom-0 opacity-100">
            <Palm side="right" height={90} />
          </div>
        </div>
      </GradientSky>
    </div>
  );
}
