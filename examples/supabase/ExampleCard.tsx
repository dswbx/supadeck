import type { ReactNode } from 'react'

interface ExampleCardProps {
  title: string
  children: ReactNode
}

export default function ExampleCard({ title, children }: ExampleCardProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white/75 p-8 shadow-lg shadow-black/10 backdrop-blur dark:bg-black/20">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">
        {title}
      </div>
      <div className="text-lg">{children}</div>
    </div>
  );
}
