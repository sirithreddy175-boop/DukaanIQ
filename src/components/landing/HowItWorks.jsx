import React from "react";
import { motion } from "framer-motion";
import { Camera, Database, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const STEP_ICONS = [Camera, Database, Search, Sparkles];
const STEP_ACCENTS = ["#3B82F6", "#6366F1", "#3B82F6", "#F59E0B"];

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold text-[#6366F1] uppercase tracking-wider">
            {t.how.title}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            {t.how.subtitle}
          </h2>
        </motion.div>

        <div className="relative mt-14 sm:mt-20">
          {/* Memory thread connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[44px] left-[12.5%] right-[12.5%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-full origin-left bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#F59E0B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {t.how.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const accent = STEP_ACCENTS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative group"
                >
                  <div className="relative h-full rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-[#0B2D5B]/5 hover:border-[#6366F1]/40 transition-all duration-300">
                    {/* Step number badge */}
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl mx-auto lg:mx-0 mb-5" style={{ backgroundColor: `${accent}15` }}>
                      <Icon className="h-7 w-7" style={{ color: accent }} strokeWidth={1.75} />
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <span className="text-xs font-bold tracking-wider" style={{ color: accent }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold text-[#0F172A]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#64748B] leading-relaxed text-center lg:text-left">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}