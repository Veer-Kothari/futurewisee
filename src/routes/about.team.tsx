import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/about/team")({
  head: () => ({
    meta: [
      { title: "Meet the FutureWise team | FutureWise" },
      { name: "description", content: "Meet the people creating practical guidance for high school students across Oman." },
      { property: "og:title", content: "Meet the FutureWise team | FutureWise" },
      { property: "og:description", content: "Meet the people creating practical guidance for high school students across Oman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="About Us"
      title="Meet the FutureWise team"
      description="Meet the people creating practical guidance for high school students across Oman."
    />
  );
}
