import AmbientBackground from "@/src/components/AmbientBackground";
import Navbar from "@/src/components/sections/Navbar";
import Hero from "@/src/components/sections/Hero";
import About from "@/src/components/sections/About";
import Contributions from "@/src/components/sections/Contributions";
import Contact from "@/src/components/sections/Contact";
import { portfolioConfig } from "@/src/data/config";
import { useTranslation } from "react-i18next";
import SEO from "@/src/components/SEO";

export default function App() {
  const { t } = useTranslation();
  const { logo } = portfolioConfig.personal;

  return (
    <div className="relative min-h-screen w-full selection:bg-white/10 selection:text-white overflow-x-hidden text-zinc-100">
      {/* Dynamic language-sensitive SEO Controller */}
      <SEO />

      {/* 1. Underlying ambient layer & magnetic mouse follower */}
      <AmbientBackground />

      {/* 2. Top-level floating navigation bar */}
      <Navbar />

      {/* 3. Main content wrappers (stacked along the layout axis) */}
      <main className="relative z-20 w-full flex flex-col items-center">
        {/* Hero split section with 3D canvas */}
        <Hero />

        {/* Narrative bio and spec specs */}
        <About />

        {/* GitHub Contribution heatmap and developer consistency metrics */}
        <Contributions />

        {/* Message compiler & direct contacts */}
        <Contact />
      </main>

      {/* 4. Sleek minimalistic footer */}
      <footer className="relative z-10 w-full py-8 border-t border-white/[0.02] bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-white/5 border border-white/10 text-xs text-white font-mono">
              {logo}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Matheus Henrique &copy; {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex items-center gap-5 text-[10px] font-mono text-zinc-600">
            <span>{t("footer.built_with")}</span>
            <span className="hidden sm:inline">|</span>
            <span className="text-zinc-500 hover:text-white transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {t("footer.back_to_top")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
