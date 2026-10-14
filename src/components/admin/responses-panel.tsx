import { useEffect, useMemo, useState } from "react";

import { downloadFile, fetchAll, toCsv } from "@/components/admin/admin-utils";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/content";
import { SURVEY_INDUSTRIES, SURVEY_NEEDS, SURVEY_ROLES, SURVEY_SOURCES } from "@/lib/survey";
import { getSupabase } from "@/lib/supabase/client";

type Row = {
  id: string;
  created_at: string;
  source: string;
  respondent_role: string;
  industries: string[];
  needs: string[];
  confidence: number;
  user_id: string | null;
  profiles: { full_name: string } | null;
};

function tally(values: string[], options: readonly string[]) {
  const counts = new Map<string, number>(options.map((option) => [option, 0]));
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Survey answers: totals per question, the latest responses, and a CSV of every row. */
export function ResponsesPanel() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    fetchAll<Row>((from, to) =>
      supabase
        .from("survey_responses")
        .select(
          "id, created_at, source, respondent_role, industries, needs, confidence, user_id, profiles(full_name)",
        )
        .order("created_at", { ascending: false })
        .range(from, to),
    )
      .then(setRows)
      .catch(() => {
        setError("Responses couldn't be loaded. Refresh to try again.");
        setRows([]);
      });
  }, []);

  const summary = useMemo(() => {
    if (!rows?.length) return null;
    return {
      total: rows.length,
      withAccount: rows.filter((row) => row.user_id).length,
      averageConfidence: rows.reduce((sum, row) => sum + row.confidence, 0) / rows.length,
      questions: [
        {
          title: "How they heard about FutureWise",
          counts: tally(
            rows.map((r) => r.source),
            SURVEY_SOURCES,
          ),
        },
        {
          title: "Who they are",
          counts: tally(
            rows.map((r) => r.respondent_role),
            SURVEY_ROLES,
          ),
        },
        {
          title: "Industries of interest",
          counts: tally(
            rows.flatMap((r) => r.industries),
            SURVEY_INDUSTRIES,
          ),
        },
        {
          title: "Needs help with",
          counts: tally(
            rows.flatMap((r) => r.needs),
            SURVEY_NEEDS,
          ),
        },
      ],
    };
  }, [rows]);

  function exportCsv() {
    if (!rows) return;
    const csv = toCsv(
      rows.map((row) => ({
        ...row,
        account: row.profiles?.full_name ?? (row.user_id ? "(account)" : "Anonymous"),
      })),
      [
        ["created_at", "Submitted"],
        ["account", "Account"],
        ["source", "Heard about FutureWise"],
        ["respondent_role", "Describes them"],
        ["industries", "Industries"],
        ["needs", "Needs help with"],
        ["confidence", "Career confidence (1-5)"],
      ],
    );
    downloadFile(`futurewise-survey-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (rows === null)
    return (
      <p role="status" className="text-charcoal/70">
        Loading responses…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  if (!summary) return <p className="text-charcoal/75">No survey responses yet.</p>;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <dl className="grid grid-cols-3 gap-px border border-border bg-border">
          <div className="bg-background p-4">
            <dt className="text-xs text-charcoal/65">Responses</dt>
            <dd className="text-2xl font-semibold text-navy">{summary.total}</dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs text-charcoal/65">With an account</dt>
            <dd className="text-2xl font-semibold text-navy">{summary.withAccount}</dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs text-charcoal/65">Average confidence</dt>
            <dd className="text-2xl font-semibold text-navy">
              {summary.averageConfidence.toFixed(1)} / 5
            </dd>
          </div>
        </dl>
        <Button type="button" variant="outline" className="h-11" onClick={exportCsv}>
          Download all as CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {summary.questions.map((question) => (
          <section key={question.title} className="border border-border p-5">
            <h3 className="font-semibold text-navy">{question.title}</h3>
            <ul className="mt-4 space-y-2">
              {question.counts.map(([option, count]) => (
                <li key={option} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                  <span className="text-charcoal">{option}</span>
                  <span className="font-semibold text-navy">{count}</span>
                  <span className="col-span-2 h-1 bg-light-grey">
                    <span
                      className="block h-1 bg-navy"
                      style={{
                        width: `${summary.total ? Math.round((count / summary.total) * 100) : 0}%`,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section>
        <h3 className="font-semibold text-navy">Latest responses</h3>
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-light-grey text-xs text-charcoal/75">
              <tr>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Account</th>
                <th className="p-3 font-semibold">Describes them</th>
                <th className="p-3 font-semibold">Industries</th>
                <th className="p-3 font-semibold">Needs</th>
                <th className="p-3 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="p-3 whitespace-nowrap">{formatDate(row.created_at)}</td>
                  <td className="p-3">
                    {row.profiles?.full_name || (row.user_id ? "(account)" : "Anonymous")}
                  </td>
                  <td className="p-3">{row.respondent_role}</td>
                  <td className="p-3">{row.industries.join(", ")}</td>
                  <td className="p-3">{row.needs.join(", ")}</td>
                  <td className="p-3">{row.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 100 ? (
          <p className="mt-2 text-xs text-charcoal/65">
            Showing the latest 100. The CSV has all {rows.length}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
