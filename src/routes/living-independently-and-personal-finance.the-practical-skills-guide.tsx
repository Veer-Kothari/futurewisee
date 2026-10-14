import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old address from before the Blog section existed (kept so old links keep working). */
export const Route = createFileRoute(
  "/living-independently-and-personal-finance/the-practical-skills-guide",
)({
  beforeLoad: () => {
    throw redirect({ to: "/blog", search: { category: "practical-skills" }, statusCode: 301 });
  },
});
