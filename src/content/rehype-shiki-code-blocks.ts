import { createHighlighter } from "shiki";

const SHIKI_THEME = "github-dark-default";

let highlighterPromise:
   | Promise<Awaited<ReturnType<typeof createHighlighter>>>
   | undefined;

interface HastNode {
   type?: string;
   tagName?: string;
   value?: string;
   properties?: Record<string, unknown>;
   children?: HastNode[];
}

function getHighlighter() {
   if (!highlighterPromise) {
      highlighterPromise = createHighlighter({
         themes: [SHIKI_THEME],
         langs: [],
      });
   }

   return highlighterPromise;
}

function isElement(node: HastNode | null | undefined, tagName: string): boolean {
   return node?.type === "element" && node.tagName === tagName;
}

function toClassNames(value: unknown): string[] {
   if (typeof value === "string") {
      return value.split(/\s+/).filter(Boolean);
   }

   if (Array.isArray(value)) {
      return value.flatMap((entry) => toClassNames(entry));
   }

   return [];
}

function findLanguage(className: unknown): string | null {
   const languageClass = toClassNames(className).find((entry) =>
      entry.startsWith("language-")
   );

   return languageClass ? languageClass.slice("language-".length) : null;
}

function getTextContent(node: HastNode | undefined): string {
   if (!node) {
      return "";
   }

   if (node.type === "text") {
      return typeof node.value === "string" ? node.value : "";
   }

   return (node.children ?? []).map((child) => getTextContent(child)).join("");
}

function stripBackgroundStyles(style: unknown): unknown {
   if (typeof style !== "string") {
      return style;
   }

   const filtered = style
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry) => {
         const property = entry.split(":", 1)[0]?.trim().toLowerCase();
         return property !== "background" && property !== "background-color";
      });

   return filtered.length > 0 ? `${filtered.join("; ")};` : undefined;
}

function getCodeChild(node: HastNode): HastNode | null {
   const children = node.children ?? [];
   return children.length === 1 && isElement(children[0], "code")
      ? children[0]
      : null;
}

function getPreNode(node: HastNode | null | undefined): HastNode | null {
   if (node && node.type === "element" && node.tagName === "pre") {
      return node;
   }

   const children = node?.children ?? [];
   return children.find((child: HastNode) => isElement(child, "pre")) ?? null;
}

async function highlightCode(code: string, language: string): Promise<HastNode | null> {
   const highlighter = await getHighlighter();

   try {
      await highlighter.loadLanguage(language as Parameters<
         typeof highlighter.loadLanguage
      >[0]);
   } catch {
      return null;
   }

   return highlighter.codeToHast(code, {
      lang: language,
      theme: SHIKI_THEME,
   }) as HastNode;
}

function addClassName(
   properties: Record<string, unknown> | undefined,
   ...classNames: string[]
): Record<string, unknown> {
   const merged = new Set([
      ...toClassNames(properties?.class),
      ...toClassNames(properties?.className),
      ...classNames.filter(Boolean),
   ]);

   return {
      ...properties,
      class: undefined,
      className: Array.from(merged),
   };
}

async function transformCodeBlock(node: HastNode): Promise<HastNode | null> {
   if (!isElement(node, "pre")) {
      return null;
   }

   const codeChild = getCodeChild(node);
   const language = findLanguage(codeChild?.properties?.className);

   if (!codeChild || !language) {
      return null;
   }

   const source = getTextContent(codeChild).replace(/\r?\n$/, "");
   const highlightedTree = await highlightCode(source, language);
   const highlightedPre = getPreNode(highlightedTree);

   if (!highlightedPre) {
      return null;
   }

   const highlightedCode = getCodeChild(highlightedPre);

   if (!highlightedCode) {
      return null;
   }

   highlightedPre.properties = {
      ...addClassName(
         highlightedPre.properties,
         "deck-code-block",
         "deck-code-block--highlighted"
      ),
      style: stripBackgroundStyles(highlightedPre.properties?.style),
      "data-language": language,
      "data-code-block": "",
   };

   highlightedCode.properties = {
      ...addClassName(highlightedCode.properties, "deck-code-content"),
      style: stripBackgroundStyles(highlightedCode.properties?.style),
      "data-language": language,
      "data-code-block": "",
   };

   return highlightedPre;
}

async function visitChildren(node: HastNode): Promise<void> {
   const children = node.children ?? [];

   for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      const replacement = await transformCodeBlock(child);

      if (replacement) {
         children[index] = replacement;
         continue;
      }

      await visitChildren(child);
   }
}

export function rehypeShikiCodeBlocks() {
   return async function transformer(tree: HastNode): Promise<void> {
      await visitChildren(tree);
   };
}
