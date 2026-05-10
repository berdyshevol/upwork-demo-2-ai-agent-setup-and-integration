import { listDrafts, listEmails, listRuns } from "@/lib/store";
import { CATEGORY_LABEL, CATEGORY_STYLE } from "@/lib/types";
import { formatDuration, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function ActivityPage() {
  const runs = listRuns();
  const drafts = listDrafts().sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
  const emails = listEmails();

  const totalTokens = runs.reduce((s, r) => s + r.totalTokens, 0);
  const totalProcessed = runs.reduce((s, r) => s + r.emailsProcessed, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Every agent run, with classifications, drafts, and token usage.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Agent runs" value={runs.length} />
        <Stat label="Emails processed" value={totalProcessed} />
        <Stat label="Tokens used" value={totalTokens} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Runs
        </h2>
        {runs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
            No runs yet. Trigger one from the{" "}
            <a href="/" className="underline">
              inbox
            </a>
            .
          </div>
        ) : (
          <div className="card divide-y divide-neutral-200">
            {runs.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <div>
                  <div className="font-medium">{formatTime(r.startedAt)}</div>
                  <div className="text-xs text-neutral-500">
                    {r.emailsProcessed} email
                    {r.emailsProcessed === 1 ? "" : "s"} ·{" "}
                    {formatDuration(r.startedAt, r.finishedAt)} · model{" "}
                    <span className="font-mono">{r.model}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-neutral-500">
                  <div className="font-mono text-sm text-ink">
                    {r.totalTokens}
                  </div>
                  <div>tokens</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Drafts produced
        </h2>
        {drafts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
            No drafts yet.
          </div>
        ) : (
          <div className="card divide-y divide-neutral-200">
            {drafts.map((d) => {
              const email = emails.find((e) => e.id === d.emailId);
              if (!email) return null;
              return (
                <a
                  key={d.id}
                  href={`/email/${email.id}`}
                  className="block px-5 py-4 hover:bg-neutral-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {email.subject}
                      </div>
                      <div className="truncate text-xs text-neutral-500">
                        {email.from} · {formatTime(d.createdAt)} · {d.tokens}{" "}
                        tokens
                      </div>
                    </div>
                    <span className={`badge ${CATEGORY_STYLE[email.category]}`}>
                      {CATEGORY_LABEL[email.category]}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
