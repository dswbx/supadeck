import fs from 'node:fs/promises';
import path from 'node:path';
import { starterDeckTemplate } from './templates.js';

export function resolveDeckPath(
  input?: string,
  cwd = process.cwd(),
  defaultInput?: string
): string {
  const resolvedInput = input ?? defaultInput;

  if (!resolvedInput) {
    return path.resolve(cwd, 'deck.mdx');
  }

  const candidate = path.resolve(cwd, resolvedInput);
  if (path.extname(candidate)) {
    return candidate;
  }

  return path.join(candidate, 'deck.mdx');
}

async function writeFileIfMissing(filePath: string, contents: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, 'utf8');
  }
}

export async function ensureStarterDeck(deckPath: string): Promise<void> {
  await writeFileIfMissing(deckPath, starterDeckTemplate());
}
