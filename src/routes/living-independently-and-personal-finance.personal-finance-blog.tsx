import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/living-independently-and-personal-finance/personal-finance-blog")({
  head: () => ({
    meta: [
      { title: "Personal Finance Blog | FutureWise" },
      { name: "description", content: "Practical perspectives to help students understand, manage, and plan their money." },
      { property: "og:title", content: "Personal Finance Blog | FutureWise" },
      { property: "og:description", content: "Practical perspectives to help students understand, manage, and plan their money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Living Independently"
      title="Personal Finance Blog"
      description="Practical perspectives to help students understand, manage, and plan their money."
    />
  );
}
