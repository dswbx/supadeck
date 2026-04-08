export function parseAspectRatio(input: string | undefined): string {
   const value = String(input ?? "16:9");
   const parts = value.split(":").map((part) => Number(part.trim()));
   if (
      parts.length !== 2 ||
      parts.some((part) => !Number.isFinite(part) || part <= 0)
   ) {
      return "16 / 9";
   }
   return `${parts[0]} / ${parts[1]}`;
}

export function clamp(value: number, min: number, max: number): number {
   return Math.min(max, Math.max(min, value));
}

export function getHashIndex(total: number): number {
   const raw = Number(window.location.hash.replace("#", ""));
   if (!Number.isFinite(raw) || raw < 1) {
      return 0;
   }
   return clamp(raw - 1, 0, Math.max(total - 1, 0));
}
