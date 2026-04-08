import type React from 'react';
import { Callout, Columns, Disclosure, Frame } from './components/index.js';
import type { MdxComponentMap, ThemeModule } from './theme-types.js';

export function createDefaultComponents(): MdxComponentMap {
  return {
    h1: (props: React.ComponentProps<'h1'>) => (
      <h1
        className="text-6xl font-semibold tracking-tight text-balance"
        {...props}
      />
    ),
    h2: (props: React.ComponentProps<'h2'>) => (
      <h2
        className="text-4xl font-semibold tracking-tight text-balance"
        {...props}
      />
    ),
    h3: (props: React.ComponentProps<'h3'>) => (
      <h3 className="text-2xl font-semibold tracking-tight" {...props} />
    ),
    p: (props: React.ComponentProps<'p'>) => (
      <p
        className="text-2xl leading-relaxed text-[color:var(--color-foreground)]/90"
        {...props}
      />
    ),
    a: (props: React.ComponentProps<'a'>) => (
      <a
        className="text-[color:var(--color-accent)] underline decoration-2 underline-offset-4"
        {...props}
      />
    ),
    ul: (props: React.ComponentProps<'ul'>) => (
      <ul className="list-disc space-y-3 pl-8 text-2xl" {...props} />
    ),
    ol: (props: React.ComponentProps<'ol'>) => (
      <ol className="list-decimal space-y-3 pl-8 text-2xl" {...props} />
    ),
    li: (props: React.ComponentProps<'li'>) => (
      <li className="pl-2" {...props} />
    ),
    code: (props: React.ComponentProps<'code'>) => (
      <code
        className="rounded-md bg-black/10 px-2 py-1 font-mono text-[0.9em] dark:bg-white/10"
        {...props}
      />
    ),
    pre: (props: React.ComponentProps<'pre'>) => (
      <pre
        className="overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] p-6 text-lg"
        {...props}
      />
    ),
    blockquote: (props: React.ComponentProps<'blockquote'>) => (
      <blockquote
        className="border-l-4 border-[color:var(--color-accent)] pl-6 text-2xl italic"
        {...props}
      />
    ),
    Callout,
    Columns,
    Disclosure,
    Frame
  };
}

export function mergeComponents(theme?: ThemeModule): MdxComponentMap {
  return {
    ...createDefaultComponents(),
    ...(theme?.components ?? {})
  };
}
