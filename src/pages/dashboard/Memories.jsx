import React from "react";
import { Brain } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";

export default function Memories() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Memories" subtitle="The persistent memory of your business." />

      <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/10 mb-4">
          <Brain className="h-7 w-7 text-[#6366F1]" />
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A]">Your business memory is being built</h2>
        <p className="mt-1.5 max-w-md mx-auto text-sm text-[#64748B]">
          Every purchase, sale and note you record becomes a memory. In Part 3, the AI memory system
          will connect here so you can ask your business anything — and it will remember.
        </p>
      </div>
    </div>
  );
}