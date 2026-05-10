import type { Draft, Email, EmailStatus, Run } from "./types";
import { SEED_EMAILS } from "./seed";

type StoreShape = {
  emails: Email[];
  drafts: Draft[];
  runs: Run[];
};

const globalKey = "__agentdesk_store__";
const g = globalThis as unknown as { [key: string]: StoreShape | undefined };

function init(): StoreShape {
  return {
    emails: SEED_EMAILS.map((e) => ({ ...e })),
    drafts: [],
    runs: [],
  };
}

function getStore(): StoreShape {
  if (!g[globalKey]) {
    g[globalKey] = init();
  }
  return g[globalKey] as StoreShape;
}

export function listEmails(): Email[] {
  return [...getStore().emails].sort((a, b) =>
    a.receivedAt < b.receivedAt ? 1 : -1,
  );
}

export function getEmail(id: string): Email | undefined {
  return getStore().emails.find((e) => e.id === id);
}

export function getDraftFor(emailId: string): Draft | undefined {
  const drafts = getStore().drafts.filter((d) => d.emailId === emailId);
  if (drafts.length === 0) return undefined;
  return drafts.reduce((latest, d) =>
    d.createdAt > latest.createdAt ? d : latest,
  );
}

export function listRuns(): Run[] {
  return [...getStore().runs].sort((a, b) =>
    a.startedAt < b.startedAt ? 1 : -1,
  );
}

export function listDrafts(): Draft[] {
  return [...getStore().drafts];
}

export function updateEmail(
  id: string,
  patch: Partial<Pick<Email, "category" | "confidence" | "status">>,
): Email | undefined {
  const store = getStore();
  const idx = store.emails.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  store.emails[idx] = { ...store.emails[idx], ...patch };
  return store.emails[idx];
}

export function setStatus(id: string, status: EmailStatus): Email | undefined {
  return updateEmail(id, { status });
}

export function upsertDraft(input: {
  emailId: string;
  replyText: string;
  model: string;
  tokens: number;
}): Draft {
  const store = getStore();
  const existing = store.drafts.find((d) => d.emailId === input.emailId);
  if (existing) {
    existing.replyText = input.replyText;
    existing.model = input.model;
    existing.tokens = input.tokens;
    existing.createdAt = new Date().toISOString();
    return existing;
  }
  const draft: Draft = {
    id: `d_${Math.random().toString(36).slice(2, 9)}`,
    emailId: input.emailId,
    replyText: input.replyText,
    model: input.model,
    tokens: input.tokens,
    createdAt: new Date().toISOString(),
  };
  store.drafts.push(draft);
  return draft;
}

export function recordRun(run: Run): Run {
  getStore().runs.push(run);
  return run;
}

export function resetAll() {
  g[globalKey] = init();
}
