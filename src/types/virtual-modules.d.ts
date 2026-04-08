declare module 'virtual:supaslides/deck' {
  const deck: import('../content/parse-deck.js').DeckModule;
  export default deck;
}

declare module 'virtual:supaslides/theme' {
  const theme: import('../runtime/theme-types.js').ThemeModule;
  export default theme;
}

interface Window {
  __SUPASLIDES_READY__?: boolean;
}
