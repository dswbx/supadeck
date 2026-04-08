import type { ThemeModule } from "../../theme-types.js";
import { createSupabaseComponents, Divider } from "./components.js";
import { SupabaseDeck } from "./SupabaseDeck.js";
import "./theme.css";

const supabaseTheme: ThemeModule = {
   Deck: SupabaseDeck,
   components: { ...createSupabaseComponents(), hr: () => <Divider /> },
   setup({ config, rootElement, helpers }) {
      rootElement.style.setProperty(
         "--slide-aspect-ratio",
         helpers.parseAspectRatio(config.aspectRatio)
      );
      rootElement.dataset.transition = config.transition ?? "fade";
      rootElement.dataset.theme = "supabase";

      return () => {
         delete rootElement.dataset.theme;
      };
   },
};

export default supabaseTheme;
