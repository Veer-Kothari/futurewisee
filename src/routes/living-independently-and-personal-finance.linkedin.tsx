import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/living-independently-and-personal-finance/linkedin")({
  head: () => ({
    meta: [
      { title: "Follow Us on LinkedIn | FutureWise" },
      { name: "description", content: "Follow FutureWise for new perspectives, resources, and project updates." },
      { property: "og:title", content: "Follow Us on LinkedIn | FutureWise" },
      { property: "og:description", content: "Follow FutureWise for new perspectives, resources, and project updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Stay Connected"
      title="Follow Us on LinkedIn"
      description="Follow FutureWise for new perspectives, resources, and project updates."
    />
  );
}
