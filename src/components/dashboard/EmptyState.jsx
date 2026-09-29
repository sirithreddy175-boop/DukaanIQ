import React from "react";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-12">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/10 mb-4">
          <Icon className="h-7 w-7 text-[#6366F1]" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[#64748B] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}