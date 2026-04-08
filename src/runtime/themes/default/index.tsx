import { createDefaultComponents } from '../../default-components.js';
import type { ThemeModule } from '../../theme-types.js';
import { DefaultDeck } from './DefaultDeck.js';
import './theme.css';

const defaultTheme: ThemeModule = {
  Deck: DefaultDeck,
  components: createDefaultComponents(),
  setup({ config, rootElement, helpers }) {
    rootElement.style.setProperty(
      '--slide-aspect-ratio',
      helpers.parseAspectRatio(config.aspectRatio)
    );
    rootElement.dataset.transition = config.transition ?? 'fade';
  }
};

export default defaultTheme;
