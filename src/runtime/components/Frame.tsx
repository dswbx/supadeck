import type { ReactNode } from 'react';

export interface FrameProps {
  children: ReactNode;
}

export function Frame({ children }: FrameProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white/70 p-8 shadow-xl shadow-black/10 dark:bg-white/5">
      {children}
    </div>
  );
}
