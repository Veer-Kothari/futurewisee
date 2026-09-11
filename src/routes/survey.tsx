import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/pages/placeholder-page";

export const Route = createFileRoute("/survey")({
  head: () => ({
    meta: [
      { title: "Take the Survey | FutureWise" },
      { name: "description", content: "Share your perspective and help FutureWise create resources that work for students in Oman." },
      { property: "og:title", content: "Take the Survey | FutureWise" },
      { property: "og:description", content: "Share your perspective and help FutureWise create resources that work for students in Oman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PlaceholderPage
      eyebrow="Your Voice Matters"
      title="Take the Survey"
      description="Share your perspective and help FutureWise create resources that work for students in Oman."
    />
  );
}
