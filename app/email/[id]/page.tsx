import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraftFor, getEmail } from "@/lib/store";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLE,
  STATUS_STYLE,
} from "@/lib/types";
import { formatTime } from "@/lib/format";
import { DraftEditor } from "@/components/DraftEditor";

export const dynamic = "force-dynamic";

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const email = getEmail(id);
  if (!email) notFound();

  const draft = getDraftFor(id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-ink"
        >
          ← Back to inbox
        </Link>
      </div>

      <article className="card p-6">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {email.subject}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">{email.from}</p>
            <p className="text-xs text-neutral-500">
              {formatTime(email.receivedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {email.category !== "uncategorized" ? (
              <span className={`badge ${CATEGORY_STYLE[email.category]}`}>
                {CATEGORY_LABEL[email.category]}
                {email.confidence > 0 && (
                  <span className="ml-1 opacity-70">
                    {Math.round(email.confidence * 100)}% conf.
                  </span>
                )}
              </span>
            ) : (
              <span className="badge bg-neutral-100 text-neutral-500">
                Awaiting agent
              </span>
            )}
            <span className={`badge ${STATUS_STYLE[email.status]}`}>
              {email.status}
            </span>
          </div>
        </header>

        <div className="whitespace-pre-wrap pt-4 text-[15px] leading-relaxed text-neutral-800">
          {email.body}
        </div>
      </article>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Suggested reply
          </h2>
          {draft && (
            <span className="text-xs text-neutral-500">
              drafted {formatTime(draft.createdAt)}
            </span>
          )}
        </div>
        <DraftEditor
          emailId={email.id}
          initialReply={draft?.replyText ?? ""}
          model={draft?.model ?? "—"}
          tokens={draft?.tokens ?? 0}
          alreadyHandled={email.status === "handled"}
        />
      </section>
    </div>
  );
}
