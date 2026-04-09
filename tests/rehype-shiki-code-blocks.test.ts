import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import remarkGfm from "remark-gfm";
import { rehypeShikiCodeBlocks } from "../src/content/rehype-shiki-code-blocks.js";
import { remarkUnwrapJsxParagraphs } from "../src/content/remark-unwrap-jsx-paragraphs.js";

describe("rehypeShikiCodeBlocks", () => {
   it("highlights fenced code blocks with a language", async () => {
      const result = await compile("```ts\nconst answer = 42;\n```", {
         jsx: true,
         remarkPlugins: [remarkGfm, remarkUnwrapJsxParagraphs],
         rehypePlugins: [rehypeShikiCodeBlocks],
      });

      const code = String(result);

      expect(code).toContain("deck-code-block");
      expect(code).toContain("deck-code-content");
      expect(code).toContain('data-language="ts"');
      expect(code).toContain("color:");
      expect(code).not.toContain('<_components.span className="line" />');
   });

   it("leaves unknown languages readable without highlighted markup", async () => {
      const result = await compile("```not-a-real-lang\nhello();\n```", {
         jsx: true,
         remarkPlugins: [remarkGfm, remarkUnwrapJsxParagraphs],
         rehypePlugins: [rehypeShikiCodeBlocks],
      });

      const code = String(result);

      expect(code).not.toContain("deck-code-block");
      expect(code).not.toContain("deck-code-content");
      expect(code).toContain('className="language-not-a-real-lang"');
      expect(code).toContain('{"hello();\\n"}');
   });

   it("leaves unlabeled fenced blocks unchanged", async () => {
      const result = await compile("```\nhello();\n```", {
         jsx: true,
         remarkPlugins: [remarkGfm, remarkUnwrapJsxParagraphs],
         rehypePlugins: [rehypeShikiCodeBlocks],
      });

      const code = String(result);

      expect(code).not.toContain("deck-code-block");
      expect(code).not.toContain("deck-code-content");
      expect(code).toContain('<_components.pre><_components.code>{"hello();\\n"}</_components.code></_components.pre>');
   });
});
