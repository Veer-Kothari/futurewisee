/**
 * JSON for a <script type="application/ld+json"> block. Titles and summaries
 * come from /admin, so "<", ">" and "&" are escaped: text like
 * "</script><script>..." can never close the block and run in a visitor's page.
 * (U+2028/U+2029 are escaped too, for older parsers.) The JSON stays valid.
 */
export function jsonLdText(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
