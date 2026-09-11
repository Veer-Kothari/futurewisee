import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/about/")({
  head: () => ({
    meta: [
      { title: "About FutureWise | FutureWise" },
      { name: "description", content: "Learn how FutureWise helps high school students in Oman prepare for careers, money, and independent life." },
      { property: "og:title", content: "About FutureWise | FutureWise" },
      { property: "og:description", content: "Learn how FutureWise helps high school students in Oman prepare for careers, money, and independent life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div id="vision-2040">
      <PlaceholderPage
        eyebrow="About Us"
        title="About FutureWise"
        description="Learn how FutureWise helps high school students in Oman prepare for careers, money, and independent life."
      />
    </div>
  );
}
