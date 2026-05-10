"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

export function DraftEditor({
  emailId,
  initialReply,
  model,
  tokens,
  alreadyHandled,
}: {
  emailId: string;
  initialReply: string;
  model: string;
  tokens: number;
  alreadyHandled: boolean;
}) {
  const [reply, setReply] = useState(initialReply);
  const [saving, setSaving] = useState<"idle" | "save" | "send">("idle");
  const [, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  async function patch(action: "save" | "send") {
    setSaving(action);
    try {
      const res = await fetch(`/api/email/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replyText: reply,
          ...(action === "send" ? { status: "handled" } : {}),
        }),
      });
      if (!res.ok) {
        toast.push("Update failed");
        return;
      }
      toast.push(action === "send" ? "Reply sent (demo)" : "Draft saved");
      startTransition(() => router.refresh());
    } catch {
      toast.push("Update failed");
    } finally {
      setSaving("idle");
    }
  }

  if (!initialReply) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-5 text-sm text-neutral-600">
        No draft yet. Run the agent from the inbox to generate a suggested
        reply for this email.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={Math.max(8, Math.min(20, reply.split("\n").length + 2))}
        className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed shadow-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        spellCheck
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
        <span>
          model <span className="font-mono text-neutral-700">{model}</span> ·{" "}
          {tokens} tokens
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => patch("save")}
            disabled={saving !== "idle" || alreadyHandled}
            className="btn-secondary"
          >
            {saving === "save" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => patch("send")}
            disabled={saving !== "idle" || alreadyHandled}
            className="btn-primary"
          >
            {saving === "send"
              ? "Sending…"
              : alreadyHandled
                ? "Already sent"
                : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
