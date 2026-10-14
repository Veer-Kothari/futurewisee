// Contract stub (claudex-split): implemented in the Claude lane.
export const UTM_DEFAULTS = { source: "futurewise", medium: "referral", campaign: "resources" } as const;

export function withUtm(
  url: string,
  opts?: { source?: string; medium?: string; campaign?: string; content?: string },
): string {
  void opts;
  throw new Error(`contract stub: withUtm(${url})`);
}

export function resourceHref(resource: { id: string; url: string; affiliateUrl?: string | null }): string {
  throw new Error(`contract stub: resourceHref(${resource.id})`);
}
