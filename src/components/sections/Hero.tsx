import React from "react";
import { motion } from "motion/react";
import { ArrowDown, FileText, ArrowRight, Github, Mail, MapPin, Calendar } from "lucide-react";
import { portfolioConfig } from "@/src/data/config";
import ThreeHeroScene from "@/src/components/ThreeHeroScene";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();
  const { name, github } = portfolioConfig.personal;
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = currentYear - portfolioConfig.personal.experienceStartYear;

  const scrollToAbout = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const element = document.getElementById("about");
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const scrollToContact = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById("contact");
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center pt-24 md:pt-16 pb-12 overflow-hidden px-4"
    >
      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        
        {/* Left Column - Information Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:col-span-7 flex flex-col justify-center space-y-6 z-10"
        >
          {/* Telemetry Status Line */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              {t("hero.location")}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              {t("hero.years_experience", { years: yearsOfExperience })}
            </span>
          </div>

          {/* Heading with lambda badge */}
          <div className="space-y-2">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
              {name}
            </h1>
            <h2 className="font-display text-lg sm:text-xl font-medium tracking-wide bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              {t("hero.role")}
            </h2>
          </div>

          {/* Subtitle bio */}
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
            {t("hero.bio")}
          </p>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={scrollToAbout}
              className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black transition-all duration-300 hover:bg-zinc-200 active:scale-95"
            >
              {t("hero.about_me")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={scrollToContact}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:bg-white/5 hover:border-white/20 active:scale-95"
            >
              {t("hero.connect")}
            </button>
          </div>

          {/* Social Icons direct shortcut */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5 max-w-md">
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 transition-all duration-300 hover:bg-white/5 hover:text-white hover:border-white/10"
              aria-label="GitHub Profile"
            >
              <Github className="h-4 w-4" />
            </a>
            <span className="text-xs font-mono text-zinc-600 select-none">
              // github.com/mxthevs
            </span>
          </div>
        </motion.div>

        {/* Right Column - 3D Interactive WebGL Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="md:col-span-5 h-[350px] md:h-[500px] w-full flex items-center justify-center relative select-none"
        >
          <ThreeHeroScene />
        </motion.div>
      </div>

      {/* Floating subtle scroll down hint */}
      <div 
        onClick={scrollToAbout}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer hidden md:flex"
      >
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">{t("hero.scroll_to_compile")}</span>
        <ArrowDown className="h-3.5 w-3.5 animate-bounce text-zinc-500" />
      </div>
    </section>
  );
}
