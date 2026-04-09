declare module "virtual:supadeck/deck" {
   const deck: import("../content/parse-deck.js").DeckModule;
   export default deck;
}

declare module "virtual:supadeck/theme" {
   const theme: import("../runtime/theme-types.js").ThemeModule;
   export default theme;
}

interface Window {
   __SUPADECK_READY__?: boolean;
}
