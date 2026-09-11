import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/living-independently-and-personal-finance/my-journey-blog")({
  head: () => ({
    meta: [
      { title: "My Journey Blog | FutureWise" },
      { name: "description", content: "Real reflections on learning, growth, and preparing for the next chapter." },
      { property: "og:title", content: "My Journey Blog | FutureWise" },
      { property: "og:description", content: "Real reflections on learning, growth, and preparing for the next chapter." },
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
      title="My Journey Blog"
      description="Real reflections on learning, growth, and preparing for the next chapter."
    />
  );
}
