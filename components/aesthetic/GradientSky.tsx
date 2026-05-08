type GradientSkyProps = {
  className?: string;
  children?: React.ReactNode;
};

export function GradientSky({ className, children }: GradientSkyProps) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(180deg, var(--gradient-stop-1) 0%, var(--gradient-stop-2) 35%, var(--gradient-stop-3) 65%, var(--gradient-stop-4) 85%, var(--gradient-stop-5) 100%)",
      }}
    >
      {children}
    </div>
  );
}
