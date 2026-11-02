"use client";

import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { instance } from "@/api/api";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  usedDbContext?: boolean;
};

type ConversationResponse = {
  message?: string | null;
  used_db_context?: boolean;
  error?: string;
};

const suggestions = [
  "Which products do I have?",
  "How many products are in stock?",
  "Show me my suppliers",
  "What categories are available?",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>,
    prompt?: string,
  ) {
    event?.preventDefault();
    const text = (prompt ?? question).trim();

    if (!text || loading) return;

    setQuestion("");
    setError("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content: text },
    ]);
    setLoading(true);

    try {
      const response = await instance.post<ConversationResponse>(
        "/api/ai-conversation/",
        { message: text },
      );
      const answer = response.data.message?.trim();

      if (!answer) {
        throw new Error("The assistant returned an empty response.");
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: answer,
          usedDbContext: response.data.used_db_context,
        },
      ]);
    } catch (requestError) {
      console.error("AI conversation request failed:", requestError);
      const message = isAxiosError<ConversationResponse>(requestError)
        ? requestError.response?.data?.error ||
          "Could not get a response. Please try again."
        : requestError instanceof Error
          ? requestError.message
          : "Could not get a response. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col p-6 md:p-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Assistant
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">AI Conversation</h1>
        <p className="mt-2 text-slate-400">
          Ask questions about your products, stock, categories, and suppliers.
        </p>
      </header>

      <section
        aria-label="Conversation"
        aria-live="polite"
        className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-lg text-indigo-300">
            ✦
          </div>
          <div>
            <p className="font-semibold text-white">Inventory Assistant</p>
            <p className="text-xs text-slate-500">
              {loading ? "Thinking..." : "Ready to help"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-[300px] max-w-2xl flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-300">
                ✦
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">
                How can I help with your shop?
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Ask about your inventory or choose a suggested question to get
                started.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(undefined, suggestion)}
                    disabled={loading}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 transition hover:border-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[75%] ${
                    message.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "border border-slate-800 bg-slate-950 text-slate-200"
                  }`}
                >
                  {message.role === "assistant" && (
                    <p className="mb-1 text-xs font-medium text-indigo-300">
                      Inventory Assistant
                      {message.usedDbContext && (
                        <span className="ml-2 text-emerald-400">
                          · Live inventory data
                        </span>
                      )}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-400"
                role="status"
              >
                Assistant is thinking...
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {error && (
          <p
            className="mx-5 mb-3 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={(event) => void sendMessage(event)}
          className="border-t border-slate-800 p-4 md:p-5"
        >
          <label className="sr-only" htmlFor="ai-question">
            Your question
          </label>
          <div className="flex items-end gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-2 focus-within:border-indigo-500">
            <textarea
              id="ai-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask about your inventory..."
              rows={1}
              disabled={loading}
              className="max-h-36 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          <p className="mt-2 px-2 text-xs text-slate-500">
            Enter to send · Shift + Enter for a new line
          </p>
        </form>
      </section>
    </div>
  );
}
