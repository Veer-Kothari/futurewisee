import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/economics")({
  head: () => ({
    meta: [
      { title: "Economics | FutureWise" },
      { name: "description", content: "Explore how economists understand choices, markets, and public policy." },
      { property: "og:title", content: "Economics | FutureWise" },
      { property: "og:description", content: "Explore how economists understand choices, markets, and public policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Industry Resources"
      title="Economics"
      description="Explore how economists understand choices, markets, and public policy."
    />
  );
}
