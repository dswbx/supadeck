import { useEffect, useState } from "react";
import { clamp, getHashIndex } from "../utils/use-current-slide.js";

export function useCurrentSlide(
   total: number
): readonly [number, React.Dispatch<React.SetStateAction<number>>] {
   const [index, setIndex] = useState(() => getHashIndex(total));

   useEffect(() => {
      const onHashChange = () => setIndex(getHashIndex(total));
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
   }, [total]);

   useEffect(() => {
      const nextHash = `#${index + 1}`;
      if (window.location.hash !== nextHash) {
         history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}${nextHash}`
         );
      }
   }, [index]);

   useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
         if (event.metaKey || event.ctrlKey || event.altKey) {
            return;
         }

         if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
            event.preventDefault();
            setIndex((current) => clamp(current + 1, 0, total - 1));
         }

         if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
            event.preventDefault();
            setIndex((current) => clamp(current - 1, 0, total - 1));
         }

         if (event.key === "Home") {
            event.preventDefault();
            setIndex(0);
         }

         if (event.key === "End") {
            event.preventDefault();
            setIndex(total - 1);
         }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
   }, [total]);

   useEffect(() => {
      setIndex((current) => clamp(current, 0, Math.max(total - 1, 0)));
   }, [total]);

   return [index, setIndex];
}
