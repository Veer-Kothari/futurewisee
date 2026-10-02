import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/")({
  head: () => ({
    meta: [
      { title: "Industry Insights | FutureWise" },
      { name: "description", content: "Introductions to seven industries, their roles, and the routes students can take into them." },
      { property: "og:title", content: "Industry Insights | FutureWise" },
      { property: "og:description", content: "Introductions to seven industries, their roles, and the routes students can take into them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Industry Insights"
      title="Understand an industry before choosing a path"
      description="FutureWise is preparing introductions to seven industries, the work people do within them, and the routes students can take into each field."
    />
  );
}
