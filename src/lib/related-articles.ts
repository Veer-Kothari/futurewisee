/**
 * Veer's finance posts end with a line such as
 * "Related FutureWise articles: How Banks Work in Oman; Loans 101; Budgeting 101."
 * That text lives in the database, so this links it when the post is shown:
 * each name that matches a published post (its full title, or the part before
 * the colon, with "&" read as "and") becomes a link to that post. A name with
 * no published post yet (for example "Loans 101") stays plain text, and links
 * itself once a post with that title is published. The stored text isn't changed.
 */
// No "@/" imports: the plain-Node unit tests load this file directly.
export type ArticleRef = { slug: string; title: string };

const RELATED_LINE = /^((?:\*\*|__)?Related FutureWise articles?:(?:\*\*|__)?\s*)(.+)$/i;

/** Lower case, "&" as "and", apostrophes and other punctuation dropped. */
function titleKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function linkRelatedArticles(
  body: string,
  posts: ArticleRef[],
  currentSlug?: string,
): string {
  const slugByTitle = new Map<string, string>();
  for (const post of posts) {
    if (post.slug === currentSlug) continue;
    for (const key of [titleKey(post.title), titleKey(post.title.split(":")[0] ?? "")]) {
      if (key && !slugByTitle.has(key)) slugByTitle.set(key, post.slug);
    }
  }
  if (slugByTitle.size === 0) return body;

  return body
    .split("\n")
    .map((line) => {
      const match = line.match(RELATED_LINE);
      if (!match) return line;
      const [, label = "", list = ""] = match;
      const items = list.split(";").map((item) => {
        // Keep spaces and the closing full stop outside the link.
        const [, lead = "", name = "", trail = ""] = item.match(/^(\s*)(.*?)([.\s]*)$/) ?? [];
        const slug = /[[\]()]/.test(name) ? undefined : slugByTitle.get(titleKey(name));
        return slug ? `${lead}[${name}](/blog/${slug})${trail}` : item;
      });
      return `${label}${items.join(";")}`;
    })
    .join("\n");
}
