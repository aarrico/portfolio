import type { ReactNode } from "react";

type InterestGridProps = {
  children: ReactNode;
};

export function InterestGrid({ children }: InterestGridProps) {
  return (
    <div className="not-prose my-10 lg:relative lg:left-1/2 lg:w-screen lg:max-w-5xl lg:-translate-x-1/2 lg:px-4">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {children}
      </div>
    </div>
  );
}
