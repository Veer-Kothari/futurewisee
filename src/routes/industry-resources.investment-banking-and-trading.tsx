import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/investment-banking-and-trading")({
  head: () => ({
    meta: [
      { title: "Investment Banking & Trading | FutureWise" },
      { name: "description", content: "Explore the work, skills, and pathways across investment banking and trading." },
      { property: "og:title", content: "Investment Banking & Trading | FutureWise" },
      { property: "og:description", content: "Explore the work, skills, and pathways across investment banking and trading." },
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
      title="Investment Banking & Trading"
      description="Explore the work, skills, and pathways across investment banking and trading."
    />
  );
}
