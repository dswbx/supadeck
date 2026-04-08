import { describe, expect, it } from 'vitest';
import {
  createTailwindSourceDirectives,
  injectTailwindSources,
  isTailwindSourceFile,
  resolveTailwindWorkspaceRoot
} from '../src/runtime/tailwind-sources.js';

describe('createTailwindSourceDirectives', () => {
  it('targets the deck directory for Tailwind scanning', () => {
    expect(createTailwindSourceDirectives('/tmp/demo/examples/deck.mdx')).toBe(
      '@source "/tmp/demo/examples/**/*.{mdx,md,tsx,ts,jsx,js,html}";\n'
    );
  });
});

describe('resolveTailwindWorkspaceRoot', () => {
  it('uses the deck directory as the Tailwind workspace root', () => {
    expect(resolveTailwindWorkspaceRoot('/tmp/demo/examples/deck.mdx')).toBe('/tmp/demo/examples');
  });
});

describe('isTailwindSourceFile', () => {
  it('matches supported files inside the deck workspace', () => {
    expect(isTailwindSourceFile('/tmp/demo/deck.mdx', '/tmp/demo/components/Card.tsx')).toBe(true);
    expect(isTailwindSourceFile('/tmp/demo/deck.mdx', '/tmp/demo/content/slide.mdx')).toBe(true);
    expect(isTailwindSourceFile('/tmp/demo/deck.mdx', '/tmp/demo/index.html')).toBe(true);
  });

  it('ignores files outside the deck workspace', () => {
    expect(isTailwindSourceFile('/tmp/demo/deck.mdx', '/tmp/other/Card.tsx')).toBe(false);
  });

  it('ignores unsupported extensions', () => {
    expect(isTailwindSourceFile('/tmp/demo/deck.mdx', '/tmp/demo/styles/theme.css')).toBe(false);
    expect(isTailwindSourceFile('/tmp/demo/deck.mdx', '/tmp/demo/assets/logo.svg')).toBe(false);
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

  it('does not duplicate the source directive when it is already present', () => {
    const css = '@source "/tmp/demo/**/*.{mdx,md,tsx,ts,jsx,js,html}";\n@import "tailwindcss";\n';
    expect(injectTailwindSources(css, '/tmp/demo/deck.mdx')).toBe(css);
  });
});
