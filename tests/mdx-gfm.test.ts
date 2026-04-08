import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import remarkGfm from 'remark-gfm';
import { remarkUnwrapJsxParagraphs } from '../src/content/remark-unwrap-jsx-paragraphs.js';

describe('MDX GFM support', () => {
  it('compiles pipe tables into table elements', async () => {
    const result = await compile(
      `| Name | Value |
| ---- | ----- |
| One  | 1     |`,
      {
        jsx: true,
        remarkPlugins: [remarkGfm, remarkUnwrapJsxParagraphs]
      }
    );

    const code = String(result);

    expect(code).toContain('table: "table"');
    expect(code).toContain('thead: "thead"');
    expect(code).toContain('tbody: "tbody"');
    expect(code).toContain('th: "th"');
    expect(code).toContain('td: "td"');
    expect(code).not.toContain('<_components.p>{"| Name | Value |');
  });
});
