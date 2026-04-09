import React from "react";
import { createRoot } from "react-dom/client";
import deckModule from "virtual:supadeck/deck";
import themeModule from "virtual:supadeck/theme";
import { App } from "./App.js";
import type { DeckModule } from "../content/parse-deck.js";
import type { ThemeModule } from "./theme-types.js";

const container = document.getElementById("root");

if (!container) {
   throw new Error("Unable to find the Supadeck root container.");
}

const root = createRoot(container);
let currentDeck = deckModule;
let currentTheme = themeModule;

function render(
   deck: DeckModule = currentDeck,
   theme: ThemeModule = currentTheme
): void {
   root.render(
      <React.StrictMode>
         <App deck={deck} theme={theme} />
      </React.StrictMode>
   );
}

render();

if (import.meta.hot) {
   import.meta.hot.accept("virtual:supadeck/deck", (nextModule: unknown) => {
      currentDeck =
         (nextModule as { default?: DeckModule } | undefined)?.default ??
         currentDeck;
      render();
   });

   import.meta.hot.accept("virtual:supadeck/theme", (nextModule: unknown) => {
      currentTheme =
         (nextModule as { default?: ThemeModule } | undefined)?.default ??
         currentTheme;
      render();
   });
}
