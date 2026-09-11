import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/living-independently-and-personal-finance/")({
  head: () => ({
    meta: [
      { title: "Living Independently & Personal Finance | FutureWise" },
      { name: "description", content: "Build confidence with money, everyday decisions, and life beyond school." },
      { property: "og:title", content: "Living Independently & Personal Finance | FutureWise" },
      { property: "og:description", content: "Build confidence with money, everyday decisions, and life beyond school." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Life Beyond School"
      title="Living Independently & Personal Finance"
      description="Build confidence with money, everyday decisions, and life beyond school."
    />
  );
}
