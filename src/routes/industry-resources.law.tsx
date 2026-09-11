import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/law")({
  head: () => ({
    meta: [
      { title: "Law | FutureWise" },
      { name: "description", content: "Explore pathways, roles, and practical insights for a future in law." },
      { property: "og:title", content: "Law | FutureWise" },
      { property: "og:description", content: "Explore pathways, roles, and practical insights for a future in law." },
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
      title="Law"
      description="Explore pathways, roles, and practical insights for a future in law."
    />
  );
}
