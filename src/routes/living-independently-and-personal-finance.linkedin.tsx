import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old address from before the Blog section existed (kept so old links keep working). */
export const Route = createFileRoute("/living-independently-and-personal-finance/linkedin")({
  beforeLoad: () => {
    throw redirect({ to: "/blog", statusCode: 301 });
  },
});
