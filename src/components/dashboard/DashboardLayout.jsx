import React, { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileTopbar from "./MobileTopbar";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const onAsk = useCallback(() => {
    navigate("/app");
    setTimeout(() => {
      const el = document.getElementById("ask-input");
      if (el) el.focus();
    }, 350);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="lg:pl-64">
        <MobileTopbar />
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10">
          <Outlet />
        </main>
        <MobileBottomNav onAsk={onAsk} />
      </div>
    </div>
  );
}