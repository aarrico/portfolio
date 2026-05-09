type HorizonLineProps = {
  className?: string;
};

export function HorizonLine({ className }: HorizonLineProps) {
  return (
    <div
      aria-hidden="true"
      className={`h-px w-full ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, var(--gradient-stop-3) 20%, var(--gradient-stop-4) 50%, var(--gradient-stop-3) 80%, transparent)",
      }}
    />
  );
}
