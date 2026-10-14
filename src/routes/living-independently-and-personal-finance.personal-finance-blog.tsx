import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old address from before the Blog section existed (kept so old links keep working). */
export const Route = createFileRoute(
  "/living-independently-and-personal-finance/personal-finance-blog",
)({
  beforeLoad: () => {
    throw redirect({ to: "/blog", search: { category: "personal-finance" }, statusCode: 301 });
  },
});
