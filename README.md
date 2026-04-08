# Supaslides

Zero-config MDX presentations with a hot-reloading Vite runtime and PDF export.

## Usage

```bash
npx supaslides
npx supaslides export
```

Themes are React modules referenced from `deck.mdx` frontmatter. A theme can import its own CSS, render the whole deck UI, override MDX tag renderers, and expose additional components directly to MDX.

Deck content supports GitHub Flavored Markdown, including pipe tables, strikethrough, and task lists.

In this repository, `bun run dev` and `bun run export` target the built-in example at `examples/dev`.

## Supabase theme

Use `theme: supabase` to get the presentation style used by the reference Supabase-stage deck.

```yaml
title: supalite
theme: supabase
sections:
  - label: Intro
    start: 1
    end: 1
  - label: Goals
    start: 2
    end: 4
```

`sections` are 1-based inclusive slide ranges used by the fixed footer breadcrumb nav. The repository includes a working example at `examples/supabase/deck.mdx`.
