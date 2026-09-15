import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | FutureWise" },
      { name: "description", content: "FutureWise privacy policy." },
      { property: "og:title", content: "Privacy Policy | FutureWise" },
      { property: "og:description", content: "FutureWise privacy policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="Our privacy policy will be published here soon."
    />
  );
}
