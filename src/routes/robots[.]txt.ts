import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/data/site";

/** Everyone may crawl the public pages, including AI search and answer bots; private pages are excluded. */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const bots = [
          "OAI-SearchBot",
          "GPTBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "ClaudeBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Meta-ExternalAgent",
        ];
        const rules = [
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /account",
          "Disallow: /login",
          "Disallow: /signup",
          "Disallow: /forgot-password",
          "Disallow: /reset-password",
        ];
        const body = [
          "User-agent: *",
          ...rules,
          "",
          ...bots.flatMap((bot) => [`User-agent: ${bot}`, ...rules, ""]),
          `Sitemap: ${site.siteUrl}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
