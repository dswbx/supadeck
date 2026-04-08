import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDefaultComponents } from '../src/runtime/default-components.js';

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
});
