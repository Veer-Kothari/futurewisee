import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/other-finance")({
  head: () => ({
    meta: [
      { title: "Other Finance | FutureWise" },
      { name: "description", content: "Explore the many career paths available across the wider finance sector." },
      { property: "og:title", content: "Other Finance | FutureWise" },
      { property: "og:description", content: "Explore the many career paths available across the wider finance sector." },
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
      title="Other Finance"
      description="Explore the many career paths available across the wider finance sector."
    />
  );
}
