import { describe, expect, it } from 'vitest';
import { normalizeDeckConfig, parseDeck } from '../src/content/parse-deck.js';

describe('parseDeck', () => {
  it('extracts frontmatter, prelude, and slides', () => {
    const source = `---
title: Test deck
theme: sunset
---

import Thing from './Thing.tsx'

# One

---

\`\`\`md
---
\`\`\`

# Two
`;

    const deck = parseDeck(source);

    expect(deck.frontmatter.title).toBe('Test deck');
    expect(deck.prelude).toContain("import Thing from './Thing.tsx'");
    expect(deck.slides).toHaveLength(2);
    expect(deck.slides[0].body).toContain('# One');
    expect(deck.slides[1].body).toContain('# Two');
    expect(deck.slides[1].body).toContain('```md');
  });

  it('falls back to a placeholder slide', () => {
    const deck = parseDeck('---\ntitle: Empty\n---\n');
    expect(deck.slides).toHaveLength(1);
    expect(deck.slides[0].body).toContain('Untitled slide');
  });
});

describe('normalizeDeckConfig', () => {
  it('applies defaults and CLI theme override', () => {
    expect(normalizeDeckConfig({ title: 'X' }, 'sunset')).toEqual({
      title: 'X',
      theme: 'sunset',
      aspectRatio: '16:9',
      showSlideNumbers: true,
      transition: 'fade'
    });
  });
});
