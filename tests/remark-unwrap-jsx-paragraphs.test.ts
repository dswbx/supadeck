import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { remarkUnwrapJsxParagraphs } from "../src/content/remark-unwrap-jsx-paragraphs.js";

interface MdxAstNode {
   type: string;
   name?: string | null;
   value?: string;
   children?: MdxAstNode[];
}

async function transform(source: string): Promise<MdxAstNode> {
   const processor = unified()
      .use(remarkParse as never)
      .use(remarkMdx as never)
      .use(remarkUnwrapJsxParagraphs as never);
   const tree = processor.parse(source);
   return (await processor.run(tree)) as MdxAstNode;
}

describe("remarkUnwrapJsxParagraphs", () => {
   it("unwraps paragraph children inside JSX headings", async () => {
      const tree = await transform(`<h1>
  supa<span className="green">lite</span>
</h1>`);

      const heading = tree.children?.[0];
      expect(heading?.type).toBe("mdxJsxFlowElement");
      expect(heading?.name).toBe("h1");
      expect(heading?.children?.map((child) => child.type)).toEqual([
         "text",
         "mdxJsxTextElement",
      ]);
   });

   it("unwraps paragraph children inside JSX code tags", async () => {
      const tree = await transform(`<code>
  npx supadeck dev
</code>`);

      const code = tree.children?.[0];
      expect(code?.type).toBe("mdxJsxFlowElement");
      expect(code?.name).toBe("code");
      expect(code?.children?.map((child) => child.type)).toEqual(["text"]);
   });

   it("unwraps paragraph children inside phrasing-only JSX tags", async () => {
      const tree = await transform(`<summary>
  Read more
</summary>`);

      const summary = tree.children?.[0];
      expect(summary?.type).toBe("mdxJsxFlowElement");
      expect(summary?.name).toBe("summary");
      expect(summary?.children?.map((child) => child.type)).toEqual(["text"]);
   });

   it("keeps paragraph wrappers for block JSX elements", async () => {
      const tree = await transform(`<div>
  plain text
</div>`);

      const div = tree.children?.[0];
      expect(div?.type).toBe("mdxJsxFlowElement");
      expect(div?.name).toBe("div");
      expect(div?.children?.map((child) => child.type)).toEqual(["paragraph"]);
   });

   it("keeps paragraph wrappers for block elements that accept flow content", async () => {
      const tree = await transform(`<blockquote>
  plain text
</blockquote>`);

      const blockquote = tree.children?.[0];
      expect(blockquote?.type).toBe("mdxJsxFlowElement");
      expect(blockquote?.name).toBe("blockquote");
      expect(blockquote?.children?.map((child) => child.type)).toEqual([
         "paragraph",
      ]);
   });
});
