/**
 * Outside web addresses that stopped working (bug hunt, 16 Nov 2026): the
 * domain doesn't exist, or browsers show a certificate warning. Links to them
 * show as plain text (the organisation's name stays, without the link) on the
 * Resources page, in the Useful Links panels and in Industry Insights
 * articles. When Veer supplies an organisation's current address, put it where
 * the link is (src/data/resources.ts or src/content/industries/<industry>.md)
 * and remove the old host from this list.
 */
const BROKEN_HOSTS = new Set([
  "www.nlg.om", // National Life & General Insurance (Resources): no such domain
  "www.almadinainsurance.com", // Al Madina Insurance (Resources): no such domain
  "www.arabiafalcon.com", // Arabia Falcon Insurance (Resources): no such domain
  "www.muscatinsurance.com", // Muscat Insurance (Resources): certificate expired
  "www.tax.gov.om", // Oman Tax Authority (Tax article, twice): no such domain
  "www.riyada.gov.om", // Riyada (Entrepreneurship article): no such domain
  "www.cma.gov.om", // Capital Market Authority (Investment Banking & Trading and Finance articles): certificate warning
  "www.chamberoman.om", // Oman Chamber of Commerce and Industry (Law article): certificate warning
]);

/** True when the link points at one of the addresses above. */
export function isBrokenLink(href: string): boolean {
  try {
    return BROKEN_HOSTS.has(new URL(href).hostname.toLowerCase());
  } catch {
    return false;
  }
}
