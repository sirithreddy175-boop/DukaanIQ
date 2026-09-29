import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { LogoMark } from "@/components/Logo";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B2D5B] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2" aria-label="DukaanIQ home">
            <LogoMark className="h-8 w-8" />
            <span className="font-bold text-lg tracking-tight text-white">
              Dukaan<span className="text-[#A5B4FC]">IQ</span>
            </span>
          </Link>

          <p className="text-sm text-white/60 text-center">
            {t.footer.tagline}
          </p>

          <nav className="flex items-center gap-5 text-sm text-white/70">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              {t.nav.features}
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              {t.nav.about}
            </a>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {year} DukaanIQ. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}