import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/industry-resources")({
  component: Layout,
});

function Layout() {
  return <Outlet />;
}
