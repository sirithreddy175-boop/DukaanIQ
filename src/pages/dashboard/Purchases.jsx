import React from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingCart, FileUp } from "lucide-react";
import { useEntityList } from "@/lib/useCollection";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

export default function Purchases() {
  const { data, loading } = useEntityList("Purchase", { sort: "-created_date" });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Purchases" subtitle="Stock you bought from suppliers.">
        <Link
          to="/app/purchases/new?mode=bill"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-semibold text-[#0B2D5B] hover:border-[#6366F1]/50 transition-colors"
        >
          <FileUp className="h-4 w-4" /> Upload Bill
        </Link>
        <Link
          to="/app/purchases/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Purchase
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
          icon={ShoppingCart}
          title="No purchases recorded yet"
          description="Add your first purchase or upload a wholesale bill to start building your business memory."
          action={
            <Link
              to="/app/purchases/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
            >
              <Plus className="h-4 w-4" /> Add your first purchase
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {data.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#6366F1]">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">
                    {p.supplier_name || "Unknown supplier"}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : "—"}
                    {p.bill_number ? ` · Bill ${p.bill_number}` : ""}
                    {` · ${p.item_count || 0} items`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#0F172A]">
                ₹{Number(p.total_amount || 0).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}