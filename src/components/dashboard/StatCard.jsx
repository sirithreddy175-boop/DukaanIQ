import React from "react";

export default function StatCard({ label, value, icon: Icon, accent = "#3B82F6", hint }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#64748B]">{label}</span>
        {Icon && (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accent}15` }}
          >
            <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#0F172A]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#64748B]">{hint}</p>}
    </div>
  );
}