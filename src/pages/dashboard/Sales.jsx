import React from "react";
import { Link } from "react-router-dom";
import { Plus, Tag, User } from "lucide-react";
import { useEntityList } from "@/lib/useCollection";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

export default function Sales() {
  const { data, loading } = useEntityList("Sale", { sort: "-created_date" });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Sales" subtitle="What you sold to customers.">
        <Link
          to="/app/sales/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Sale
        </Link>
      </PageHeader>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No sales recorded yet"
          description="Record your first sale to start tracking what's moving in your shop."
          action={
            <Link
              to="/app/sales/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
            >
              <Plus className="h-4 w-4" /> Record a sale
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {data.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                  <Tag className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {s.customer_name || "Walk-in customer"}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {s.sale_date ? new Date(s.sale_date).toLocaleDateString() : "—"}
                    {` · ${s.item_count || 0} items`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#0F172A]">
                ₹{Number(s.total_amount || 0).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}