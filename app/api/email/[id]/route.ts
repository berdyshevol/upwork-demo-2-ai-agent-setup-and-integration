import { NextResponse } from "next/server";
import {
  getDraftFor,
  getEmail,
  setStatus,
  upsertDraft,
} from "@/lib/store";
import type { EmailStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const email = getEmail(id);
  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    replyText?: string;
    status?: EmailStatus;
  };

  if (typeof body.replyText === "string") {
    const existing = getDraftFor(id);
    upsertDraft({
      emailId: id,
      replyText: body.replyText,
      model: existing?.model ?? "manual-edit",
      tokens: existing?.tokens ?? 0,
    });
  }

  if (body.status) {
    setStatus(id, body.status);
  }

  return NextResponse.json({ ok: true });
}
