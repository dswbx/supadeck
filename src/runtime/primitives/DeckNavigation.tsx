interface DeckNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
}

export function DeckNavigation({ onPrevious, onNext }: DeckNavigationProps) {
  return (
    <div className="deck-nav">
      <button className="deck-button" type="button" onClick={onPrevious}>
        Prev
      </button>
      <button className="deck-button" type="button" onClick={onNext}>
        Next
      </button>
    </div>
  );
}
