import React from 'react';
import type { DeckConfig, DeckModule } from '../content/parse-deck.js';

type MdxComponentMap = Record<string, React.ComponentType<any>>;

interface SlideFrameProps {
  children: React.ReactNode;
  config: DeckConfig;
  index: number;
  total: number;
  printMode?: boolean;
}

interface DeckSlideProps {
  slide: DeckModule['slides'][number];
  config: DeckConfig;
  total: number;
  index: number;
  printMode?: boolean;
}

interface AppProps {
  deck: DeckModule;
}

function parseAspectRatio(input: string | undefined): string {
  const value = String(input ?? '16:9');
  const parts = value.split(':').map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((part) => !Number.isFinite(part) || part <= 0)) {
    return '16 / 9';
  }
  return `${parts[0]} / ${parts[1]}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getHashIndex(total: number): number {
  const raw = Number(window.location.hash.replace('#', ''));
  if (!Number.isFinite(raw) || raw < 1) {
    return 0;
  }
  return clamp(raw - 1, 0, Math.max(total - 1, 0));
}

function useCurrentSlide(total: number): readonly [number, React.Dispatch<React.SetStateAction<number>>] {
  const [index, setIndex] = React.useState(() => getHashIndex(total));

  React.useEffect(() => {
    const onHashChange = () => setIndex(getHashIndex(total));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [total]);

  React.useEffect(() => {
    const nextHash = `#${index + 1}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }
  }, [index]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault();
        setIndex((current) => clamp(current + 1, 0, total - 1));
      }

      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        setIndex((current) => clamp(current - 1, 0, total - 1));
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setIndex(0);
      }

      if (event.key === 'End') {
        event.preventDefault();
        setIndex(total - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [total]);

  React.useEffect(() => {
    setIndex((current) => clamp(current, 0, Math.max(total - 1, 0)));
  }, [total]);

  return [index, setIndex];
}

function mdxComponents(): MdxComponentMap {
  return {
    h1: (props: React.ComponentProps<'h1'>) => <h1 className="text-6xl font-semibold tracking-tight text-balance" {...props} />,
    h2: (props: React.ComponentProps<'h2'>) => <h2 className="text-4xl font-semibold tracking-tight text-balance" {...props} />,
    h3: (props: React.ComponentProps<'h3'>) => <h3 className="text-2xl font-semibold tracking-tight" {...props} />,
    p: (props: React.ComponentProps<'p'>) => <p className="text-2xl leading-relaxed text-[color:var(--color-foreground)]/90" {...props} />,
    a: (props: React.ComponentProps<'a'>) => <a className="text-[color:var(--color-accent)] underline decoration-2 underline-offset-4" {...props} />,
    ul: (props: React.ComponentProps<'ul'>) => <ul className="list-disc space-y-3 pl-8 text-2xl" {...props} />,
    ol: (props: React.ComponentProps<'ol'>) => <ol className="list-decimal space-y-3 pl-8 text-2xl" {...props} />,
    li: (props: React.ComponentProps<'li'>) => <li className="pl-2" {...props} />,
    code: (props: React.ComponentProps<'code'>) => <code className="rounded-md bg-black/10 px-2 py-1 font-mono text-[0.9em] dark:bg-white/10" {...props} />,
    pre: (props: React.ComponentProps<'pre'>) => <pre className="overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] p-6 text-lg" {...props} />,
    blockquote: (props: React.ComponentProps<'blockquote'>) => <blockquote className="border-l-4 border-[color:var(--color-accent)] pl-6 text-2xl italic" {...props} />
  };
}

function SlideFrame({ children, config, index, total, printMode }: SlideFrameProps) {
  const ratio = parseAspectRatio(config.aspectRatio);
  return (
    <section
      className={`slide-frame ${printMode ? 'slide-frame-print' : ''}`}
      style={{ '--slide-aspect-ratio': ratio } as React.CSSProperties}
      data-transition={config.transition}
    >
      <div className="slide-surface">
        <div className="slide-content">{children}</div>
        {config.showSlideNumbers ? (
          <div className="slide-footer">
            <span>
              {index + 1} / {total}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DeckSlide({ slide, config, total, index, printMode }: DeckSlideProps) {
  const Slide = slide.Component;
  return (
    <SlideFrame config={config} index={index} total={total} printMode={printMode}>
      <Slide components={mdxComponents()} />
    </SlideFrame>
  );
}

export function App({ deck }: AppProps) {
  const slides = deck.slides ?? [];
  const config = deck.config ?? {};
  const [index, setIndex] = useCurrentSlide(slides.length);
  const printMode = new URLSearchParams(window.location.search).get('print') === '1';

  React.useEffect(() => {
    document.title = config.title ?? 'Supaslides';
    window.__SUPASLIDES_READY__ = true;
    return () => {
      window.__SUPASLIDES_READY__ = false;
    };
  }, [config.title]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--slide-aspect-ratio', parseAspectRatio(config.aspectRatio));
    root.dataset.transition = config.transition ?? 'fade';
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
        <DeckSlide slide={slides[index]} config={config} total={slides.length} index={index} />
      </div>

      <div className="deck-nav">
        <button className="deck-button" type="button" onClick={() => setIndex((current) => clamp(current - 1, 0, slides.length - 1))}>
          Prev
        </button>
        <button className="deck-button" type="button" onClick={() => setIndex((current) => clamp(current + 1, 0, slides.length - 1))}>
          Next
        </button>
      </div>
    </main>
  );
}

export { clamp, getHashIndex, parseAspectRatio };
