import { DeckSlide } from '../../layout/DeckSlide.js';
import { DeckChrome } from '../../primitives/DeckChrome.js';
import { DeckNavigation } from '../../primitives/DeckNavigation.js';
import type { ThemeDeckProps } from '../../theme-types.js';

export function DefaultDeck({
  config,
  slides,
  currentIndex,
  setCurrentIndex,
  printMode,
  components,
  helpers
}: ThemeDeckProps) {
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
            components={components}
          />
        ))}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <DeckChrome title={config.title} currentIndex={currentIndex} total={slides.length} />

      <div className="deck-stage">
        <DeckSlide
          slide={slides[currentIndex]}
          config={config}
          total={slides.length}
          index={currentIndex}
          components={components}
        />
      </div>

      <DeckNavigation
        onPrevious={() =>
          setCurrentIndex((value) => helpers.clamp(value - 1, 0, slides.length - 1))
        }
        onNext={() =>
          setCurrentIndex((value) => helpers.clamp(value + 1, 0, slides.length - 1))
        }
      />
    </main>
  );
}
