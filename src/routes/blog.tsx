import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog | FutureWise" },
      { name: "description", content: "Student-focused insights, tips, and stories from FutureWise." },
      { property: "og:title", content: "Blog | FutureWise" },
      { property: "og:description", content: "Student-focused insights, tips, and stories from FutureWise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Latest"
      title="Blog"
      description="Student-focused insights, tips, and stories are coming soon."
    />
  );
}
