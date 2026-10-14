import { useEffect, useState } from "react";

import { downloadFile, fetchAll, toCsv } from "@/components/admin/admin-utils";
import { Button } from "@/components/ui/button";
import { resources } from "@/data/resources";
import { formatDate } from "@/lib/content";
import { getSupabase } from "@/lib/supabase/client";

type CountRow = {
  resource_id: string;
  total_clicks: number;
  signed_in_clicks: number;
  unique_users: number;
  last_click_at: string;
};

type ClickRow = {
  id: number;
  resource_id: string;
  source_path: string | null;
  created_at: string;
  user_id: string | null;
  profiles: { full_name: string } | null;
};

const resourceName = (id: string) => resources.find((resource) => resource.id === id)?.name ?? id;

/** Which resources people open (and which signed-in people), for referral conversations. */
export function ClicksPanel() {
  const [counts, setCounts] = useState<CountRow[] | null>(null);
  const [recent, setRecent] = useState<ClickRow[]>([]);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void Promise.all([
      supabase.rpc("admin_click_counts"),
      supabase
        .from("resource_clicks")
        .select("id, resource_id, source_path, created_at, user_id, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(200),
    ]).then(([countResult, recentResult]) => {
      if (countResult.error || recentResult.error) {
        setError("Click data couldn't be loaded. Refresh to try again.");
        setCounts([]);
        return;
      }
      setCounts((countResult.data as CountRow[]) ?? []);
      setRecent((recentResult.data as unknown as ClickRow[]) ?? []);
    });
  }, []);

  async function exportCsv() {
    const supabase = getSupabase();
    if (!supabase) return;
    setExporting(true);
    try {
      const rows = await fetchAll<ClickRow>((from, to) =>
        supabase
          .from("resource_clicks")
          .select("id, resource_id, source_path, created_at, user_id, profiles(full_name)")
          .order("created_at", { ascending: false })
          .range(from, to),
      );
      const csv = toCsv(
        rows.map((row) => ({
          ...row,
          resource: resourceName(row.resource_id),
          account: row.profiles?.full_name ?? (row.user_id ? "(account)" : "Visitor"),
        })),
        [
          ["created_at", "Clicked"],
          ["resource", "Resource"],
          ["resource_id", "Resource id"],
          ["account", "Account"],
          ["source_path", "Page"],
        ],
      );
      downloadFile(`futurewise-resource-clicks-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch {
      setError("The export didn't work. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  if (counts === null)
    return (
      <p role="status" className="text-charcoal/70">
        Loading clicks…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  if (counts.length === 0)
    return <p className="text-charcoal/75">No resource clicks recorded yet.</p>;

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => void exportCsv()}
          disabled={exporting}
        >
          {exporting ? "Preparing…" : "Download all clicks as CSV"}
        </Button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-light-grey text-xs text-charcoal/75">
            <tr>
              <th className="p-3 font-semibold">Resource</th>
              <th className="p-3 font-semibold">Clicks</th>
              <th className="p-3 font-semibold">By signed-in people</th>
              <th className="p-3 font-semibold">Different accounts</th>
              <th className="p-3 font-semibold">Last click</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((row) => (
              <tr key={row.resource_id} className="border-t border-border">
                <td className="p-3 font-medium text-navy">{resourceName(row.resource_id)}</td>
                <td className="p-3">{row.total_clicks}</td>
                <td className="p-3">{row.signed_in_clicks}</td>
                <td className="p-3">{row.unique_users}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(row.last_click_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h3 className="font-semibold text-navy">Latest clicks</h3>
        <ul className="mt-4 divide-y divide-border border border-border text-sm">
          {recent.map((row) => (
            <li key={row.id} className="grid gap-1 p-3 sm:grid-cols-[10rem_1fr_12rem]">
              <span className="text-charcoal/70">{formatDate(row.created_at)}</span>
              <span className="font-medium text-navy">{resourceName(row.resource_id)}</span>
              <span className="text-charcoal/80">
                {row.profiles?.full_name || (row.user_id ? "(account)" : "Visitor")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
