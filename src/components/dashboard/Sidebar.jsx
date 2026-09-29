import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { LogoFull } from "@/components/Logo";
import { NAV_ITEMS } from "./navItems";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(false);
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-[#E2E8F0] bg-white">
      <div className="flex items-center justify-center h-16 border-b border-[#E2E8F0] px-4">
        <LogoFull className="h-11 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#0B2D5B] text-white shadow-sm shadow-[#0B2D5B]/20"
                        : "text-[#0F172A]/75 hover:bg-[#F8FAFC] hover:text-[#0B2D5B]"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#E2E8F0] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-white text-sm font-semibold">
            {(user?.full_name || user?.email || "S").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#0F172A]">
              {user?.full_name || "Shopkeeper"}
            </p>
            <p className="truncate text-xs text-[#64748B]">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2D5B] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export { ChevronRight };