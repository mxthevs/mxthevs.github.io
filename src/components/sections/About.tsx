import { motion } from "motion/react";
import { Terminal, Award, Eye, Code2 } from "lucide-react";
import { portfolioConfig } from "@/src/data/config";
import GlassCard from "@/src/components/ui/GlassCard";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  const { interests, favoriteLanguages } = portfolioConfig.personal;
  
  const currentYear = new Date().getFullYear();
  const experienceYears = currentYear - portfolioConfig.personal.experienceStartYear;

  return (
    <section id="about" className="w-full py-16 px-4 relative z-10">
      <div className="mx-auto max-w-5xl">
        
        {/* Section Header */}
        <div className="mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            {t("about.core_identity")}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t("about.title")}
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-lg">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Extensive Narrative Bio */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 space-y-6"
          >
            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
              <h3 className="font-display text-base font-semibold text-white tracking-wide">
                {t("about.tagline")}
              </h3>
              
              <p>{t("about.detailedBio")}</p>
              
              <p>
                {t("about.bio_p2")}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-600 uppercase">{t("about.location")}</span>
                <p className="text-xs text-white font-medium flex items-center gap-1.5">
                  {t("hero.location")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-600 uppercase">{t("about.focus_area")}</span>
                <p className="text-xs text-white font-medium">{t("about.focus_value")}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Structured Quick Specs cards */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Interests & Practices */}
            <GlassCard delay={0.1} className="p-5 flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-zinc-400" />
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">{t("about.focus_interests")}</h4>
              </div>
              <ul className="space-y-2">
                {interests.map((interest) => (
                  <li key={interest} className="flex items-center justify-between text-xs border-b border-white/[0.03] pb-1.5 last:border-0 last:pb-0">
                    <span className="text-zinc-400">{t(`about.interests.${interest.toLowerCase().replaceAll(" ", "_")}`, interest)}</span>
                    <span className="text-[9px] font-mono text-zinc-600">// active</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Preferred Language Systems */}
            <GlassCard delay={0.2} className="p-5 flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-zinc-400" />
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">{t("about.favorite_languages")}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {favoriteLanguages.map((lang) => (
                  <div
                    key={lang}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white font-mono"
                  >
                    <span className="h-1 w-1 rounded-full bg-zinc-400" />
                    {lang}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {t("about.favorite_languages_desc")}
              </p>
            </GlassCard>

            {/* Terminal Quick Telemetry info card */}
             {/*<GlassCard delay={0.3} className="p-4 bg-black/60 font-mono text-[10px] text-zinc-500 space-y-2 border border-zinc-900/60">
            //   <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
            //     <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            //     <span className="text-zinc-300">summon_kraken.sh</span>
            //   </div>
            //   <div className="space-y-1">
            //     <p><span className="text-zinc-600">LOC:</span> {location}</p>
            //     <p><span className="text-zinc-600">EXP:</span> since_{experienceStartYear}</p>
            //     <p><span className="text-zinc-600">SHELL:</span> zsh/tmux</p>
            //     <p><span className="text-zinc-600">ENV:</span> production_ready</p>
            //   </div>
            // </GlassCard>*/}

          </div>

        </div>
      </div>
    </section>
  );
}
