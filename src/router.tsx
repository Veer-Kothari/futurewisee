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
    defaultPreloadStaleTime: 0,
    // Errors and 404s in any page render inside the site layout.
    defaultErrorComponent: RouteErrorState,
    defaultNotFoundComponent: NotFoundState,
  });

  return router;
};
