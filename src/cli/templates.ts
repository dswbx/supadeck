export function starterDeckTemplate(): string {
   return `---
title: Supadeck
theme: default
aspectRatio: 16:9
showSlideNumbers: true
transition: fade
---

import ExampleCard from './ExampleCard.tsx'

# Supadeck

Write presentations in one \`deck.mdx\` file.

<Callout tone="accent">
  Edit this file and the deck will hot reload automatically.
</Callout>

---

## Custom components

<Columns
  left={<ExampleCard title="Local import">Your own React component.</ExampleCard>}
  right={<Disclosure title="Theme-provided components">Themes can expose components directly to MDX.</Disclosure>}
/>

---

## Export

- Run \`npx supadeck export\`
- The deck is rendered as HTML first
- Then exported to PDF with headless Chromium
`;
}

export function starterExampleComponent(): string {
   return `import type { ReactNode } from 'react'

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
`;
}
