import path from 'node:path';
import type { FullReloadPayload, HotPayload, ModuleNode, Update, UpdatePayload } from 'vite';

export interface HotChannelLike {
  send(payload: HotPayload): void;
}

export interface CssUpdateDispatchResult {
  kind: 'css-update' | 'full-reload';
  updateCount: number;
}

function uniqueByUrl(modules: Iterable<ModuleNode>): ModuleNode[] {
  const seen = new Set<string>();
  const uniqueModules: ModuleNode[] = [];

  for (const module of modules) {
    if (!module.url || seen.has(module.url)) {
      continue;
    }

    seen.add(module.url);
    uniqueModules.push(module);
  }

  return uniqueModules;
}

export function isCssModule(module: ModuleNode): boolean {
  const id = module.id ?? module.file ?? module.url;
  const [pathname] = id.split('?', 1);
  return pathname.endsWith('.css');
}

export function collectImportedCssModules(rootModule: ModuleNode): ModuleNode[] {
  const queue = [...rootModule.importedModules];
  const visited = new Set<ModuleNode>();
  const cssModules: ModuleNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    if (isCssModule(current)) {
      cssModules.push(current);
    }

    for (const imported of current.importedModules) {
      queue.push(imported);
    }
  }

  return uniqueByUrl(cssModules);
}

export function createCssUpdatePayload(
  modules: Iterable<ModuleNode>,
  timestamp: number
): UpdatePayload {
  const updates: Update[] = uniqueByUrl(modules)
    .filter(isCssModule)
    .map((module) => ({
      type: 'css-update',
      path: module.url,
      acceptedPath: module.url,
      timestamp
    }));

  return {
    type: 'update',
    updates
  };
}

export function createFullReloadPayload(file: string): FullReloadPayload {
  return {
    type: 'full-reload',
    path: '*',
    triggeredBy: path.resolve(file)
  };
}

export function dispatchTailwindCssUpdates(options: {
  file: string;
  hot: HotChannelLike;
  modules: Iterable<ModuleNode>;
  timestamp: number;
}): CssUpdateDispatchResult {
  const payload = createCssUpdatePayload(options.modules, options.timestamp);

  if (payload.updates.length === 0) {
    options.hot.send(createFullReloadPayload(options.file));
    return { kind: 'full-reload', updateCount: 0 };
  }

  options.hot.send(payload);
  return { kind: 'css-update', updateCount: payload.updates.length };
}
