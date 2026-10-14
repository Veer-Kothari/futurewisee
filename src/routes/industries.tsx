import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old "Explore Industries" address → Industry Insights. */
export const Route = createFileRoute("/industries")({
  beforeLoad: () => {
    throw redirect({ to: "/industry-resources", statusCode: 301 });
  },
});
