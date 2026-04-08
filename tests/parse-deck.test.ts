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

  it('normalizes and clamps sections from frontmatter', () => {
    const deck = parseDeck(`---
title: Sections
sections:
  - label: Intro
    start: 1
    end: 1
  - label: Closing
    start: 3
    end: 9
---

# One

---

# Two

---

# Three
`);

    expect(deck.config.sections).toEqual([
      { label: 'Intro', start: 0, end: 0 },
      { label: 'Closing', start: 2, end: 2 }
    ]);
  });
});

describe('normalizeDeckConfig', () => {
  it('applies defaults and CLI theme override', () => {
    expect(normalizeDeckConfig({ title: 'X' }, 'sunset')).toEqual({
      title: 'X',
      theme: 'sunset',
      aspectRatio: '16:9',
      showSlideNumbers: true,
      transition: 'fade',
      sections: undefined
    });
  });

  it('drops malformed section entries', () => {
    expect(
      normalizeDeckConfig({
        sections: [
          { label: 'Missing start' },
          { label: '', start: 1, end: 2 },
          { label: 'Backwards', start: 3, end: 2 }
        ]
      }).sections
    ).toBeUndefined();
  });
});
