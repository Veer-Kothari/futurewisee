/**
 * Every value that changes per deployment lives here.
 *
 * siteUrl must equal the address the site is actually published at (no
 * trailing slash): canonicals, the sitemap, robots.txt, llms.txt, share
 * previews and structured data use it. It is the custom domain (Herdy, 23 Oct
 * 2026): connect futurewiseapp.org in Lovable with the bare domain as primary
 * (www redirects to it) before publishing this. If www is made primary instead,
 * change this to https://www.futurewiseapp.org, or the two redirect in a loop.
 */
export const site = {
  name: "FutureWise",
  siteUrl: "https://futurewiseapp.org",
  tagline: "Practical knowledge for life beyond school.",
  description:
    "FutureWise helps high school students in Oman aged 15-19 explore careers, industries, money, and independent adulthood.",
  email: "partners@futurewiseapp.org",
  linkedinUrl: "https://www.linkedin.com/company/futurewiseapp/",
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
