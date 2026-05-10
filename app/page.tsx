import { listEmails, listRuns } from "@/lib/store";
import { EmailRow } from "@/components/EmailRow";
import { RunAgentButton } from "@/components/RunAgentButton";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  const emails = listEmails();
  const runs = listRuns();
  const pending = emails.filter((e) => e.category === "uncategorized").length;
  const handled = emails.filter((e) => e.status === "handled").length;
  const lastRun = runs[0];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {emails.length} email{emails.length === 1 ? "" : "s"} ·{" "}
            {pending} awaiting triage · {handled} handled
            {lastRun && (
              <>
                {" · last run "}
                <span className="text-neutral-500">
                  {new Date(lastRun.startedAt).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </p>
        </div>
        <RunAgentButton pending={pending} />
      </section>

      <section className="card overflow-hidden">
        {emails.map((e) => (
          <EmailRow key={e.id} email={e} />
        ))}
      </section>

      <section className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-5 text-sm text-neutral-600">
        <p className="font-medium text-ink">How this demo works</p>
        <p className="mt-1">
          Click <span className="font-medium">Run agent</span> to invoke the LLM
          (or the deterministic fallback if{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            OPENAI_API_KEY
          </code>{" "}
          isn&apos;t set). The agent classifies each pending email, drafts a
          reply, and records the run on the{" "}
          <a href="/activity" className="underline">
            Activity
          </a>{" "}
          page. Open any email to review and edit the draft before sending.
        </p>
      </section>
    </div>
  );
}
