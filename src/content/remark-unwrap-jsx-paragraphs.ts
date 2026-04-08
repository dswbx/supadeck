const PARAGRAPHLESS_TAGS = new Set([
  'abbr',
  'b',
  'button',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'kbd',
  'label',
  'legend',
  'mark',
  'output',
  'p',
  'pre',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'time',
  'u',
  'var'
]);

interface MdxAstNode {
  type: string;
  name?: string | null;
  children?: MdxAstNode[];
}

function shouldUnwrapParagraphChildren(node: MdxAstNode): boolean {
  return (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    typeof node.name === 'string' &&
    PARAGRAPHLESS_TAGS.has(node.name.toLowerCase())
  );
}

function unwrapParagraphChildren(children: MdxAstNode[]): MdxAstNode[] {
  return children.flatMap((child) => (child.type === 'paragraph' ? child.children ?? [] : [child]));
}

function visit(node: MdxAstNode): void {
  const children = node.children;
  if (!children) {
    return;
  }

  if (shouldUnwrapParagraphChildren(node)) {
    node.children = unwrapParagraphChildren(children);
  }

  for (const child of node.children ?? []) {
    visit(child);
  }
}

export function remarkUnwrapJsxParagraphs() {
  return (tree: MdxAstNode) => {
    visit(tree);
  };
}
