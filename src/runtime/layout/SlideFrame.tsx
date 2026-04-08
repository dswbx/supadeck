import React from "react";
import { SlideFrameProps, parseAspectRatio } from "../App.js";

export function SlideFrame({
   children,
   config,
   index,
   total,
   printMode,
}: SlideFrameProps) {
   const ratio = parseAspectRatio(config.aspectRatio);
   return (
      <section
         className={`slide-frame ${printMode ? "slide-frame-print" : ""}`}
         style={{ "--slide-aspect-ratio": ratio } as React.CSSProperties}
         data-transition={config.transition}
      >
         <div className="slide-surface">
            <div className="slide-content">{children}</div>
            {config.showSlideNumbers ? (
               <div className="slide-footer">
                  <span>
                     {index + 1} / {total}
                  </span>
               </div>
            ) : null}
         </div>
      </section>
   );
}
