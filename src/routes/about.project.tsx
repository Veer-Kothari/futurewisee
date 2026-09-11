import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/about/project")({
  head: () => ({
    meta: [
      { title: "The FutureWise project | FutureWise" },
      { name: "description", content: "Learn about the purpose and direction of FutureWise for students in Oman." },
      { property: "og:title", content: "The FutureWise project | FutureWise" },
      { property: "og:description", content: "Learn about the purpose and direction of FutureWise for students in Oman." },
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
      title="The FutureWise project"
      description="Learn about the purpose and direction of FutureWise for students in Oman."
    />
  );
}
