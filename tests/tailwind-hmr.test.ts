import { describe, expect, it, vi } from 'vitest';
import type { HotPayload, ModuleNode } from 'vite';
import {
  collectImportedCssModules,
  createCssUpdatePayload,
  dispatchTailwindCssUpdates
} from '../src/runtime/tailwind-hmr.js';

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

describe('collectImportedCssModules', () => {
  it('collects transitive imported css modules once', () => {
    const css = createModule({
      url: '/theme.css',
      type: 'css',
      importedModules: new Set()
    });
    const child = createModule({
      url: '/theme.tsx',
      importedModules: new Set([css])
    });
    const root = createModule({
      url: '/virtual-theme',
      importedModules: new Set([child, css])
    });

    expect(collectImportedCssModules(root)).toEqual([css]);
  });
});

describe('createCssUpdatePayload', () => {
  it('creates css-update entries from css modules', () => {
    const payload = createCssUpdatePayload(
      [
        createModule({ url: '/theme.css', type: 'css', importedModules: new Set() }),
        createModule({ url: '/ignore.js', type: 'js', importedModules: new Set() })
      ],
      123
    );

    expect(payload).toEqual({
      type: 'update',
      updates: [
        {
          type: 'css-update',
          path: '/theme.css',
          acceptedPath: '/theme.css',
          timestamp: 123
        }
      ]
    });
  });
});

describe('dispatchTailwindCssUpdates', () => {
  it('sends a css update when css modules are available', () => {
    const send = vi.fn<(payload: HotPayload) => void>();

    const result = dispatchTailwindCssUpdates({
      file: '/tmp/demo/deck.mdx',
      hot: { send },
      modules: [createModule({ url: '/theme.css', type: 'css', importedModules: new Set() })],
      timestamp: 42
    });

    expect(result).toEqual({ kind: 'css-update', updateCount: 1 });
    expect(send).toHaveBeenCalledWith({
      type: 'update',
      updates: [
        {
          type: 'css-update',
          path: '/theme.css',
          acceptedPath: '/theme.css',
          timestamp: 42
        }
      ]
    });
  });

  it('falls back to a full reload when no css modules are available', () => {
    const send = vi.fn<(payload: HotPayload) => void>();

    const result = dispatchTailwindCssUpdates({
      file: '/tmp/demo/deck.mdx',
      hot: { send },
      modules: [],
      timestamp: 42
    });

    expect(result).toEqual({ kind: 'full-reload', updateCount: 0 });
    expect(send).toHaveBeenCalledWith({
      type: 'full-reload',
      path: '*',
      triggeredBy: '/tmp/demo/deck.mdx'
    });
  });
});
