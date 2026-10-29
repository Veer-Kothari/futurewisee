import { useEffect, useState } from "react";

import { downloadFile, toCsv } from "@/components/admin/admin-utils";
import { Button } from "@/components/ui/button";
import { listSignups, type Signup } from "@/lib/admin.functions";
import { formatDate } from "@/lib/content";

const SHOWN = 100;

/** Everyone who has signed up, with a spreadsheet (CSV) of the whole list. */
export function SignupsPanel() {
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void listSignups()
      .catch(() => null)
      .then((result) => {
        if (!result?.ok) {
          setError(
            result?.reason === "forbidden"
              ? "Only FutureWise editors can see sign-ups."
              : "Sign-ups couldn't be loaded. Refresh to try again.",
          );
          setSignups([]);
          return;
        }
        setSignups(result.signups);
      });
  }, []);

  function exportCsv() {
    if (!signups) return;
    const csv = toCsv(
      signups.map((row) => ({
        ...row,
        email_confirmed: row.email_confirmed ? "Yes" : "No",
        email_updates: row.email_updates ? "Yes" : "No",
      })),
      [
        ["signed_up", "Signed up"],
        ["name", "Name"],
        ["email", "Email"],
        ["email_confirmed", "Email confirmed"],
        ["email_updates", "Email updates"],
      ],
    );
    downloadFile(`futurewise-signups-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (signups === null)
    return (
      <p role="status" className="text-charcoal/70">
        Loading sign-ups…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  if (signups.length === 0) return <p className="text-charcoal/75">No sign-ups yet.</p>;

  const withUpdates = signups.filter((row) => row.email_updates).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-charcoal/80">
          {signups.length} {signups.length === 1 ? "sign-up" : "sign-ups"}, {withUpdates} with email
          updates.
        </p>
        <Button type="button" variant="outline" className="h-11" onClick={exportCsv}>
          Download sign-ups as CSV
        </Button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-light-grey text-xs text-charcoal/75">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Signed up</th>
              <th className="p-3 font-semibold">Confirmed</th>
              <th className="p-3 font-semibold">Email updates</th>
            </tr>
          </thead>
          <tbody>
            {signups.slice(0, SHOWN).map((row) => (
              <tr key={`${row.email}-${row.signed_up}`} className="border-t border-border">
                <td className="p-3 font-medium text-navy">{row.name || "—"}</td>
                <td className="p-3">{row.email}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(row.signed_up)}</td>
                <td className="p-3">{row.email_confirmed ? "Yes" : "No"}</td>
                <td className="p-3">{row.email_updates ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {signups.length > SHOWN ? (
        <p className="text-sm text-charcoal/70">
          Showing the newest {SHOWN}. The CSV has all {signups.length}.
        </p>
      ) : null}
    </div>
  );
}
