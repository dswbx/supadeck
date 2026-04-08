import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { normalizePath } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import type { HmrContext, HotPayload, ModuleNode, Plugin } from 'vite';
import { createSupaslidesViteConfig } from '../src/runtime/vite-config.js';

const DECK_VIRTUAL_RESOLVED = '\0virtual:supaslides/deck';
const THEME_RESOLVED = '\0virtual:supaslides/theme';
const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map(async (root) => {
      await fs.rm(root, { recursive: true, force: true });
    })
  );
});

function slideIdFor(deckPath: string, index: number): string {
  return `${normalizePath(deckPath)}?supaslides-slide=${index}`;
}

function createModule(overrides: Partial<ModuleNode> & Pick<ModuleNode, 'url'>): ModuleNode {
  return {
    url: overrides.url,
    id: overrides.id ?? overrides.url,
    file: overrides.file ?? overrides.url,
    type: overrides.type ?? 'js',
    importedModules: overrides.importedModules ?? new Set<ModuleNode>(),
    importers: overrides.importers ?? new Set<ModuleNode>(),
    clientImportedModules: overrides.clientImportedModules ?? new Set<ModuleNode>(),
    ssrImportedModules: overrides.ssrImportedModules ?? new Set<ModuleNode>(),
    acceptedHmrDeps: overrides.acceptedHmrDeps ?? new Set<ModuleNode>(),
    acceptedHmrExports: overrides.acceptedHmrExports ?? null,
    importedBindings: overrides.importedBindings ?? null,
    isSelfAccepting: overrides.isSelfAccepting,
    info: overrides.info,
    meta: overrides.meta,
    transformResult: overrides.transformResult ?? null,
    ssrTransformResult: overrides.ssrTransformResult ?? null,
    ssrModule: overrides.ssrModule ?? null,
    ssrError: overrides.ssrError ?? null,
    lastHMRTimestamp: overrides.lastHMRTimestamp ?? 0,
    lastInvalidationTimestamp: overrides.lastInvalidationTimestamp ?? 0,
    invalidationState: overrides.invalidationState,
    _moduleGraph: overrides._moduleGraph as ModuleNode['_moduleGraph'],
    _clientModule: overrides._clientModule,
    _ssrModule: overrides._ssrModule,
    _get: overrides._get as ModuleNode['_get'],
    _set: overrides._set as ModuleNode['_set'],
    _wrapModuleSet: overrides._wrapModuleSet as ModuleNode['_wrapModuleSet'],
    _getModuleSetUnion: overrides._getModuleSetUnion as ModuleNode['_getModuleSetUnion'],
    _getModuleInfoUnion: overrides._getModuleInfoUnion as ModuleNode['_getModuleInfoUnion'],
    _getModuleObjectUnion: overrides._getModuleObjectUnion as ModuleNode['_getModuleObjectUnion']
  } as ModuleNode;
}

async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'supaslides-tailwind-hmr-'));
  tempRoots.push(root);

  await fs.writeFile(
    path.join(root, 'deck.mdx'),
    `---
title: Tailwind HMR
theme: default
---

import Card from "./Card.tsx"

<Card />
`
  );

  await fs.writeFile(
    path.join(root, 'Card.tsx'),
    `export default function Card() {
  return <div className="text-slate-500">card</div>;
}
`
  );

  return root;
}

function getSupaslidesPlugin(deckPath: string): Plugin {
  const config = createSupaslidesViteConfig({
    deckPath,
    port: 4173
  });
  const plugin = (config.plugins ?? []).find(
    (candidate: unknown): candidate is Plugin =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate &&
      candidate.name === 'supaslides'
  );

  if (!plugin?.handleHotUpdate) {
    throw new Error('Supaslides plugin is missing handleHotUpdate.');
  }

  return plugin;
}

function getHandleHotUpdate(plugin: Plugin) {
  const hook = plugin.handleHotUpdate;

  if (!hook) {
    throw new Error('Supaslides plugin is missing handleHotUpdate.');
  }

  return typeof hook === 'function' ? hook : hook.handler;
}

function createServerHarness(modulesById: Map<string, ModuleNode>) {
  const invalidated: ModuleNode[] = [];
  const payloads: HotPayload[] = [];

  return {
    invalidated,
    payloads,
    server: {
      moduleGraph: {
        getModuleById(id: string) {
          return modulesById.get(id);
        },
        invalidateModule(module: ModuleNode) {
          invalidated.push(module);
        }
      },
      ws: {
        send(payload: HotPayload) {
          payloads.push(payload);
        }
      }
    }
  };
}

describe('tailwind HMR integration', () => {
  it('invalidates slide js and emits a css update for deck changes', async () => {
    const workspaceRoot = await createWorkspace();
    const deckPath = path.join(workspaceRoot, 'deck.mdx');
    const plugin = getSupaslidesPlugin(deckPath);
    const handleHotUpdate = getHandleHotUpdate(plugin);

    const cssModule = createModule({
      url: '/@fs/theme.css',
      id: '/theme.css',
      file: '/theme.css',
      type: 'css',
      importedModules: new Set()
    });
    const themeModule = createModule({
      url: '/@id/virtual:supaslides/theme',
      id: THEME_RESOLVED,
      importedModules: new Set([cssModule])
    });
    const deckModule = createModule({
      url: '/@id/virtual:supaslides/deck',
      id: DECK_VIRTUAL_RESOLVED,
      importedModules: new Set()
    });
    const slideModule = createModule({
      url: '/@fs/deck.mdx?supaslides-slide=0',
      id: slideIdFor(deckPath, 0),
      importedModules: new Set()
    });
    const harness = createServerHarness(
      new Map([
        [DECK_VIRTUAL_RESOLVED, deckModule],
        [THEME_RESOLVED, themeModule],
        [slideIdFor(deckPath, 0), slideModule]
      ])
    );

    const result = await handleHotUpdate.call({} as never, {
      file: deckPath,
      timestamp: 123,
      modules: [],
      read: () => fs.readFile(deckPath, 'utf8'),
      server: harness.server as never
    } as HmrContext);

    expect(result).toEqual([deckModule, themeModule, cssModule, slideModule]);
    expect(harness.invalidated).toEqual([deckModule, themeModule, cssModule, slideModule]);
    expect(harness.payloads).toContainEqual({
      type: 'update',
      updates: [
        {
          type: 'css-update',
          path: '/@fs/theme.css',
          acceptedPath: '/@fs/theme.css',
          timestamp: 123
        }
      ]
    });
  });

  it('emits a css update for imported workspace component changes without hijacking js hmr', async () => {
    const workspaceRoot = await createWorkspace();
    const deckPath = path.join(workspaceRoot, 'deck.mdx');
    const componentPath = path.join(workspaceRoot, 'Card.tsx');
    const plugin = getSupaslidesPlugin(deckPath);
    const handleHotUpdate = getHandleHotUpdate(plugin);

    const cssModule = createModule({
      url: '/@fs/theme.css',
      id: '/theme.css',
      file: '/theme.css',
      type: 'css',
      importedModules: new Set()
    });
    const themeModule = createModule({
      url: '/@id/virtual:supaslides/theme',
      id: THEME_RESOLVED,
      importedModules: new Set([cssModule])
    });
    const harness = createServerHarness(new Map([[THEME_RESOLVED, themeModule]]));

    const result = await handleHotUpdate.call({} as never, {
      file: componentPath,
      timestamp: 456,
      modules: [],
      read: () => fs.readFile(componentPath, 'utf8'),
      server: harness.server as never
    } as HmrContext);

    expect(result).toBeUndefined();
    expect(harness.invalidated).toEqual([cssModule]);
    expect(harness.payloads).toContainEqual({
      type: 'update',
      updates: [
        {
          type: 'css-update',
          path: '/@fs/theme.css',
          acceptedPath: '/@fs/theme.css',
          timestamp: 456
        }
      ]
    });
  });

  it('falls back to a full reload when no theme css modules are available', async () => {
    const workspaceRoot = await createWorkspace();
    const deckPath = path.join(workspaceRoot, 'deck.mdx');
    const componentPath = path.join(workspaceRoot, 'Card.tsx');
    const plugin = getSupaslidesPlugin(deckPath);
    const handleHotUpdate = getHandleHotUpdate(plugin);

    const themeModule = createModule({
      url: '/@id/virtual:supaslides/theme',
      id: THEME_RESOLVED,
      importedModules: new Set()
    });
    const harness = createServerHarness(new Map([[THEME_RESOLVED, themeModule]]));

    const result = await handleHotUpdate.call({} as never, {
      file: componentPath,
      timestamp: 789,
      modules: [],
      read: () => fs.readFile(componentPath, 'utf8'),
      server: harness.server as never
    } as HmrContext);

    expect(result).toEqual([]);
    expect(harness.invalidated).toEqual([]);
    expect(harness.payloads).toContainEqual({
      type: 'full-reload',
      path: '*',
      triggeredBy: componentPath
    });
  });
});
