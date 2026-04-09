import React, { useEffect, useMemo } from "react";
import type { DeckModule } from "../content/parse-deck.js";
import { mergeComponents } from "./default-components.js";
import { useCurrentSlide } from "./hooks/slides.js";
import type { ThemeHelpers, ThemeModule } from "./theme-types.js";
import { DefaultDeck } from "./themes/default/DefaultDeck.js";
import {
   clamp,
   getHashIndex,
   parseAspectRatio,
} from "./utils/use-current-slide.js";

interface AppProps {
   deck: DeckModule;
   theme: ThemeModule;
}

const themeHelpers: ThemeHelpers = {
   clamp,
   getHashIndex,
   parseAspectRatio,
};

export function App({ deck, theme }: AppProps) {
   const slides = deck.slides ?? [];
   const config = deck.config ?? {};
   const [index, setIndex] = useCurrentSlide(slides.length);
   const printMode =
      new URLSearchParams(window.location.search).get("print") === "1";
   const components = useMemo(() => mergeComponents(theme), [theme]);
   const DeckRenderer = theme.Deck ?? DefaultDeck;

   useEffect(() => {
      document.title = config.title ?? "Supadeck";
      window.__SUPADECK_READY__ = true;
      return () => {
         window.__SUPADECK_READY__ = false;
      };
   }, [config.title]);

   useEffect(() => {
      const cleanup = theme.setup?.({
         deck,
         config,
         slides,
         currentIndex: index,
         printMode,
         components,
         helpers: themeHelpers,
         rootElement: document.documentElement,
      });

      return () => {
         cleanup?.();
      };
   }, [theme, deck, config, slides, index, printMode, components]);

   if (slides.length === 0) {
      return <div className="p-10 text-white">No slides found.</div>;
   }

   return (
      <DeckRenderer
         deck={deck}
         config={config}
         slides={slides}
         currentIndex={index}
         setCurrentIndex={setIndex}
         printMode={printMode}
         components={components}
         helpers={themeHelpers}
      />
   );
}
