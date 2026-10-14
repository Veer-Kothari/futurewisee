// Contract stub (claudex-split): implemented in the Claude lane.
export type MdInline =
  | { type: "text"; text: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "em"; children: MdInline[] }
  | { type: "link"; href: string; children: MdInline[] };

export type MdBlock =
  | { type: "heading"; level: 2 | 3; children: MdInline[] }
  | { type: "paragraph"; children: MdInline[] }
  | { type: "list"; ordered: boolean; items: MdInline[][] }
  | { type: "quote"; children: MdInline[] };

export function parseMarkdownLite(source: string): MdBlock[] {
  throw new Error(`contract stub: parseMarkdownLite(${source.length} chars)`);
}
