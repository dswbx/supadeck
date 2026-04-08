import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import type { InlineConfig, Plugin } from 'vite';
import { normalizePath } from 'vite';
import { parseDeck } from '../content/parse-deck.js';

const DECK_VIRTUAL_ID = 'virtual:supaslides/deck';
const DECK_VIRTUAL_RESOLVED = '\0virtual:supaslides/deck';
const THEME_ENTRY_ID = 'virtual:supaslides/theme-entry';
const THEME_ENTRY_RESOLVED = '\0virtual:supaslides/theme-entry';
const COMPONENTS_ID = 'supaslides/components';
const COMPONENTS_RESOLVED = '\0virtual:supaslides/components';

const builtInThemes: Record<string, string> = {
  default: fileURLToPath(new URL('./themes/default.css', import.meta.url)),
  sunset: fileURLToPath(new URL('./themes/sunset.css', import.meta.url))
};

function toFsImport(filePath: string): string {
  return `/@fs/${normalizePath(filePath)}`;
}

function slideIdFor(deckPath: string, index: number): string {
  return `${normalizePath(deckPath)}?supaslides-slide=${index}`;
}

function sanitizeForTemplateLiteral(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function resolveRuntimeModulePath(baseUrl: string, stem: string): string {
  for (const extension of ['.tsx', '.ts', '.jsx', '.js']) {
    const candidate = fileURLToPath(new URL(`${stem}${extension}`, baseUrl));
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return fileURLToPath(new URL(`${stem}.js`, baseUrl));
}

function resolveThemeFile(deckPath: string, themeName: string) {
  if (!themeName || builtInThemes[themeName]) {
    return {
      builtInThemePath: builtInThemes[themeName || 'default'],
      customThemePath: null
    };
  }

  const customThemePath = path.resolve(path.dirname(deckPath), themeName);
  return {
    builtInThemePath: builtInThemes.default,
    customThemePath
  };
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

      if (id === THEME_ENTRY_RESOLVED) {
        this.addWatchFile(deckPath);
        const source = await fs.readFile(deckPath, 'utf8');
        const deck = parseDeck(source, { themeOverride });
        lastKnownSlideCount = deck.slides.length;
        const themeFiles = resolveThemeFile(deckPath, deck.config.theme);
        if (themeFiles.customThemePath) {
          this.addWatchFile(themeFiles.customThemePath);
        }
        const imports = [`import ${JSON.stringify(toFsImport(themeFiles.builtInThemePath))};`];
        if (themeFiles.customThemePath) {
          imports.push(`import ${JSON.stringify(toFsImport(themeFiles.customThemePath))};`);
        }

        return `${imports.join('\n')}\nexport {};`;
      }

      if (id === COMPONENTS_RESOLVED) {
        const componentPath = resolveRuntimeModulePath(import.meta.url, './public-components');
        return `export * from ${JSON.stringify(toFsImport(componentPath))};`;
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
      if (id === THEME_ENTRY_ID) {
        return THEME_ENTRY_RESOLVED;
      }
      if (id === COMPONENTS_ID) {
        return COMPONENTS_RESOLVED;
      }
      if (id.startsWith(`${normalizePath(deckPath)}?supaslides-slide=`)) {
        return id;
      }
      return null;
    },
    async handleHotUpdate(context) {
      if (normalizePath(context.file) === normalizePath(deckPath)) {
        const source = await fs.readFile(deckPath, 'utf8');
        const deck = parseDeck(source, { themeOverride });
        const affectedModules = [];
        const slideCount = Math.max(lastKnownSlideCount, deck.slides.length);

        for (const moduleId of [DECK_VIRTUAL_RESOLVED, THEME_ENTRY_RESOLVED]) {
          const module = context.server.moduleGraph.getModuleById(moduleId);
          if (module) {
            context.server.moduleGraph.invalidateModule(module);
            affectedModules.push(module);
          }
        }

        for (let index = 0; index < slideCount; index += 1) {
          const module = context.server.moduleGraph.getModuleById(slideIdFor(deckPath, index));
          if (module) {
            context.server.moduleGraph.invalidateModule(module);
            affectedModules.push(module);
          }
        }

        lastKnownSlideCount = deck.slides.length;
        return affectedModules;
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
  const workspaceRoot = path.dirname(deckPath);

  return {
    root: runtimeRoot,
    plugins: [
      createSupaslidesPlugin({ deckPath, themeOverride }),
      mdx({
        include: [/\.mdx$/, /\.mdx\?.*$/]
      }),
      react(),
      tailwindcss()
    ],
    server: {
      host: '127.0.0.1',
      port,
      open,
      fs: {
        allow: [runtimeRoot, workspaceRoot]
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
