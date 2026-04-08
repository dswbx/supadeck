import { SlideFrame } from './SlideFrame.js';
import type { DeckSlideRenderProps } from '../theme-types.js';

export function DeckSlide({
   slide,
   config,
   total,
   index,
   printMode,
   components,
}: DeckSlideRenderProps) {
   const Slide = slide.Component;
   return (
      <SlideFrame
         config={config}
         index={index}
         total={total}
         printMode={printMode}
      >
         <Slide components={components} />
      </SlideFrame>
   );
}
