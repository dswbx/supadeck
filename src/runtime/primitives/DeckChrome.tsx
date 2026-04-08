import { DeckProgress } from './DeckProgress.js';
import { DeckTitle } from './DeckTitle.js';

interface DeckChromeProps {
  title?: string;
  currentIndex: number;
  total: number;
}

export function DeckChrome({ title, currentIndex, total }: DeckChromeProps) {
  return (
    <div className="deck-chrome">
      <DeckTitle title={title} />
      <DeckProgress currentIndex={currentIndex} total={total} />
    </div>
  );
}
