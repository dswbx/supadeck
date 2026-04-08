import { describe, expect, it } from 'vitest';
import { resolveDeckPath } from '../src/cli/workspace.js';
import { parseArguments } from '../src/cli/index.js';

describe('resolveDeckPath', () => {
  it('uses deck.mdx by default', () => {
    expect(resolveDeckPath(undefined, '/tmp/demo')).toBe('/tmp/demo/deck.mdx');
  });

  it('uses the configured default workspace when provided', () => {
    expect(resolveDeckPath(undefined, '/tmp/demo', 'examples/dev')).toBe(
      '/tmp/demo/examples/dev/deck.mdx'
    );
  });

  it('treats a directory as a deck workspace', () => {
    expect(resolveDeckPath('slides', '/tmp/demo')).toBe('/tmp/demo/slides/deck.mdx');
  });

  it('keeps explicit filenames', () => {
    expect(resolveDeckPath('talks/keynote.mdx', '/tmp/demo')).toBe('/tmp/demo/talks/keynote.mdx');
  });
});

describe('parseArguments', () => {
  it('parses export arguments', () => {
    expect(parseArguments(['export', 'talk.mdx', '--output', 'talk.pdf', '--theme=sunset'])).toEqual({
      command: 'export',
      options: {
        open: false,
        create: true,
        port: undefined,
        output: 'talk.pdf',
        theme: 'sunset',
        input: 'talk.mdx'
      }
    });
  });
});
