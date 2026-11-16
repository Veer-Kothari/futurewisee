/**
 * Every value that changes per deployment lives here.
 *
 * siteUrl must equal the address the site is actually published at (no
 * trailing slash): canonicals, the sitemap, robots.txt, llms.txt, share
 * previews and structured data use it. It is the custom domain's primary
 * address: www.futurewiseapp.org is primary on Vercel and the bare domain
 * redirects to it (checked 16 Nov 2026). If the bare domain is made primary
 * again, change this back to https://futurewiseapp.org.
 */
export const site = {
  name: "FutureWise",
  siteUrl: "https://www.futurewiseapp.org",
  tagline: "Practical knowledge for life beyond school.",
  description:
    "FutureWise helps high school students in Oman aged 15-19 explore careers, industries, money, and independent adulthood.",
  email: "partners@futurewiseapp.org",
  linkedinUrl: "https://www.linkedin.com/company/futurewiseapp/",
  // The LinkedIn Community button and footer link go to the group, not the
  // company page (Veer, 6 Nov 2026).
  linkedinCommunityUrl: "https://www.linkedin.com/groups/40607414/",
  /**
   * Google Analytics 4 measurement ID ("G-XXXXXXXXXX") from Veer's GA4
   * property. Empty = Google Analytics and the cookie banner stay off.
   */
  googleAnalyticsId: "",
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "FutureWise — practical knowledge for life beyond school, for high school students in Oman",
  },
} as const;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
