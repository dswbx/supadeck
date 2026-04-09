import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDefaultComponents, mergeComponents } from '../src/runtime/default-components.js';
import defaultTheme from '../src/runtime/themes/default/index.js';

describe('createDefaultComponents', () => {
  it('renders table elements with default styling hooks', () => {
    const components = createDefaultComponents();
    const Table = components.table;
    const Thead = components.thead;
    const Tbody = components.tbody;
    const Tr = components.tr;
    const Th = components.th;
    const Td = components.td;

    const html = renderToStaticMarkup(
      <Table>
        <Thead>
          <Tr>
            <Th>Metric</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Cold start</Td>
            <Td>&lt;1s</Td>
          </Tr>
        </Tbody>
      </Table>
    );

    expect(html).toContain('deck-table-wrap');
    expect(html).toContain('deck-table');
    expect(html).toContain('deck-thead');
    expect(html).toContain('deck-tr');
    expect(html).toContain('deck-th');
    expect(html).toContain('deck-td');
    expect(html).toContain('<table');
    expect(html).toContain('<thead');
    expect(html).toContain('<tbody');
  });

  it('keeps inline code styling off highlighted block code', () => {
    const components = createDefaultComponents();
    const Code = components.code;

    const inlineHtml = renderToStaticMarkup(<Code>const answer = 42;</Code>);
    const blockHtml = renderToStaticMarkup(
      <Code className="deck-code-content" data-code-block="" data-language="ts">
        <span style={{ color: '#fff' }}>const</span>
      </Code>
    );

    expect(inlineHtml).toContain('rounded-md');
    expect(blockHtml).toContain('deck-code-content');
    expect(blockHtml).not.toContain('rounded-md');
    expect(blockHtml).not.toContain('bg-black/10');
  });
});

describe('mergeComponents with default theme', () => {
  it('preserves the Supabase code shell classes around highlighted blocks', () => {
    const components = mergeComponents(defaultTheme);
    const Pre = components.pre;
    const Code = components.code;

    const html = renderToStaticMarkup(
      <Pre className="deck-code-block shiki" data-language="ts">
        <Code className="deck-code-content" data-code-block="" data-language="ts">
          <span style={{ color: '#fff' }}>const</span>
        </Code>
      </Pre>
    );

    expect(html).toContain('supabase-pre');
    expect(html).toContain('deck-code-block');
    expect(html).toContain('deck-code-content');
    expect(html).not.toContain('supabase-inline-code');
  });
});
