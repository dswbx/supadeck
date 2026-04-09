import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ensureStarterDeck, resolveDeckPath } from '../src/cli/workspace.js';
import { parseArguments } from '../src/cli/index.js';

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map(async (root) => {
      await fs.rm(root, { recursive: true, force: true });
    })
  );
});

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

describe('ensureStarterDeck', () => {
  it('creates only deck.mdx for a new workspace scaffold', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'supadeck-workspace-'));
    tempRoots.push(root);
    const deckPath = path.join(root, 'deck.mdx');

    await ensureStarterDeck(deckPath);

    await expect(fs.readFile(deckPath, 'utf8')).resolves.toContain('# Supadeck');
    await expect(fs.access(path.join(root, 'ExampleCard.tsx'))).rejects.toThrow();
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
