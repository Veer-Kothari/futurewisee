import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { NotFoundState, RouteErrorState } from "@/components/layout/route-states";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Start loading a page's code and data when a link is hovered or touched,
    // and keep what was preloaded for 30 s so the click itself uses it.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    // Errors and 404s in any page render inside the site layout.
    defaultErrorComponent: RouteErrorState,
    defaultNotFoundComponent: NotFoundState,
  });

  return router;
};
