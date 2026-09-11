import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/operations")({
  head: () => ({
    meta: [
      { title: "Operations | FutureWise" },
      { name: "description", content: "Explore the people and systems that keep organisations working effectively." },
      { property: "og:title", content: "Operations | FutureWise" },
      { property: "og:description", content: "Explore the people and systems that keep organisations working effectively." },
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
      title="Operations"
      description="Explore the people and systems that keep organisations working effectively."
    />
  );
}
