import { describe, expect, it } from 'vitest';
import {
  createTailwindSourceDirectives,
  injectTailwindSources
} from '../src/runtime/tailwind-sources.js';

describe('createTailwindSourceDirectives', () => {
  it('targets the deck directory for Tailwind scanning', () => {
    expect(createTailwindSourceDirectives('/tmp/demo/examples/deck.mdx')).toBe(
      '@source "/tmp/demo/examples/**/*.{mdx,md,tsx,ts,jsx,js,html}";\n'
    );
  });
});

describe('injectTailwindSources', () => {
  it('prepends a source directive to Tailwind CSS files', () => {
    expect(
      injectTailwindSources('@import "tailwindcss";\nbody { color: black; }\n', '/tmp/demo/deck.mdx')
    ).toBe(
      '@source "/tmp/demo/**/*.{mdx,md,tsx,ts,jsx,js,html}";\n@import "tailwindcss";\nbody { color: black; }\n'
    );
  });

  it('does not change non-Tailwind CSS files', () => {
    expect(injectTailwindSources('body { color: black; }\n', '/tmp/demo/deck.mdx')).toBe(
      'body { color: black; }\n'
    );
  });
});
