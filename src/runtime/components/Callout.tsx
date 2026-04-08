import type { ReactNode } from 'react';

export type CalloutTone = 'default' | 'accent' | 'danger';

export interface CalloutProps {
  children: ReactNode;
  tone?: CalloutTone;
}

function toneClasses(tone: CalloutTone): string {
  if (tone === 'accent') {
    return 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10';
  }
  if (tone === 'danger') {
    return 'border-red-500/50 bg-red-500/10';
  }
  return 'border-[color:var(--color-border)] bg-white/60 dark:bg-white/5';
}

export function Callout({ children, tone = 'default' }: CalloutProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border px-6 py-5 text-xl shadow-lg shadow-black/5 backdrop-blur ${toneClasses(
        tone
      )}`}
    >
      {children}
    </div>
  );
}
