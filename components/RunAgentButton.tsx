"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

export function RunAgentButton({ pending }: { pending: number }) {
  const [isPending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function onClick() {
    setRunning(true);
    try {
      const res = await fetch("/api/agent/run", { method: "POST" });
      if (!res.ok) {
        toast.push("Agent run failed");
        return;
      }
      const data = (await res.json()) as {
        emailsProcessed: number;
        totalTokens: number;
        model: string;
      };
      toast.push(
        `Agent processed ${data.emailsProcessed} email${
          data.emailsProcessed === 1 ? "" : "s"
        } · ${data.totalTokens} tokens (${data.model})`,
      );
      startTransition(() => router.refresh());
    } catch {
      toast.push("Agent run failed");
    } finally {
      setRunning(false);
    }
  }

  const busy = running || isPending;
  return (
    <button
      onClick={onClick}
      disabled={busy || pending === 0}
      className="btn-primary"
    >
      {busy ? (
        <>
          <Spinner />
          Running agent…
        </>
      ) : (
        <>
          <BoltIcon />
          {pending > 0
            ? `Run agent on ${pending} email${pending === 1 ? "" : "s"}`
            : "All emails processed"}
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden
    />
  );
}

function BoltIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
