import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/tools-and-resources")({
  head: () => ({
    meta: [
      { title: "Tools and Resources | FutureWise" },
      { name: "description", content: "Explore practical tools that turn knowledge into confident next steps." },
      { property: "og:title", content: "Tools and Resources | FutureWise" },
      { property: "og:description", content: "Explore practical tools that turn knowledge into confident next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Get Prepared"
      title="Tools and Resources"
      description="Explore practical tools that turn knowledge into confident next steps."
    />
  );
}
