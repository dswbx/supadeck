import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { mergeComponents } from '../src/runtime/default-components.js';
import { resolveThemeModulePath } from '../src/runtime/theme-resolution.js';

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map(async (root) => {
      await fs.rm(root, { recursive: true, force: true });
    })
  );
});

describe('resolveThemeModulePath', () => {
  it('resolves a built-in theme id', () => {
    expect(resolveThemeModulePath('/tmp/demo/deck.mdx', 'default')).toContain(
      '/src/runtime/themes/default/index.tsx'
    );
  });

  it('resolves a theme directory to index.tsx', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'supaslides-theme-dir-'));
    tempRoots.push(root);
    const themeDir = path.join(root, 'themes', 'custom');
    await fs.mkdir(themeDir, { recursive: true });
    await fs.writeFile(path.join(themeDir, 'index.tsx'), 'export default {};');

    expect(resolveThemeModulePath(path.join(root, 'deck.mdx'), './themes/custom')).toBe(
      path.join(themeDir, 'index.tsx')
    );
  });

  it('resolves an explicit theme file path', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'supaslides-theme-file-'));
    tempRoots.push(root);
    const themeFile = path.join(root, 'my-theme.tsx');
    await fs.writeFile(themeFile, 'export default {};');

    expect(resolveThemeModulePath(path.join(root, 'deck.mdx'), './my-theme.tsx')).toBe(
      themeFile
    );
  });
});

describe('mergeComponents', () => {
  it('keeps default components and merges theme overrides', () => {
    const components = mergeComponents({
      components: {
        h1: () => null,
        Hero: () => null
      }
    });

    expect(components.Callout).toBeTypeOf('function');
    expect(components.Hero).toBeTypeOf('function');
    expect(components.h1).toBeTypeOf('function');
  });
});
