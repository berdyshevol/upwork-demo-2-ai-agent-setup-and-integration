import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "AgentDesk — AI Agent Control Panel",
  description:
    "Demo control panel for an LLM agent that triages email, drafts replies, and logs every action.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ToastProvider>
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-white text-xs font-bold">
                A
              </span>
              <span className="font-semibold">AgentDesk</span>
              <span className="hidden text-xs text-neutral-500 sm:inline">
                AI agent control panel
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
              >
                Inbox
              </Link>
              <Link
                href="/activity"
                className="rounded-md px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
              >
                Activity
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-xs text-neutral-500">
          Demo prototype · in-memory state · resets on cold start
        </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
