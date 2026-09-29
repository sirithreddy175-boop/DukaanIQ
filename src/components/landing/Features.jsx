import React from "react";
import { motion } from "framer-motion";
import { Database, MessageSquareText, Lightbulb } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const FEATURE_ICONS = [Database, MessageSquareText, Lightbulb];
const FEATURE_ACCENTS = ["#3B82F6", "#6366F1", "#F59E0B"];

export default function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="relative py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            {t.features.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.features.cards.map((card, i) => {
            const Icon = FEATURE_ICONS[i];
            const accent = FEATURE_ACCENTS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-7 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-[#0B2D5B]/8 hover:border-[#6366F1]/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-6 transition-transform duration-300 group-hover:-rotate-[5deg]"
                  style={{ backgroundColor: `${accent}15` }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: accent }}
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
                  {card.title}
                </h3>
                <p className="text-[#64748B] leading-relaxed">
                  {card.description}
                </p>
                {/* accent bar */}
                <div
                  className="mt-6 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-20"
                  style={{ backgroundColor: accent }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}