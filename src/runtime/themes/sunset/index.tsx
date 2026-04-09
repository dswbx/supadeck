import type { ThemeModule } from "../../theme-types.js";
import { createDefaultComponents } from "../../default-components.js";
import { DefaultDeck } from "../base/DefaultDeck.js";
import "./theme.css";

const sunsetTheme: ThemeModule = {
   Deck: DefaultDeck,
   components: createDefaultComponents(),
   setup({ config, rootElement, helpers }) {
      rootElement.style.setProperty(
         "--slide-aspect-ratio",
         helpers.parseAspectRatio(config.aspectRatio)
      );
      rootElement.dataset.transition = config.transition ?? "fade";
   },
};

export default sunsetTheme;
