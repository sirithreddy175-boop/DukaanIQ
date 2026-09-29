import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Tag, Truck, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useEntityList } from "@/lib/useCollection";
import AskBar from "@/components/dashboard/AskBar";
import QuickActions from "@/components/dashboard/QuickActions";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";

export default function DashboardHome() {
  const { user } = useAuth();
  const products = useEntityList("Product", { sort: "-created_date" });
  const purchases = useEntityList("Purchase", { sort: "-created_date" });
  const sales = useEntityList("Sale", { sort: "-created_date" });
  const suppliers = useEntityList("Supplier", { sort: "-created_date" });

  const productCount = products.data?.length ?? 0;
  const purchaseCount = purchases.data?.length ?? 0;
  const saleCount = sales.data?.length ?? 0;
  const supplierCount = suppliers.data?.length ?? 0;

  const recent = useMemo(() => {
    const p = (purchases.data || []).map((x) => ({ ...x, _kind: "purchase" }));
    const s = (sales.data || []).map((x) => ({ ...x, _kind: "sale" }));
    return [...p, ...s]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchases.data, sales.data]);

  const firstName = (user?.full_name || user?.email || "Shopkeeper").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <p className="text-sm text-[#64748B]">{greeting},</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
          {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Tell your business assistant what happened today. It only takes a moment.
        </p>
      </div>

      <AskBar />

      <section>
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Quick actions</h2>
        <QuickActions />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Your business at a glance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Products" value={productCount} icon={Package} accent="#3B82F6" />
          <StatCard label="Purchases" value={purchaseCount} icon={ShoppingCart} accent="#6366F1" />
          <StatCard label="Sales" value={saleCount} icon={Tag} accent="#F59E0B" />
          <StatCard label="Suppliers" value={supplierCount} icon={Truck} accent="#0B2D5B" />
        </div>
        <p className="mt-2 text-xs text-[#94A3B8]">
          These are real counts from your records. No data yet? Use the quick actions above to add your first entry.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Recent activity</h2>
          <Link to="/app/purchases" className="text-xs font-medium text-[#3B82F6] hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No activity yet"
            description="Once you record a purchase or sale, it will show up here. Start by adding your first purchase."
            action={
              <Link
                to="/app/purchases/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
              >
                Add a purchase <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      item._kind === "purchase" ? "bg-[#6366F1]/10 text-[#6366F1]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    {item._kind === "purchase" ? <ShoppingCart className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0F172A]">
                      {item._kind === "purchase"
                        ? `Purchase — ${item.supplier_name || "Supplier"}`
                        : `Sale — ${item.customer_name || "Walk-in"}`}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(item.created_date).toLocaleDateString()} · {item.item_count || 0} items
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">
                  ₹{Number(item.total_amount || 0).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}