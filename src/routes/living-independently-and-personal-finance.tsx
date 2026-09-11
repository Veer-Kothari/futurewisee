import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/living-independently-and-personal-finance")({
  component: Layout,
});

function Layout() {
  return <Outlet />;
}
