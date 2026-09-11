import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources")({
  head: () => ({
    meta: [
      { title: "Industry resources | FutureWise" },
      { name: "description", content: "Explore clear introductions to industries, roles, and career paths." },
      { property: "og:title", content: "Industry resources | FutureWise" },
      { property: "og:description", content: "Explore clear introductions to industries, roles, and career paths." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Explore Careers"
      title="Industry resources"
      description="Explore clear introductions to industries, roles, and career paths."
    />
  );
}
