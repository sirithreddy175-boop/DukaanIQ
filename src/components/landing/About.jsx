import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Store, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  const points = [
    {
      icon: Store,
      title: "Made for kirana & local shops",
      text: "Designed around the way small Indian retailers actually run their day.",
    },
    {
      icon: ShieldCheck,
      title: "Your data stays yours",
      text: "Business memory is private and persistent — built to serve you, not anyone else.",
    },
    {
      icon: HeartHandshake,
      title: "Simple to start",
      text: "No spreadsheets, no setup headaches. Capture once and let it remember.",
    },
  ];

  return (
    <section id="about" className="relative py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-[#0B2D5B]/10 px-3 py-1 text-xs font-semibold text-[#0B2D5B] uppercase tracking-wider">
              {t.nav.about}
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              {t.about.title}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#64748B] leading-relaxed">
              {t.about.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {points.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#6366F1]/30 transition-all duration-300"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/10">
                    <Icon className="h-5 w-5 text-[#6366F1]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#64748B] leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}