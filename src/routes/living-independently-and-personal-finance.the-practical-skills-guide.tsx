import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/living-independently-and-personal-finance/the-practical-skills-guide")({
  head: () => ({
    meta: [
      { title: "The Practical Skills Guide | FutureWise" },
      { name: "description", content: "Hands-on guidance for everyday skills that help students live more independently." },
      { property: "og:title", content: "The Practical Skills Guide | FutureWise" },
      { property: "og:description", content: "Hands-on guidance for everyday skills that help students live more independently." },
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
      title="The Practical Skills Guide"
      description="Hands-on guidance for everyday skills that help students live more independently."
    />
  );
}
