import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/tax")({
  head: () => ({
    meta: [
      { title: "Tax | FutureWise" },
      { name: "description", content: "Explore how tax professionals support people, businesses, and economies." },
      { property: "og:title", content: "Tax | FutureWise" },
      { property: "og:description", content: "Explore how tax professionals support people, businesses, and economies." },
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
      title="Tax"
      description="Explore how tax professionals support people, businesses, and economies."
    />
  );
}
