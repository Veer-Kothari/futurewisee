import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The old five-question survey (replaced by the Get Involved sign-up, tutor,
 * 29 Oct 2026). Kept so old links and shares keep working; answers already
 * saved stay in /admin → Survey responses and on each account page.
 */
export const Route = createFileRoute("/survey")({
  beforeLoad: () => {
    throw redirect({ to: "/get-involved", statusCode: 301 });
  },
});
