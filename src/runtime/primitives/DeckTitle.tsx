interface DeckTitleProps {
  title?: string;
}

export function DeckTitle({ title }: DeckTitleProps) {
  return <div className="deck-title">{title}</div>;
}
