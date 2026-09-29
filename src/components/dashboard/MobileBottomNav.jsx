import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MOBILE_NAV, NAV_ITEMS } from "./navItems";

export default function MobileBottomNav({ onAsk }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItem = (item) => {
    if (item.action === "ask") {
      onAsk?.();
      return;
    }
    if (item.action === "more") {
      setMoreOpen(true);
      return;
    }
    if (item.action === "add") {
      setAddOpen(true);
      return;
    }
    if (item.to) navigate(item.to);
  };

  const addOptions = [
    { label: "Upload Bill", to: "/app/purchases/new?mode=bill", icon: "🧾" },
    { label: "Add Purchase", to: "/app/purchases/new", icon: "🛒" },
    { label: "Add Sale", to: "/app/sales/new", icon: "💰" },
    { label: "Add Product", to: "/app/products", icon: "📦" },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-center h-16">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.to &&
              (item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to));
            if (item.center) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleItem(item)}
                  className="flex justify-center"
                >
                  <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0B2D5B] to-[#6366F1] text-white shadow-lg shadow-[#0B2D5B]/30">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                </button>
              );
            }
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleItem(item)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  active ? "text-[#0B2D5B]" : "text-[#64748B]"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add sheet */}
      <AnimatePresence>
        {addOpen && (
          <BottomSheet title="Add to your shop" onClose={() => setAddOpen(false)}>
            <div className="grid grid-cols-2 gap-3">
              {addOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    navigate(opt.to);
                  }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-4 text-center hover:border-[#6366F1]/50 hover:shadow-md transition-all"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-sm font-medium text-[#0F172A]">{opt.label}</span>
                </button>
              ))}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* More sheet */}
      <AnimatePresence>
        {moreOpen && (
          <BottomSheet title="All sections" onClose={() => setMoreOpen(false)}>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#0B2D5B] text-white"
                          : "text-[#0F172A] hover:bg-[#F8FAFC]"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </>
  );
}

function BottomSheet({ title, onClose, children }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-[#0B2D5B]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 inset-x-0 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}