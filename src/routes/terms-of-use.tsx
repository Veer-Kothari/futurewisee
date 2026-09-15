import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/terms-of-use")({
  head: () => ({
    meta: [
      { title: "Terms of Use | FutureWise" },
      { name: "description", content: "FutureWise terms of use." },
      { property: "og:title", content: "Terms of Use | FutureWise" },
      { property: "og:description", content: "FutureWise terms of use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Terms of Use"
      description="Our terms of use will be published here soon."
    />
  );
}
