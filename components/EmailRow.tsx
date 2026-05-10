import Link from "next/link";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLE,
  STATUS_STYLE,
  type Email,
} from "@/lib/types";
import { formatRelative } from "@/lib/format";

export function EmailRow({ email }: { email: Email }) {
  return (
    <Link
      href={`/email/${email.id}`}
      className="block border-b border-neutral-200 px-5 py-4 last:border-b-0 hover:bg-neutral-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{email.from}</span>
            <span className="text-xs text-neutral-500">
              · {formatRelative(email.receivedAt)}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[15px] font-semibold text-ink">
            {email.subject}
          </div>
          <div className="mt-1 line-clamp-1 text-sm text-neutral-600">
            {email.body.replace(/\n+/g, " ")}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {email.category !== "uncategorized" ? (
            <span className={`badge ${CATEGORY_STYLE[email.category]}`}>
              {CATEGORY_LABEL[email.category]}
              {email.confidence > 0 && (
                <span className="ml-1 opacity-70">
                  {Math.round(email.confidence * 100)}%
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
      </div>
    </Link>
  );
}
