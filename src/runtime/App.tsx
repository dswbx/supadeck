import React, { useEffect } from "react";
import type { DeckConfig, DeckModule } from "../content/parse-deck.js";
import { DeckSlide } from "./layout/DeckSlide.js";
import {
   getHashIndex,
   parseAspectRatio,
   clamp,
} from "./utils/use-current-slide.js";
import { useCurrentSlide } from "./hooks/slides.js";

export interface SlideFrameProps {
   children: React.ReactNode;
   config: DeckConfig;
   index: number;
   total: number;
   printMode?: boolean;
}

export interface DeckSlideProps {
   slide: DeckModule["slides"][number];
   config: DeckConfig;
   total: number;
   index: number;
   printMode?: boolean;
}

interface AppProps {
   deck: DeckModule;
}

export function App({ deck }: AppProps) {
   const slides = deck.slides ?? [];
   const config = deck.config ?? {};
   const [index, setIndex] = useCurrentSlide(slides.length);
   const printMode =
      new URLSearchParams(window.location.search).get("print") === "1";

   useEffect(() => {
      document.title = config.title ?? "Supaslides";
      window.__SUPASLIDES_READY__ = true;
      return () => {
         window.__SUPASLIDES_READY__ = false;
      };
   }, [config.title]);

   useEffect(() => {
      const root = document.documentElement;
      root.style.setProperty(
         "--slide-aspect-ratio",
         parseAspectRatio(config.aspectRatio)
      );
      root.dataset.transition = config.transition ?? "fade";
   }, [config.aspectRatio, config.transition]);

   if (slides.length === 0) {
      return <div className="p-10 text-white">No slides found.</div>;
   }

   if (printMode) {
      return (
         <main className="print-deck">
            {slides.map((slide, slideIndex) => (
               <DeckSlide
                  key={slideIndex}
                  slide={slide}
                  config={config}
                  total={slides.length}
                  index={slideIndex}
                  printMode
               />
            ))}
         </main>
      );
   }

   return (
      <main className="app-shell">
         <div className="deck-chrome">
            <div className="deck-title">{config.title}</div>
            <div className="deck-progress">
               <div
                  className="deck-progress-bar"
                  style={{ width: `${((index + 1) / slides.length) * 100}%` }}
               />
            </div>
         </div>

         <div className="deck-stage">
            <DeckSlide
               slide={slides[index]}
               config={config}
               total={slides.length}
               index={index}
            />
         </div>

         <div className="deck-nav">
            <button
               className="deck-button"
               type="button"
               onClick={() =>
                  setIndex((current) =>
                     clamp(current - 1, 0, slides.length - 1)
                  )
               }
            >
               Prev
            </button>
            <button
               className="deck-button"
               type="button"
               onClick={() =>
                  setIndex((current) =>
                     clamp(current + 1, 0, slides.length - 1)
                  )
               }
            >
               Next
            </button>
         </div>
      </main>
   );
}

export { clamp, getHashIndex, parseAspectRatio };
