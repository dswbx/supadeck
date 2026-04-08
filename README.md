# Supaslides

Zero-config MDX presentations with a hot-reloading Vite runtime and PDF export.

## Usage

```bash
npx supaslides
npx supaslides export
```

Themes are React modules referenced from `deck.mdx` frontmatter. A theme can import its own CSS, render the whole deck UI, override MDX tag renderers, and expose additional components directly to MDX.
