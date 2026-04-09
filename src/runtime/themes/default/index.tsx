import type { ThemeModule } from '../../theme-types.js';
import { createSupabaseComponents, Divider } from './components.js';
import { DefaultThemeDeck } from './DefaultThemeDeck.js';
import './theme.css';

const defaultTheme: ThemeModule = {
  Deck: DefaultThemeDeck,
  components: { ...createSupabaseComponents(), hr: () => <Divider /> },
  setup({ config, rootElement, helpers }) {
    rootElement.style.setProperty(
      '--slide-aspect-ratio',
      helpers.parseAspectRatio(config.aspectRatio)
    );
    rootElement.dataset.transition = config.transition ?? 'fade';

    rootElement.dataset.theme = 'default';

    return () => {
      delete rootElement.dataset.theme;
    };
  }
};

export default defaultTheme;
