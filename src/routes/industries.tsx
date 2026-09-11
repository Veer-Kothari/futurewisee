import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Explore Industries | FutureWise" },
      { name: "description", content: "Discover industries and career paths for high school students in Oman." },
      { property: "og:title", content: "Explore Industries | FutureWise" },
      { property: "og:description", content: "Discover industries and career paths for high school students in Oman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Explore"
      title="Explore Industries"
      description="Discover industries and career paths designed for high school students in Oman."
    />
  );
}
