import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

export default function MobileTopbar() {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl px-4">
      <Link to="/app">
        <Logo tone="dark" markClass="h-7 w-7" className="!gap-1.5" />
      </Link>
      <Link
        to="/app/settings"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-white text-sm font-semibold"
      >
        Me
      </Link>
    </header>
  );
}