import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/pages/legal-page";
import { termsOfUse } from "@/content/legal";
import { pageTitle, seo } from "@/lib/seo";

export const Route = createFileRoute("/terms-of-use")({
  head: () =>
    seo(
      "/terms-of-use",
      pageTitle("Terms of Use"),
      "The terms for using FutureWise, a student-led educational project for high school students in Oman: accounts, acceptable use and external links.",
    ),
  component: () => <LegalPage doc={termsOfUse} />,
});
