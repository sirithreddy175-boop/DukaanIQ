const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Send, Sparkles, Loader2, Brain, AlertCircle } from "lucide-react";
import VoiceInputButton from "./VoiceInputButton";
import { useLanguage } from "@/lib/LanguageContext";

// "Ask Your Business" — connected to the askBusiness backend function.
// Flow: question -> askBusiness -> Hindsight recall -> Groq LLM -> grounded answer.
export default function AskBar() {
  const { lang } = useLanguage();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null); // { text, grounded, memory_count }
  const [error, setError] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError("");
    setAnswer(null);
    try {
      const res = await db.functions.invoke("askBusiness", { query: q });
      if (res.error) throw new Error(res.error);
      setAnswer({
        text: res.answer,
        grounded: res.grounded,
        memory_count: res.memory_count || 0,
      });
    } catch (err) {
      setError(
        err?.message || "Could not reach the business memory right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]/10">
          <Sparkles className="h-4 w-4 text-[#6366F1]" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#0F172A]">Ask Your Business</h2>
          <p className="text-xs text-[#64748B]">Ask anything about your sales, stock or customers.</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="ask-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which product sold the most this month?"
            disabled={loading}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-4 pr-12 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition disabled:opacity-60"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <VoiceInputButton onTranscript={setQuestion} lang={lang} />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B2D5B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">{loading ? "Thinking…" : "Ask"}</span>
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {answer && (
        <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap">{answer.text}</p>
          {answer.grounded && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
              <Brain className="h-3.5 w-3.5 text-[#6366F1]" />
              <span>
                Based on business memory{answer.memory_count > 0 ? ` · ${answer.memory_count} memories recalled` : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}