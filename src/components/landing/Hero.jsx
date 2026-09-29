const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const HERO_IMAGE =
  "https://media.db.com/images/public/6ab955a9f9ec0f8217935c0f/1d82227cc_generated_e218dd59.jpg";

export default function Hero() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        {/* Navy overlay + blur treatment for readability */}
        <div className="absolute inset-0 bg-[#0B2D5B]/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2D5B]/40 via-[#0B2D5B]/50 to-[#0B2D5B]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          AI-powered business memory for local shops
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18, scale: 1.05 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="font-bold tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.1]"
        >
          <span className="bg-gradient-to-r from-white via-white to-[#A5B4FC] bg-clip-text text-transparent">
            {t.hero.tagline}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="mt-6 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto"
        >
          {t.hero.supporting}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0B2D5B] px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-black/30 hover:bg-[#3B82F6] hover:shadow-[#3B82F6]/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            {t.hero.primaryCta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo("#how-it-works")}
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          >
            <Play className="h-4 w-4 fill-white" />
            {t.hero.secondaryCta}
          </button>
        </motion.div>
      </div>

      {/* Bottom fade into page background */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#F8FAFC] z-10" />
    </section>
  );
}