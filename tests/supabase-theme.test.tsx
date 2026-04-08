import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { DeckConfig, DeckModule } from '../src/content/parse-deck.js';
import { SupabaseDeck } from '../src/runtime/themes/supabase/SupabaseDeck.js';

function createDeck(config: Partial<DeckConfig> = {}): DeckModule {
  return {
    config: {
      title: 'Supabase deck',
      theme: 'supabase',
      aspectRatio: '16:9',
      showSlideNumbers: true,
      transition: 'fade',
      ...config
    },
    slides: [
      {
        index: 0,
        body: '# One',
        Component: () => <div>Slide One</div>
      },
      {
        index: 1,
        body: '# Two',
        Component: () => <div>Slide Two</div>
      },
      {
        index: 2,
        body: '# Three',
        Component: () => <div>Slide Three</div>
      }
    ]
  };
}

const helpers = {
  clamp: (value: number, min: number, max: number) => Math.min(max, Math.max(min, value)),
  getHashIndex: () => 0,
  parseAspectRatio: () => '16 / 9'
};

describe('SupabaseDeck', () => {
  it('renders footer breadcrumbs and counter in interactive mode', () => {
    const deck = createDeck({
      sections: [
        { label: 'Intro', start: 0, end: 0 },
        { label: 'Details', start: 1, end: 2 }
      ]
    });

    const html = renderToStaticMarkup(
      <SupabaseDeck
        deck={deck}
        config={deck.config}
        slides={deck.slides}
        currentIndex={1}
        setCurrentIndex={() => undefined}
        printMode={false}
        components={{}}
        helpers={helpers}
      />
    );

    expect(html).toContain('Intro');
    expect(html).toContain('Details');
    expect(html).toContain('2 / 3');
    expect(html).toContain('Slide Two');
  });

  it('renders every slide in print mode without the fixed footer', () => {
    const deck = createDeck();

    const html = renderToStaticMarkup(
      <SupabaseDeck
        deck={deck}
        config={deck.config}
        slides={deck.slides}
        currentIndex={0}
        setCurrentIndex={() => undefined}
        printMode
        components={{}}
        helpers={helpers}
      />
    );

    expect(html).toContain('Slide One');
    expect(html).toContain('Slide Two');
    expect(html).toContain('Slide Three');
    expect(html).not.toContain('supabase-footer');
  });
});
