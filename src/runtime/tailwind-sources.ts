import { normalizePath } from 'vite';

const TAILWIND_IMPORT_PATTERN = /@import\s+["']tailwindcss["'];/;

function quoteCssString(value: string): string {
  return JSON.stringify(value);
}

export function createTailwindSourceDirectives(deckPath: string): string {
  const normalizedDeckDirectory = normalizePath(deckPath).replace(/\/[^/]+$/, '');
  const workspacePattern = `${normalizedDeckDirectory}/**/*.{mdx,md,tsx,ts,jsx,js,html}`;

  return `@source ${quoteCssString(workspacePattern)};\n`;
}

export function injectTailwindSources(css: string, deckPath: string): string {
  if (!TAILWIND_IMPORT_PATTERN.test(css)) {
    return css;
  }

  const directives = createTailwindSourceDirectives(deckPath);
  return css.startsWith(directives) ? css : `${directives}${css}`;
}
