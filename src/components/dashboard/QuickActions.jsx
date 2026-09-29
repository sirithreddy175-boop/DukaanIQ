import React from "react";
import { Link } from "react-router-dom";
import { FileUp, ShoppingCart, Tag, Package } from "lucide-react";

const ACTIONS = [
  { label: "Upload Bill", to: "/app/purchases/new?mode=bill", icon: FileUp, accent: "#3B82F6" },
  { label: "Add Purchase", to: "/app/purchases/new", icon: ShoppingCart, accent: "#6366F1" },
  { label: "Add Sale", to: "/app/sales/new", icon: Tag, accent: "#F59E0B" },
  { label: "Add Product", to: "/app/products", icon: Package, accent: "#0B2D5B" },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            to={a.to}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#6366F1]/40 hover:-translate-y-0.5 transition-all"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${a.accent}15` }}
            >
              <Icon className="h-5 w-5" style={{ color: a.accent }} strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold text-[#0F172A]">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}