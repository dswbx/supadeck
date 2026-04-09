import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const MODULE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

const BUILTIN_THEME_STEMS: Record<string, string> = {
  default: './themes/default/index',
  sunset: './themes/sunset/index'
};

export function resolveRuntimeModulePath(baseUrl: string, stem: string): string {
  for (const extension of MODULE_EXTENSIONS) {
    const candidate = fileURLToPath(new URL(`${stem}${extension}`, baseUrl));
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return fileURLToPath(new URL(`${stem}.js`, baseUrl));
}

function resolveFileCandidate(stem: string): string | null {
  if (existsSync(stem) && statSync(stem).isFile()) {
    return stem;
  }

  for (const extension of MODULE_EXTENSIONS) {
    const candidate = `${stem}${extension}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function resolveDirectoryIndex(directoryPath: string): string {
  for (const extension of MODULE_EXTENSIONS) {
    const candidate = path.join(directoryPath, `index${extension}`);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  throw new Error(`Theme directory "${directoryPath}" is missing an index theme module.`);
}

export function resolveThemeModulePath(
  deckPath: string,
  themeName: string,
  baseUrl = import.meta.url
): string {
  if (!themeName || BUILTIN_THEME_STEMS[themeName]) {
    return resolveRuntimeModulePath(baseUrl, BUILTIN_THEME_STEMS[themeName || 'default']);
  }

  const candidate = path.resolve(path.dirname(deckPath), themeName);

  if (path.extname(candidate)) {
    if (!existsSync(candidate)) {
      throw new Error(`Theme file "${themeName}" does not exist.`);
    }
    return candidate;
  }

  const fileCandidate = resolveFileCandidate(candidate);
  if (fileCandidate) {
    return fileCandidate;
  }

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return resolveDirectoryIndex(candidate);
  }

  const indexFile = resolveFileCandidate(path.join(candidate, 'index'));
  if (indexFile) {
    return indexFile;
  }

  throw new Error(
    `Unable to resolve theme "${themeName}". Use a built-in id, a theme directory, or a .tsx theme file.`
  );
}
