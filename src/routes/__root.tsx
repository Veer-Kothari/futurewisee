import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { NotFoundState } from "@/components/layout/route-states";
import { site } from "@/data/site";
import { AuthProvider } from "@/lib/auth";
import { jsonLdText } from "@/lib/json-ld";
import { rootGraph } from "@/lib/seo";
import { getIntegrationStatus, type IntegrationStatus } from "@/lib/status.functions";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

/** Errors in the root itself (rare): a branded page without the shell, which needs the root's providers. */
function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md">
        <p className="wordmark text-2xl font-bold">FutureWise</p>
        <h1 className="mt-6 text-xl font-semibold text-navy">This page didn't load</h1>
        <p className="mt-2 text-sm text-charcoal/75">
          Something went wrong on our side. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center bg-navy px-5 text-sm font-semibold text-primary-foreground hover:bg-navy/90"
          >
            Try again
          </button>
          <a
            href="/industry-resources"
            className="inline-flex min-h-11 items-center justify-center border border-navy px-5 text-sm font-semibold text-navy hover:bg-light-blue"
          >
            Industry Insights
          </a>
        </div>
      </div>
    </div>
  );
}

const noIntegrations: IntegrationStatus = { accounts: false, newsletter: false };

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      return { integrations: await getIntegrationStatus() };
    } catch {
      return { integrations: noIntegrations };
    }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} — Practical knowledge for students in Oman` },
      { name: "description", content: site.description },
      { property: "og:site_name", content: site.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b3b6e" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [{ type: "application/ld+json", children: jsonLdText(rootGraph()) }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundState,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { integrations } = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteShell newsletter={integrations.newsletter}>
          <Outlet />
        </SiteShell>
      </AuthProvider>
    </QueryClientProvider>
  );
}
