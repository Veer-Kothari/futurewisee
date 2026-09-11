import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/about/oman-vision-2040")({
  head: () => ({
    meta: [
      { title: "Oman Vision 2040 | FutureWise" },
      { name: "description", content: "See how FutureWise supports capable, confident young people as part of Oman’s future." },
      { property: "og:title", content: "Oman Vision 2040 | FutureWise" },
      { property: "og:description", content: "See how FutureWise supports capable, confident young people as part of Oman’s future." },
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
      title="Oman Vision 2040"
      description="See how FutureWise supports capable, confident young people as part of Oman’s future."
    />
  );
}
