/**
 * UTM tags on outbound resource links, so the other site can see a visit came
 * from FutureWise (and a future referral programme can be matched to it).
 */
export const UTM_DEFAULTS = {
  source: "futurewise",
  medium: "referral",
  campaign: "resources",
} as const;

export function withUtm(
  url: string,
  opts?: { source?: string; medium?: string; campaign?: string; content?: string },
): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url;

  const tags: Array<[string, string | undefined]> = [
    ["utm_source", opts?.source ?? UTM_DEFAULTS.source],
    ["utm_medium", opts?.medium ?? UTM_DEFAULTS.medium],
    ["utm_campaign", opts?.campaign ?? UTM_DEFAULTS.campaign],
    ["utm_content", opts?.content],
  ];
  for (const [key, value] of tags) {
    if (value && !parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

/** An affiliate link is used exactly as given; everything else gets UTM tags. */
export function resourceHref(resource: {
  id: string;
  url: string;
  affiliateUrl?: string | null;
}): string {
  if (resource.affiliateUrl) return resource.affiliateUrl;
  return withUtm(resource.url, { content: resource.id });
}
