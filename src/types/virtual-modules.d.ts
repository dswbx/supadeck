declare module 'virtual:supaslides/deck' {
  const deck: import('../content/parse-deck.js').DeckModule;
  export default deck;
}

declare module 'virtual:supaslides/theme-entry' {
  const themeEntry: undefined;
  export default themeEntry;
}

interface Window {
  __SUPASLIDES_READY__?: boolean;
}
