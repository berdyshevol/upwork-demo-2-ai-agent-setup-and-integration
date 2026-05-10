import { NextResponse } from "next/server";
import { classifyAndDraft } from "@/lib/agent";
import {
  listEmails,
  recordRun,
  updateEmail,
  upsertDraft,
} from "@/lib/store";
import type { Run } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const startedAt = new Date().toISOString();
  const targets = listEmails().filter(
    (e) => e.category === "uncategorized" && e.status !== "handled",
  );

  let totalTokens = 0;
  let model = "rules-v1";

  for (const email of targets) {
    const verdict = await classifyAndDraft(email);
    updateEmail(email.id, {
      category: verdict.category,
      confidence: verdict.confidence,
      status: "drafted",
    });
    upsertDraft({
      emailId: email.id,
      replyText: verdict.reply,
      model: verdict.model,
      tokens: verdict.tokens,
    });
    totalTokens += verdict.tokens;
    model = verdict.model;
  }

  const finishedAt = new Date().toISOString();
  const run: Run = {
    id: `r_${Date.now().toString(36)}`,
    startedAt,
    finishedAt,
    emailsProcessed: targets.length,
    totalTokens,
    model,
  };
  recordRun(run);

  return NextResponse.json({
    runId: run.id,
    emailsProcessed: run.emailsProcessed,
    totalTokens: run.totalTokens,
    model: run.model,
  });
}
