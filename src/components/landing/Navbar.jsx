import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import Logo from "@/components/Logo";

const NAV_LINKS = [
  { key: "howItWorks", href: "#how-it-works" },
  { key: "features", href: "#features" },
  { key: "about", href: "#about" },
];

function LanguageSwitcher({ tone }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const text = tone === "light" ? "text-white/90" : "text-[#0F172A]";
  const hover = tone === "light" ? "hover:bg-white/10" : "hover:bg-[#F8FAFC]";

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${text} ${hover}`}
        aria-label="Change language"
      >
        <Globe className={`h-4 w-4 ${tone === "light" ? "text-white/70" : "text-[#64748B]"}`} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""} ${tone === "light" ? "text-white/70" : "text-[#64748B]"}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xl shadow-[#0B2D5B]/10 z-50"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                  l.code === lang ? "text-[#6366F1] bg-[#6366F1]/5 font-semibold" : "text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <span>{l.label}</span>
                {l.code === lang && <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tone = scrolled ? "dark" : "light";
  const linkText = scrolled ? "text-[#0F172A]/80 hover:text-[#0B2D5B]" : "text-white/85 hover:text-white";
  const linkUnderline = scrolled ? "bg-[#0B2D5B]" : "bg-white";

  const handleNav = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm shadow-[#0B2D5B]/5" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" aria-label="DukaanIQ home">
            <Logo tone={tone} markClass="h-8 w-8" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                type="button"
                onClick={() => handleNav(link.href)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors group ${linkText}`}
              >
                {t.nav[link.key]}
                <span className={`absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${linkUnderline}`} />
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher tone={tone} />
            <button
              type="button"
              onClick={() => navigate("/app")}
              className={`hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                scrolled
                  ? "bg-[#0B2D5B] text-white shadow-md shadow-[#0B2D5B]/20 hover:bg-[#3B82F6] hover:shadow-[#3B82F6]/25"
                  : "bg-white text-[#0B2D5B] shadow-md shadow-black/20 hover:bg-[#F59E0B] hover:text-white"
              }`}
            >
              {t.nav.getStarted}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={`md:hidden inline-flex items-center justify-center rounded-lg p-2 transition-colors ${tone === "light" ? "text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-[#F8FAFC]"}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => handleNav(link.href)}
                  className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  {t.nav[link.key]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setMobileOpen(false); navigate("/app"); }}
                className="block w-full text-left rounded-lg bg-[#0B2D5B] px-3 py-2.5 text-sm font-semibold text-white"
              >
                {t.nav.getStarted}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}