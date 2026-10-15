/**
 * Every row of a query, 1,000 at a time (the API's page size). The query must
 * have a stable order. Throws if any page fails, so callers never mistake a
 * partial result for a complete one.
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999);
    if (error) throw new Error("load failed");
    const chunk = (data as T[] | null) ?? [];
    rows.push(...chunk);
    if (chunk.length < 1000) return rows;
  }
}
