import React from 'react';
import { createRoot } from 'react-dom/client';
import deckModule from 'virtual:supaslides/deck';
import 'virtual:supaslides/theme-entry';
import './styles/base.css';
import { App } from './App.js';
import type { DeckModule } from '../content/parse-deck.js';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Unable to find the Supaslides root container.');
}

const root = createRoot(container);

function render(deck = deckModule): void {
  root.render(
    <React.StrictMode>
      <App deck={deck} />
    </React.StrictMode>
  );
}

render();

if (import.meta.hot) {
  import.meta.hot.accept('virtual:supaslides/deck', (nextModule: unknown) => {
    const nextDeck = (nextModule as { default?: DeckModule } | undefined)?.default ?? deckModule;
    render(nextDeck);
  });
}
