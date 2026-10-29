import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ClicksPanel } from "@/components/admin/clicks-panel";
import { InsightsPanel } from "@/components/admin/insights-panel";
import { PostsPanel } from "@/components/admin/posts-panel";
import { ResponsesPanel } from "@/components/admin/responses-panel";
import { SignupsPanel } from "@/components/admin/signups-panel";
import { useAuth } from "@/lib/auth";
import { privateHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Veer's editor. Only accounts with the admin role (public.user_roles, granted
 * by SQL) get past the check here — and the database enforces the same rule
 * on every read and write, so this page alone protects nothing.
 */
export const Route = createFileRoute("/admin")({
  head: () => privateHead("Editor"),
  component: AdminPage,
});

const tabs = [
  { id: "posts", label: "Blog posts" },
  { id: "insights", label: "Industry Insights" },
  { id: "signups", label: "Sign-ups" },
  { id: "responses", label: "Survey responses" },
  { id: "clicks", label: "Resource clicks" },
] as const;
type TabId = (typeof tabs)[number]["id"];

function AdminPage() {
  const auth = useAuth();
  const [tab, setTab] = useState<TabId>("posts");

  if (auth.status === "loading") {
    return (
      <div className="site-container py-24">
        <h1 className="text-3xl font-bold text-navy">Editor</h1>
        <p role="status" className="mt-4 text-charcoal/75">
          Checking your access…
        </p>
      </div>
    );
  }
  if (auth.status !== "signed-in") {
    return (
      <section className="site-container max-w-2xl py-24">
        <h1 className="text-3xl font-bold text-navy">Editor</h1>
        <p className="mt-4 text-charcoal/80">Log in with an editor account to continue.</p>
        <Link to="/login" search={{ redirect: "/admin" }} className="text-link mt-6">
          Log in
        </Link>
      </section>
    );
  }
  if (!auth.isAdmin) {
    return (
      <section className="site-container max-w-2xl py-24">
        <h1 className="text-3xl font-bold text-navy">Editor</h1>
        <p className="mt-4 text-charcoal/80">This page is only for FutureWise editors.</p>
        <Link to="/account" className="text-link mt-6">
          Go to your account
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-12">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">Editor</h1>
          <p className="mt-3 max-w-2xl text-charcoal/75">
            Publish blog posts and Industry Insights, and see survey answers and resource clicks.
            Changes show on the site as soon as you save a published item.
          </p>
          <div role="tablist" aria-label="Editor sections" className="mt-8 flex flex-wrap gap-2">
            {tabs.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`tab-${entry.id}`}
                aria-selected={tab === entry.id}
                aria-controls={`panel-${entry.id}`}
                onClick={() => setTab(entry.id)}
                className={cn(
                  "min-h-11 border px-4 text-sm font-semibold",
                  tab === entry.id
                    ? "border-navy bg-navy text-primary-foreground"
                    : "border-border text-charcoal hover:border-navy hover:text-navy",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="site-container py-12"
      >
        {tab === "posts" ? <PostsPanel /> : null}
        {tab === "insights" ? <InsightsPanel /> : null}
        {tab === "signups" ? <SignupsPanel /> : null}
        {tab === "responses" ? <ResponsesPanel /> : null}
        {tab === "clicks" ? <ClicksPanel /> : null}
      </div>
    </>
  );
}
