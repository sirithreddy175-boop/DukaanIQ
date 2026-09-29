import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="get-started" className="relative py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2D5B] via-[#1E3A6F] to-[#6366F1] px-6 py-14 sm:px-12 sm:py-20 text-center shadow-2xl shadow-[#0B2D5B]/30"
        >
          {/* decorative glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#F59E0B]/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#3B82F6]/30 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t.cta.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {t.cta.subtitle}
            </p>
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="group mt-9 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-[#0B2D5B] shadow-xl hover:bg-[#F59E0B] hover:text-white hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.cta.button}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}