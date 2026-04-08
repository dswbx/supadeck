interface DeckProgressProps {
  currentIndex: number;
  total: number;
}

export function DeckProgress({ currentIndex, total }: DeckProgressProps) {
  const width = total > 0 ? `${((currentIndex + 1) / total) * 100}%` : '0%';

  return (
    <div className="deck-progress">
      <div className="deck-progress-bar" style={{ width }} />
    </div>
  );
}
