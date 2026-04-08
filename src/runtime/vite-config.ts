import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import type { HmrContext, InlineConfig, ModuleNode, Plugin } from 'vite';
import { normalizePath } from 'vite';
import { parseDeck } from '../content/parse-deck.js';
import { remarkUnwrapJsxParagraphs } from '../content/remark-unwrap-jsx-paragraphs.js';
import { injectTailwindSources } from './tailwind-sources.js';
import {
  resolveRuntimeModulePath,
  resolveThemeModulePath
} from './theme-resolution.js';

const DECK_VIRTUAL_ID = 'virtual:supaslides/deck';
const DECK_VIRTUAL_RESOLVED = '\0virtual:supaslides/deck';
const THEME_ID = 'virtual:supaslides/theme';
const THEME_RESOLVED = '\0virtual:supaslides/theme';
const ROOT_EXPORT_ID = 'supaslides';
const ROOT_EXPORT_RESOLVED = '\0virtual:supaslides/root-export';

function toFsImport(filePath: string): string {
  return `/@fs/${normalizePath(filePath)}`;
}

function slideIdFor(deckPath: string, index: number): string {
  return `${normalizePath(deckPath)}?supaslides-slide=${index}`;
}

function sanitizeForTemplateLiteral(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function isCssModule(module: ModuleNode): boolean {
  const id = module.id ?? module.file ?? '';
  const [pathname] = id.split('?', 1);
  return pathname.endsWith('.css');
}

function collectImportedCssModules(rootModule: ModuleNode): ModuleNode[] {
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

  return cssModules;
}

function invalidateModules(
  context: HmrContext,
  modules: Iterable<ModuleNode>,
  affectedModules: ModuleNode[]
): void {
  for (const module of modules) {
    context.server.moduleGraph.invalidateModule(module);
    affectedModules.push(module);
  }
}

interface SupaslidesConfigOptions {
  deckPath: string;
  port?: number;
  open?: boolean;
  themeOverride?: string;
  outputDirName?: string;
}

function createSupaslidesPlugin({
  deckPath,
  themeOverride
}: Pick<SupaslidesConfigOptions, 'deckPath' | 'themeOverride'>): Plugin {
  let lastKnownSlideCount = 0;
  let lastKnownThemePath = resolveThemeModulePath(
    deckPath,
    themeOverride ?? 'default',
    import.meta.url
  );

  return {
    name: 'supaslides',
    enforce: 'pre',
    async load(this, id) {
      if (id === DECK_VIRTUAL_RESOLVED) {
        this.addWatchFile(deckPath);
        const source = await fs.readFile(deckPath, 'utf8');
        const deck = parseDeck(source, { themeOverride });
        lastKnownSlideCount = deck.slides.length;
        const imports = deck.slides
          .map((slide, index) => `import Slide${index} from ${JSON.stringify(slideIdFor(deckPath, index))};`)
          .join('\n');
        const slides = deck.slides
          .map(
            (slide, index) =>
              `{ index: ${index}, body: \`${sanitizeForTemplateLiteral(slide.body)}\`, Component: Slide${index} }`
          )
          .join(',\n');

        return `
${imports}

const deck = {
  config: ${JSON.stringify(deck.config)},
  slides: [${slides}]
};

export default deck;
`;
      }

      if (id === THEME_RESOLVED) {
        this.addWatchFile(deckPath);
        const source = await fs.readFile(deckPath, 'utf8');
        const deck = parseDeck(source, { themeOverride });
        lastKnownSlideCount = deck.slides.length;
        lastKnownThemePath = resolveThemeModulePath(deckPath, deck.config.theme, import.meta.url);
        this.addWatchFile(lastKnownThemePath);
        return `import themeModule from ${JSON.stringify(toFsImport(lastKnownThemePath))};\nexport default themeModule;`;
      }

      if (id === ROOT_EXPORT_RESOLVED) {
        const rootExportPath = resolveRuntimeModulePath(import.meta.url, '../index');
        return `export * from ${JSON.stringify(toFsImport(rootExportPath))};`;
      }

      if (id.startsWith(`${normalizePath(deckPath)}?supaslides-slide=`)) {
        this.addWatchFile(deckPath);
        const source = await fs.readFile(deckPath, 'utf8');
        const deck = parseDeck(source, { themeOverride });
        lastKnownSlideCount = deck.slides.length;
        const index = Number(id.split('=').at(-1));
        const slide = deck.slides[index];
        if (!slide) {
          throw new Error(`Slide ${index} does not exist in ${deckPath}`);
        }

        return `${deck.prelude}\n\n${slide.body}`;
      }

      return null;
    },
    resolveId(id) {
      if (id === DECK_VIRTUAL_ID) {
        return DECK_VIRTUAL_RESOLVED;
      }
      if (id === THEME_ID) {
        return THEME_RESOLVED;
      }
      if (id === ROOT_EXPORT_ID) {
        return ROOT_EXPORT_RESOLVED;
      }
      if (id.startsWith(`${normalizePath(deckPath)}?supaslides-slide=`)) {
        return id;
      }
      return null;
    },
    transform(code, id) {
      const [pathname] = id.split('?', 1);

      if (!pathname.endsWith('.css')) {
        return null;
      }

      return {
        code: injectTailwindSources(code, deckPath),
        map: null
      };
    },
    async handleHotUpdate(context) {
      if (normalizePath(context.file) === normalizePath(deckPath)) {
        const source = await fs.readFile(deckPath, 'utf8');
        const deck = parseDeck(source, { themeOverride });
        const affectedModules: ModuleNode[] = [];
        const slideCount = Math.max(lastKnownSlideCount, deck.slides.length);
        lastKnownThemePath = resolveThemeModulePath(deckPath, deck.config.theme, import.meta.url);

        for (const moduleId of [DECK_VIRTUAL_RESOLVED, THEME_RESOLVED]) {
          const module = context.server.moduleGraph.getModuleById(moduleId);
          if (module) {
            invalidateModules(context, [module], affectedModules);

            if (moduleId === THEME_RESOLVED) {
              invalidateModules(context, collectImportedCssModules(module), affectedModules);
            }
          }
        }

        for (let index = 0; index < slideCount; index += 1) {
          const module = context.server.moduleGraph.getModuleById(slideIdFor(deckPath, index));
          if (module) {
            invalidateModules(context, [module], affectedModules);
          }
        }

        lastKnownSlideCount = deck.slides.length;
        return affectedModules;
      }

      if (normalizePath(context.file) === normalizePath(lastKnownThemePath)) {
        const themeModule = context.server.moduleGraph.getModuleById(THEME_RESOLVED);
        if (themeModule) {
          context.server.moduleGraph.invalidateModule(themeModule);
          return [themeModule];
        }
      }

      return undefined;
    }
  };
}

export function createSupaslidesViteConfig({
  deckPath,
  port,
  open,
  themeOverride,
  outputDirName = '.supaslides-dist'
}: SupaslidesConfigOptions): InlineConfig {
  const runtimeRoot = fileURLToPath(new URL('.', import.meta.url));
  const packageRoot = path.resolve(runtimeRoot, '..');
  const workspaceRoot = path.dirname(deckPath);

  return {
    root: runtimeRoot,
    plugins: [
      createSupaslidesPlugin({ deckPath, themeOverride }),
      mdx({
        include: [/\.mdx$/, /\.mdx\?.*$/],
        remarkPlugins: [remarkUnwrapJsxParagraphs]
      }),
      react(),
      tailwindcss()
    ],
    server: {
      host: '127.0.0.1',
      port,
      open,
      fs: {
        allow: [runtimeRoot, packageRoot, workspaceRoot]
      }
    },
    preview: {
      host: '127.0.0.1'
    },
    build: {
      outDir: path.resolve(workspaceRoot, outputDirName),
      emptyOutDir: true
    }
  };
}
