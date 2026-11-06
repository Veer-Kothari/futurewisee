import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { AccountsUnavailable } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteMyAccount,
  reconcileMarketing,
  updateMarketingPreference,
} from "@/lib/account.functions";
import { site } from "@/data/site";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/content";
import { fetchAll } from "@/lib/fetch-all";
import { privateHead } from "@/lib/seo";
import { getSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): { welcome?: 1 } =>
    search["welcome"] === 1 || search["welcome"] === "1" ? { welcome: 1 } : {},
  head: () => privateHead("Your account"),
  component: AccountPage,
});

type MyResponse = {
  id: string;
  created_at: string;
  source: string;
  respondent_role: string;
  industries: string[];
  needs: string[];
  confidence: number;
};

function AccountPage() {
  const auth = useAuth();
  const { welcome } = Route.useSearch();

  if (auth.status === "loading") {
    return (
      <div className="site-container py-24">
        <h1 className="text-3xl font-bold text-navy">Your account</h1>
        <p role="status" className="mt-4 text-charcoal/75">
          Loading your account…
        </p>
      </div>
    );
  }
  if (auth.status === "unavailable") {
    return (
      <div className="site-container max-w-2xl py-24">
        <h1 className="mb-6 text-3xl font-bold text-navy">Your account</h1>
        <AccountsUnavailable />
      </div>
    );
  }
  if (auth.status === "signed-out" || !auth.session) {
    return (
      <section className="site-container max-w-2xl py-24">
        <h1 className="text-3xl font-bold text-navy">Your account</h1>
        <p className="mt-4 text-charcoal/80">Log in to see your account.</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          <Link to="/login" search={{ redirect: "/account" }} className="text-link">
            Log in
          </Link>
          <Link to="/signup" className="text-link">
            Create an account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-14 sm:py-16">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">Your account</h1>
          {welcome ? (
            <p role="status" className="mt-4 border-l-2 border-blue bg-light-blue p-4 text-navy">
              Your email is confirmed. Welcome to FutureWise.
            </p>
          ) : null}
          {auth.isAdmin ? (
            <p className="mt-4 text-sm text-charcoal/75">
              You can edit the blog and Industry Insights.{" "}
              <Link to="/admin" className="font-semibold text-navy underline">
                Open the editor
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <div className="site-container grid gap-10 py-14 lg:grid-cols-[1fr_1fr]">
        <ProfileSection />
        <EmailSection />
        <AnswersSection />
        <DataSection />
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border border-t-2 border-t-navy p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-navy">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileSection() {
  const auth = useAuth();
  const [name, setName] = useState(auth.profile?.full_name ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 120) {
      setMessage("Enter a name of up to 120 characters.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase || !auth.session) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", auth.session.user.id);
    setBusy(false);
    setMessage(error ? "Your name couldn't be saved. Please try again." : "Saved.");
    if (!error) await auth.refresh();
  }

  return (
    <Panel title="Your details">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-charcoal">Email</p>
          <p className="text-sm text-charcoal/80">{auth.session?.user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={busy} className="h-11">
            {busy ? "Saving…" : "Save"}
          </Button>
          <p role="status" className="text-sm text-navy">
            {message}
          </p>
        </div>
      </form>
    </Panel>
  );
}

function EmailSection() {
  const auth = useAuth();
  const optedIn = auth.profile?.marketing_opt_in ?? false;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function change(next: boolean) {
    setBusy(true);
    setMessage("");
    const result = await updateMarketingPreference({ data: { optIn: next } }).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      setMessage("Your choice couldn't be saved. Please try again.");
      return;
    }
    await auth.refresh();
    if (!result.configured) {
      // Kit isn't connected yet: the choice is stored and applied once it is.
      setMessage("Saved.");
      return;
    }
    if (result.refused) {
      // Kit can't subscribe the address (for example someone who unsubscribed
      // earlier): trying again won't help, so point them to a person.
      setMessage(`We can't restart emails to this address from here. Please email ${site.email}.`);
      return;
    }
    if (!result.synced) {
      // Saved, but the email list wasn't updated yet (busy or briefly
      // unreachable): try once more shortly; later sign-ins keep retrying.
      setMessage(
        next
          ? "Saved. Our email list will be updated in a moment. If this is new, check your inbox then to confirm your email address."
          : "Saved, but we couldn't update our email list yet. To stop emails now, use the unsubscribe link in any email.",
      );
      window.setTimeout(() => void reconcileMarketing().catch(() => null), 6000);
      return;
    }
    setMessage(
      next
        ? "Saved. If this is new, check your inbox to confirm your email address."
        : "Saved. You won't get FutureWise emails any more.",
    );
  }

  return (
    <Panel title="Email updates">
      <label
        htmlFor="account-marketing"
        className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-charcoal"
      >
        <input
          id="account-marketing"
          type="checkbox"
          checked={optedIn}
          disabled={busy}
          onChange={(event) => void change(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[var(--navy)]"
        />
        <span>Email me when new FutureWise resources are ready.</span>
      </label>
      <p className="mt-2 text-sm leading-6 text-charcoal/70">
        Emails are sent with Kit. Every email has an unsubscribe link, and unticking this box
        unsubscribes you too. Once you unsubscribe, emails can't be restarted from this page: email{" "}
        {site.email}.
      </p>
      <p role="status" className="mt-3 min-h-6 text-sm text-navy">
        {busy ? "Saving…" : message}
      </p>
    </Panel>
  );
}

function AnswersSection() {
  const auth = useAuth();
  const [rows, setRows] = useState<MyResponse[] | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !auth.session) return;
    let active = true;
    void supabase
      .from("survey_responses")
      .select("id, created_at, source, respondent_role, industries, needs, confidence")
      .eq("user_id", auth.session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setRows((data as MyResponse[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, [auth.session]);

  // The survey was retired (29 Oct 2026): the panel only shows answers already saved.
  if (rows?.length === 0) return null;

  return (
    <Panel title="Your survey answers">
      {rows === null ? (
        <p role="status" className="text-sm text-charcoal/70">
          Loading…
        </p>
      ) : (
        <ul className="space-y-5">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border-l-2 border-blue pl-4 text-sm leading-6 text-charcoal/85"
            >
              <p className="font-semibold text-navy">{formatDate(row.created_at)}</p>
              <p>Heard about FutureWise: {row.source}</p>
              <p>Describes you: {row.respondent_role}</p>
              <p>Industries: {row.industries.join(", ")}</p>
              <p>Needs help with: {row.needs.join(", ")}</p>
              <p>Career confidence: {row.confidence} of 5</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DataSection() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [message, setMessage] = useState("");

  async function download() {
    const supabase = getSupabase();
    if (!supabase || !auth.session) return;
    setBusy("export");
    setMessage("");
    const userId = auth.session.user.id;
    let exported: Record<string, unknown>;
    try {
      // Every record, page by page; any failed read stops the download.
      const [profile, responses, clicks] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, marketing_opt_in, age_confirmed, created_at")
          .eq("id", userId)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error || !data) throw new Error("profile");
            return data;
          }),
        fetchAll((from, to) =>
          supabase
            .from("survey_responses")
            .select("id, created_at, source, respondent_role, industries, needs, confidence")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .range(from, to),
        ),
        fetchAll((from, to) =>
          supabase
            .from("resource_clicks")
            .select("id, resource_id, source_path, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .range(from, to),
        ),
      ]);
      exported = {
        exported_at: new Date().toISOString(),
        email: auth.session.user.email,
        profile,
        survey_responses: responses,
        resource_clicks: clicks,
      };
    } catch {
      setBusy(null);
      setMessage(
        "Your data couldn't be collected completely, so nothing was downloaded. Please try again.",
      );
      return;
    }
    setBusy(null);
    const file = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "futurewise-my-data.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoking straight away cancels the download in Safari and Firefox.
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function remove(event: FormEvent) {
    event.preventDefault();
    if (confirm !== "DELETE") {
      setMessage("Type DELETE in capitals to confirm.");
      return;
    }
    setBusy("delete");
    setMessage("");
    const result = await deleteMyAccount({ data: { confirm: "DELETE" } }).catch(() => null);
    if (!result?.ok) {
      setBusy(null);
      setMessage(
        "Your account couldn't be deleted. Please try again.",
      );
      return;
    }
    await auth.signOut();
    await navigate({ to: "/", replace: true });
  }

  return (
    <Panel title="Your data">
      <div className="space-y-6">
        <div>
          <p className="text-sm leading-6 text-charcoal/80">
            Download everything FutureWise holds about your account as a file.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11"
            disabled={busy !== null}
            onClick={download}
          >
            {busy === "export" ? "Preparing…" : "Download my data"}
          </Button>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => void auth.signOut().then(() => navigate({ to: "/" }))}
          >
            Sign out
          </Button>
        </div>
        <form onSubmit={remove} noValidate className="space-y-3 border-t border-border pt-6">
          <h3 className="font-semibold text-navy">Delete your account</h3>
          <p className="text-sm leading-6 text-charcoal/80">
            This removes your account, your details and the survey answers saved to it. It can't be
            undone.
          </p>
          <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
          <Input
            id="delete-confirm"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="off"
            className="h-11"
          />
          <Button type="submit" variant="destructive" disabled={busy !== null} className="h-11">
            {busy === "delete" ? "Deleting…" : "Delete my account"}
          </Button>
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        </form>
      </div>
    </Panel>
  );
}
