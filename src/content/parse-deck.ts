import type React from 'react';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';

interface DeckAstNode {
  type: string;
  position?: {
    start?: { offset?: number | null };
    end?: { offset?: number | null };
  };
}

interface DeckAstRoot {
  children?: DeckAstNode[];
}

const parser = unified().use(remarkParse as never).use(remarkMdx as never);

export interface DeckConfig {
  title: string;
  theme: string;
  aspectRatio: string;
  showSlideNumbers: boolean;
  transition: 'none' | 'fade' | 'slide' | string;
}

export interface DeckSlide {
  index: number;
  body: string;
}

export interface ParsedDeck {
  frontmatter: Record<string, unknown>;
  config: DeckConfig;
  prelude: string;
  slides: DeckSlide[];
  rawContent: string;
}

export interface DeckModule extends Omit<ParsedDeck, 'prelude' | 'rawContent' | 'frontmatter'> {
  slides: Array<DeckSlide & { Component: React.ComponentType<{ components?: Record<string, React.ComponentType<any>> }> }>;
}

const DEFAULT_CONFIG: DeckConfig = {
  title: 'Untitled deck',
  theme: 'default',
  aspectRatio: '16:9',
  showSlideNumbers: true,
  transition: 'fade'
};

function toOffset(point?: { offset?: number | null }): number {
  return point?.offset ?? 0;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeDeckConfig(
  frontmatter: Record<string, unknown> = {},
  themeOverride?: string
): DeckConfig {
  return {
    title: asString(frontmatter.title, DEFAULT_CONFIG.title),
    theme: themeOverride ?? asString(frontmatter.theme, DEFAULT_CONFIG.theme),
    aspectRatio: asString(frontmatter.aspectRatio, DEFAULT_CONFIG.aspectRatio),
    showSlideNumbers: asBoolean(frontmatter.showSlideNumbers, DEFAULT_CONFIG.showSlideNumbers),
    transition: asString(frontmatter.transition, DEFAULT_CONFIG.transition) as DeckConfig['transition']
  };
}

export function parseDeck(source: string, options: { themeOverride?: string } = {}): ParsedDeck {
  const matterFile = matter(source);
  const content = matterFile.content.replace(/^\s+/, '');
  const tree = parser.parse(content) as DeckAstRoot;
  const children = tree.children ?? [];

  let preludeEnd = 0;
  let nodeIndex = 0;
  while (nodeIndex < children.length && children[nodeIndex]?.type === 'mdxjsEsm') {
    preludeEnd = toOffset(children[nodeIndex].position?.end);
    nodeIndex += 1;
  }

  const prelude = content.slice(0, preludeEnd).trim();
  const slideBoundaries: Array<{ start: number; end: number }> = [];

  for (const node of children.slice(nodeIndex)) {
    if (node.type === 'thematicBreak') {
      slideBoundaries.push({
        start: toOffset(node.position?.start),
        end: toOffset(node.position?.end)
      });
    }
  }

  const slides: DeckSlide[] = [];
  let cursor = preludeEnd;

  if (slideBoundaries.length === 0) {
    const body = content.slice(cursor).trim();
    if (body) {
      slides.push({ index: 0, body });
    }
  } else {
    for (const boundary of slideBoundaries) {
      const body = content.slice(cursor, boundary.start).trim();
      if (body) {
        slides.push({ index: slides.length, body });
      }
      cursor = boundary.end;
    }

    const trailing = content.slice(cursor).trim();
    if (trailing) {
      slides.push({ index: slides.length, body: trailing });
    }
  }

  if (slides.length === 0) {
    slides.push({ index: 0, body: '# Untitled slide' });
  }

  return {
    frontmatter: matterFile.data ?? {},
    config: normalizeDeckConfig(matterFile.data, options.themeOverride),
    prelude,
    slides,
    rawContent: content
  };
}
