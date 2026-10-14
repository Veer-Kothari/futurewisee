import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/pages/legal-page";
import { privacyPolicy } from "@/content/legal";
import { pageTitle, seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    seo(
      "/privacy-policy",
      pageTitle("Privacy Policy"),
      "What FutureWise collects (accounts, survey answers, resource clicks, optional emails and analytics), why, and how to download or delete your data.",
    ),
  component: () => <LegalPage doc={privacyPolicy} />,
});
