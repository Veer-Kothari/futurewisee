const MAX_SLUG = 100;

/** "Budgeting & Saving: Week 1!" → "budgeting-and-saving-week-1". "" when nothing usable remains. */
export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length <= MAX_SLUG) return base;

  const cut = base.slice(0, MAX_SLUG);
  const lastDash = cut.lastIndexOf("-");
  const trimmed = lastDash > 0 ? cut.slice(0, lastDash) : cut;
  return trimmed.replace(/-+$/g, "");
}
