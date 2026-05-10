export type Category =
  | "support"
  | "sales"
  | "billing"
  | "spam"
  | "scheduling"
  | "uncategorized";

export type EmailStatus = "new" | "drafted" | "handled";

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  category: Category;
  confidence: number;
  status: EmailStatus;
}

export interface Draft {
  id: string;
  emailId: string;
  replyText: string;
  model: string;
  tokens: number;
  createdAt: string;
}

export interface Run {
  id: string;
  startedAt: string;
  finishedAt: string;
  emailsProcessed: number;
  totalTokens: number;
  model: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  support: "Support",
  sales: "Sales",
  billing: "Billing",
  spam: "Spam",
  scheduling: "Scheduling",
  uncategorized: "Uncategorized",
};

export const CATEGORY_STYLE: Record<Category, string> = {
  support: "bg-blue-100 text-blue-800",
  sales: "bg-emerald-100 text-emerald-800",
  billing: "bg-amber-100 text-amber-800",
  spam: "bg-rose-100 text-rose-800",
  scheduling: "bg-violet-100 text-violet-800",
  uncategorized: "bg-neutral-200 text-neutral-700",
};

export const STATUS_STYLE: Record<EmailStatus, string> = {
  new: "bg-neutral-200 text-neutral-700",
  drafted: "bg-indigo-100 text-indigo-800",
  handled: "bg-green-100 text-green-800",
};
