import type { Category, Email } from "./types";

export interface AgentVerdict {
  category: Category;
  confidence: number;
  reply: string;
  model: string;
  tokens: number;
}

const KEYWORDS: { cat: Category; words: string[] }[] = [
  {
    cat: "billing",
    words: [
      "invoice",
      "past due",
      "payment",
      "card declined",
      "receipt",
      "refund",
      "charge",
      "billing",
    ],
  },
  {
    cat: "spam",
    words: [
      "congratulations",
      "gift card",
      "pre-approved",
      "claim your",
      "limited spots",
      "winner",
      "prize",
      "click the link",
    ],
  },
  {
    cat: "scheduling",
    words: [
      "schedule",
      "meeting",
      "calendar",
      "available",
      "follow-up",
      "thursday",
      "friday",
      "monday",
      "tuesday",
      "wednesday",
      "pm pt",
      "am pt",
      "demo",
    ],
  },
  {
    cat: "sales",
    words: [
      "pricing",
      "quote",
      "enterprise",
      "seats",
      "msa",
      "evaluating",
      "competitor",
      "decision",
      "plan",
    ],
  },
  {
    cat: "support",
    words: [
      "webhook",
      "error",
      "broken",
      "not working",
      "blocked",
      "bug",
      "issue",
      "down",
      "production",
      "endpoint",
    ],
  },
];

function heuristicClassify(email: Email): { cat: Category; conf: number } {
  const haystack = `${email.subject}\n${email.body}`.toLowerCase();
  const scores: Partial<Record<Category, number>> = {};
  for (const { cat, words } of KEYWORDS) {
    for (const w of words) {
      if (haystack.includes(w)) {
        scores[cat] = (scores[cat] ?? 0) + 1;
      }
    }
  }
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) {
    return { cat: "support", conf: 0.55 };
  }
  const [topCat, topScore] = ranked[0];
  const total = ranked.reduce((s, [, v]) => s + v, 0);
  const conf = Math.min(0.97, 0.6 + (topScore / Math.max(total, 1)) * 0.37);
  return { cat: topCat as Category, conf };
}

function heuristicReply(email: Email, category: Category): string {
  const senderName =
    email.from.match(/^([^<]+)</)?.[1].trim() || email.from.split("@")[0];
  const first = senderName.split(/\s+/)[0];

  switch (category) {
    case "support":
      return `Hi ${first},\n\nThanks for the report — I'm sorry you're seeing this. I've pulled the logs for your account and I'm looking into the silent webhook now. As a first step, can you confirm whether any 4xx or 5xx responses were logged on your end between 08:00 and 08:30 UTC?\n\nI'll follow up within the next hour with a status update.\n\nBest,\nAgentDesk Support`;
    case "sales":
      return `Hi ${first},\n\nHappy to help. For 40 seats on Enterprise with SSO and the audit log add-on, the annual contract comes to $58,800 (15% off list). I'll send the formal quote and a sample MSA in a separate thread within the hour so your team can review before Tuesday's call.\n\nLet me know if there's a specific procurement format you'd like.\n\nBest,\nAgentDesk Sales`;
    case "billing":
      return `Hello,\n\nThanks for the heads up. I see invoice INV-20260501 is marked past due and the card on file was declined. To avoid the May 14th service interruption, please update the payment method from the Billing settings page, or reply with a preferred alternative method and we'll send a secure update link.\n\nWe're happy to extend the grace period by 5 business days if needed — just confirm.\n\nBest,\nAgentDesk Billing`;
    case "spam":
      return `(No reply recommended — message flagged as likely spam / phishing. Suggest moving to junk and blocking the sender domain.)`;
    case "scheduling":
      return `Hi ${first},\n\nThursday May 14 at 2:00pm PT works on our side — I'll send a calendar invite with the engineering lead and a Zoom link shortly. Please let me know if you'd like us to prepare anything specific (auth flow, webhooks, rate limits) ahead of the session.\n\nLooking forward to it,\nAgentDesk`;
    default:
      return `Hi ${first},\n\nThanks for the message — I've routed this to the right team and you'll hear back shortly.\n\nBest,\nAgentDesk`;
  }
}

function approxTokens(text: string): number {
  return Math.max(1, Math.round(text.length / 4));
}

async function runOpenAI(email: Email): Promise<AgentVerdict | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const system = `You triage incoming emails for a SaaS support inbox. Classify the email into exactly one of: support, sales, billing, spam, scheduling. Then draft a concise, professional reply (or note if no reply is appropriate, e.g. for spam). Respond ONLY with valid JSON: {"category": "...", "confidence": 0..1, "reply": "..."}.`;
    const user = `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body}`;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
      usage?: { total_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      category?: string;
      confidence?: number;
      reply?: string;
    };
    const category = (parsed.category ?? "support") as Category;
    const confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.8));
    const reply = parsed.reply ?? "";
    return {
      category,
      confidence,
      reply,
      model: "gpt-4o-mini",
      tokens: data.usage?.total_tokens ?? approxTokens(reply) + 200,
    };
  } catch {
    return null;
  }
}

export async function classifyAndDraft(email: Email): Promise<AgentVerdict> {
  const fromOpenAI = await runOpenAI(email);
  if (fromOpenAI) return fromOpenAI;

  const { cat, conf } = heuristicClassify(email);
  const reply = heuristicReply(email, cat);
  return {
    category: cat,
    confidence: conf,
    reply,
    model: "rules-v1",
    tokens: approxTokens(`${email.subject}${email.body}${reply}`),
  };
}
