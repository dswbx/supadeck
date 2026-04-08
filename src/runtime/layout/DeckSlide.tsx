import type { DeckSlideProps } from "../App.js";
import mdxComponents from "../mdx-components.js";
import { SlideFrame } from "./SlideFrame.js";

export function DeckSlide({
   slide,
   config,
   total,
   index,
   printMode,
}: DeckSlideProps) {
   const Slide = slide.Component;
   return (
      <SlideFrame
         config={config}
         index={index}
         total={total}
         printMode={printMode}
      >
         <Slide components={mdxComponents()} />
      </SlideFrame>
   );
}
