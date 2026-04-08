import type React from 'react';
import type { DeckConfig, DeckModule } from '../content/parse-deck.js';

export type MdxComponentMap = Record<string, React.ComponentType<any>>;

export interface SlideFrameProps {
  children: React.ReactNode;
  config: DeckConfig;
  index: number;
  total: number;
  printMode?: boolean;
}

export interface DeckSlideRenderProps {
  slide: DeckModule['slides'][number];
  config: DeckConfig;
  total: number;
  index: number;
  printMode?: boolean;
  components: MdxComponentMap;
}

export interface ThemeHelpers {
  clamp: (value: number, min: number, max: number) => number;
  getHashIndex: (total: number) => number;
  parseAspectRatio: (input: string | undefined) => string;
}

export interface ThemeDeckProps {
  deck: DeckModule;
  config: DeckConfig;
  slides: DeckModule['slides'];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  printMode: boolean;
  components: MdxComponentMap;
  helpers: ThemeHelpers;
}

export interface ThemeSetupContext {
  deck: DeckModule;
  config: DeckConfig;
  slides: DeckModule['slides'];
  currentIndex: number;
  printMode: boolean;
  components: MdxComponentMap;
  helpers: ThemeHelpers;
  rootElement: HTMLElement;
}

export interface ThemeModule {
  Deck?: React.ComponentType<ThemeDeckProps>;
  components?: MdxComponentMap;
  setup?: (context: ThemeSetupContext) => void | (() => void);
}
