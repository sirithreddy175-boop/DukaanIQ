import React from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";

const COMING = [
  { icon: TrendingUp, title: "Best-selling products", text: "See what's moving fastest so you never run out.", accent: "#3B82F6" },
  { icon: AlertTriangle, title: "Low-stock warnings", text: "Get told before a popular item runs dry.", accent: "#F59E0B" },
  { icon: Lightbulb, title: "Quiet insights", text: "Spot trends and patterns across your sales history.", accent: "#6366F1" },
];

export default function Insights() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Insights" subtitle="Smart patterns drawn from your business memory." />

      <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/10 mb-4">
          <Sparkles className="h-7 w-7 text-[#6366F1]" />
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A]">Insights unlock as you record</h2>
        <p className="mt-1.5 max-w-md mx-auto text-sm text-[#64748B]">
          Once you have a few purchases and sales saved, DukaanIQ will turn them into clear, useful
          insights — with no spreadsheets required.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {COMING.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.accent}15` }}>
                <Icon className="h-5 w-5" style={{ color: c.accent }} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{c.title}</p>
                <p className="text-sm text-[#64748B]">{c.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}