import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industry-resources/entrepreneurship")({
  head: () => ({
    meta: [
      { title: "Entrepreneurship | FutureWise" },
      { name: "description", content: "Explore the ideas, skills, and decisions behind building a business." },
      { property: "og:title", content: "Entrepreneurship | FutureWise" },
      { property: "og:description", content: "Explore the ideas, skills, and decisions behind building a business." },
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
      title="Entrepreneurship"
      description="Explore the ideas, skills, and decisions behind building a business."
    />
  );
}
