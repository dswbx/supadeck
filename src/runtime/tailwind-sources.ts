import path from 'node:path';
import { normalizePath } from 'vite';

const TAILWIND_IMPORT_PATTERN = /@import\s+["']tailwindcss["'];/;
const TAILWIND_SOURCE_EXTENSIONS = new Set([
  '.mdx',
  '.md',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.html'
]);
const TAILWIND_SOURCE_GLOB = '**/*.{mdx,md,tsx,ts,jsx,js,html}';

function quoteCssString(value: string): string {
  return JSON.stringify(value);
}

export function resolveTailwindWorkspaceRoot(deckPath: string): string {
  return normalizePath(path.dirname(deckPath));
}

export function isTailwindSourceFile(deckPath: string, filePath: string): boolean {
  const workspaceRoot = resolveTailwindWorkspaceRoot(deckPath);
  const normalizedFilePath = normalizePath(filePath);
  const relativePath = path.posix.relative(workspaceRoot, normalizedFilePath);

  if (
    relativePath === '' ||
    relativePath === '.' ||
    relativePath.startsWith('..') ||
    path.posix.isAbsolute(relativePath)
  ) {
    return false;
  }

  return TAILWIND_SOURCE_EXTENSIONS.has(path.posix.extname(normalizedFilePath));
}

export function createTailwindSourceDirectives(deckPath: string): string {
  const workspacePattern = `${resolveTailwindWorkspaceRoot(deckPath)}/${TAILWIND_SOURCE_GLOB}`;

  return `@source ${quoteCssString(workspacePattern)};\n`;
}

export function injectTailwindSources(css: string, deckPath: string): string {
  if (!TAILWIND_IMPORT_PATTERN.test(css)) {
    return css;
  }

  const directives = createTailwindSourceDirectives(deckPath);
  return css.startsWith(directives) ? css : `${directives}${css}`;
}
