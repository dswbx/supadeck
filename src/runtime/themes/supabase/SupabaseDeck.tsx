import type { DeckSection, DeckModule } from '../../../content/parse-deck.js';
import type { MdxComponentMap, ThemeDeckProps } from '../../theme-types.js';
import { SupabaseMark } from './components.js';

function isSectionActive(section: DeckSection, currentIndex: number): boolean {
  return currentIndex >= section.start && currentIndex <= section.end;
}

interface FooterProps {
  currentIndex: number;
  total: number;
  sections: DeckSection[] | undefined;
  showSlideNumbers: boolean;
  onJumpToSlide: (index: number) => void;
}

function Footer({
  currentIndex,
  total,
  sections,
  showSlideNumbers,
  onJumpToSlide
}: FooterProps) {
  return (
    <footer className="supabase-footer">
      <SupabaseMark />

      <div className="supabase-breadcrumb" aria-label="Slide sections">
        {sections?.map((section) => (
          <button
            key={`${section.label}-${section.start}-${section.end}`}
            className={`supabase-breadcrumb-item ${isSectionActive(section, currentIndex) ? 'active' : ''}`}
            type="button"
            aria-current={isSectionActive(section, currentIndex) ? 'step' : undefined}
            onClick={() => onJumpToSlide(section.start)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {showSlideNumbers ? (
        <div className="supabase-counter">
          {currentIndex + 1} / {total}
        </div>
      ) : null}
    </footer>
  );
}

interface SlideShellProps {
  slide: DeckModule['slides'][number];
  components: MdxComponentMap;
  transition: string;
  printMode: boolean;
}

function SlideShell({ slide, components, transition, printMode }: SlideShellProps) {
  const Slide = slide.Component;

  return (
    <section
      className={`supabase-slide ${printMode ? 'supabase-slide-print' : ''}`}
      data-transition={transition}
    >
      <div className="supabase-slide-inner">
        <Slide components={components} />
      </div>
    </section>
  );
}

export function SupabaseDeck({
  deck,
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
      <main className="supabase-print-deck" data-title={deck.config.title}>
        {slides.map((slide) => (
          <SlideShell
            key={slide.index}
            slide={slide}
            components={components}
            transition={config.transition ?? 'fade'}
            printMode
          />
        ))}
      </main>
    );
  }

  const activeSlide = slides[currentIndex];
  if (!activeSlide) {
    return null;
  }

  return (
    <main className="supabase-deck-shell" data-title={deck.config.title}>
      <div className="supabase-stage">
        <SlideShell
          key={activeSlide.index}
          slide={activeSlide}
          components={components}
          transition={config.transition ?? 'fade'}
          printMode={false}
        />
      </div>

      <Footer
        currentIndex={currentIndex}
        total={slides.length}
        sections={config.sections}
        showSlideNumbers={config.showSlideNumbers}
        onJumpToSlide={(nextIndex) =>
          setCurrentIndex(helpers.clamp(nextIndex, 0, slides.length - 1))
        }
      />
    </main>
  );
}
