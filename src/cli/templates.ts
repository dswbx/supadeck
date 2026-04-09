export function starterDeckTemplate(): string {
   return `---
title: Supadeck
theme: default
aspectRatio: 16:9
showSlideNumbers: true
transition: fade
---

# Supadeck

Write presentations in one \`deck.mdx\` file.

<Callout tone="accent">
  Edit this file and the deck will hot reload automatically.
</Callout>

---

## Custom components

<Columns
  left={<Frame label="Local imports">Import your own React components only when you need them.</Frame>}
  right={<Disclosure title="Theme-provided components">Themes can expose components directly to MDX.</Disclosure>}
/>

---

## Export

- Run \`npx supadeck export\`
- The deck is rendered as HTML first
- Then exported to PDF with headless Chromium
`;
}
