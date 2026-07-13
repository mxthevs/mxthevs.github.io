import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { portfolioConfig } from "@/src/data/config";
import { useTranslation } from "react-i18next";

const navLinks = [
  { key: "home", href: "#home" },
  { key: "about", href: "#about" },
  { key: "activity", href: "#activity" },
  { key: "contact", href: "#contact" },
];

const languages = [
  {
    code: "en",
    name: "English",
    native: "English",
    emoji: "🇬🇧",
  },
  {
    code: "pt",
    name: "Português",
    native: "Português",
    emoji: "🇧🇷",
  },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section highlights
      const scrollPosition = window.scrollY + 120;
      for (const link of navLinks) {
        const id = link.href.slice(1);
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.slice(1);
    const element = document.getElementById(id);
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
    <header className="fixed top-0 left-0 w-full z-50 px-4 py-4 md:py-6 transition-all duration-300">
      <div
        className={`mx-auto max-w-5xl rounded-full border border-white/5 bg-black/40 px-6 py-3 backdrop-blur-xl transition-all duration-500 ${
          scrolled
            ? "border-white/10 bg-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : ""
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick("#home");
            }}
            className="group flex items-center gap-2 text-xl font-display font-medium tracking-wider text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
              {portfolioConfig.personal.logo}
            </span>
            <span className="font-display text-sm tracking-widest uppercase text-zinc-400 group-hover:text-white transition-colors duration-300 hidden sm:inline">
              MATHEUS
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className={`relative px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-300 ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t(`navbar.${link.key}`)}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBackground"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.05] border border-white/[0.03]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Link - GitHub & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-300 hover:bg-white/5 hover:border-white/10 active:scale-95 cursor-pointer"
                aria-label="Select language"
              >
                <span>{languages.find(l => l.code === (i18n.language === "pt" ? "pt" : "en"))?.emoji}</span>
                <span className="text-zinc-300">{languages.find(l => l.code === (i18n.language === "pt" ? "pt" : "en"))?.native}</span>
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-300 ${langDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setLangDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-36 z-50 rounded-xl border border-white/10 bg-black/95 p-1.5 backdrop-blur-2xl shadow-2xl"
                    >
                      {languages.map((lang) => {
                        const isSelected = i18n.language === lang.code || (lang.code === "en" && !["en", "pt"].includes(i18n.language));
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              i18n.changeLanguage(lang.code);
                              setLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs rounded-lg transition-colors duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-white/10 text-white font-medium"
                                : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                            }`}
                          >
                            <span>{lang.emoji}</span>
                            <span>{lang.native}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <a
              href={portfolioConfig.personal.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-all duration-300 hover:bg-zinc-200"
            >
              GitHub
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-zinc-300 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-20 rounded-2xl border border-white/10 bg-black/95 p-6 backdrop-blur-2xl md:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeSection === id;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.href);
                    }}
                    className={`text-sm font-medium tracking-wide py-1 border-b border-white/5 ${
                      isActive ? "text-white font-semibold" : "text-zinc-400"
                    }`}
                  >
                    {t(`navbar.${link.key}`)}
                  </a>
                );
              })}

              {/* Language Selector for mobile */}
              <div className="flex items-center justify-between border-b border-white/5 py-2.5">
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  {t("common.language", "Language")}
                </span>
                <div className="flex items-center gap-2">
                  {languages.map((lang) => {
                    const isSelected = i18n.language === lang.code || (lang.code === "en" && !["en", "pt"].includes(i18n.language));
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-white border-white text-black font-semibold"
                            : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span>{lang.emoji}</span>
                        <span>{lang.native}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <a
                href={portfolioConfig.personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-xs font-semibold text-black transition-all"
              >
                {t("navbar.connect_github")}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
