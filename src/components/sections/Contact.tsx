import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, Send, CheckCircle2, ArrowRight, Mail, Instagram, MessageSquare, Copy, Check } from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";
import { portfolioConfig } from "@/src/data/config";
import GlassCard from "@/src/components/ui/GlassCard";
import { useTranslation } from "react-i18next";

interface InnerContactFormProps {
  onReset: () => void;
  key?: number;
}

function InnerContactForm({ onReset }: InnerContactFormProps) {
  const { t } = useTranslation();
  const [state, handleSubmit] = useForm("mlgqerrn");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  
  // Anti-spam states
  const [honeypot, setHoneypot] = useState("");
  const [captchaQuestion] = useState(() => {
    const n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    return { num1: n1, num2: n2, answer: n1 + n2 };
  });
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [localSucceeded, setLocalSucceeded] = useState(false);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCaptchaError("");

    // 1. Honeypot check (Silent fail for bots to protect Formspree API limit)
    if (honeypot) {
      console.log("Honeypot caught submission.");
      setLocalSucceeded(true);
      return;
    }

    // 2. Captcha verification
    if (parseInt(userCaptcha, 10) !== captchaQuestion.answer) {
      setCaptchaError(t("contact.captcha_error"));
      return;
    }

    // 3. Prevent double-submission/spam clicking
    if (isLocalSubmitting || state.submitting) {
      return;
    }

    try {
      setIsLocalSubmitting(true);
      await handleSubmit(e);
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const isFormSuccess = state.succeeded || localSucceeded;
  const isPending = state.submitting || isLocalSubmitting;

  return (
    <GlassCard hoverGlow={false} className="p-6 h-full flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!isFormSuccess ? (
          <motion.form
            key="contact-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onFormSubmit}
            className="space-y-4"
          >
            {/* Error message banner */}
            {state.errors && (
              <div className="p-3 text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
                {t("contact.form_error")}
              </div>
            )}

            {/* Honeypot field (hidden from visual/accessible screen readers, but attractive to bots) */}
            <div className="absolute opacity-0 pointer-events-none -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">{t("contact.honeypot_label")}</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                {t("contact.name")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("contact.name_placeholder")}
                disabled={isPending}
                required
                className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-white placeholder-zinc-600 transition-all focus:border-white/20 focus:bg-white/[0.03] focus:outline-none disabled:opacity-50"
              />
              <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-400 text-[10px] font-mono mt-1" />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                {t("contact.email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("contact.email_placeholder")}
                disabled={isPending}
                required
                className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-white placeholder-zinc-600 transition-all focus:border-white/20 focus:bg-white/[0.03] focus:outline-none disabled:opacity-50"
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-400 text-[10px] font-mono mt-1" />
            </div>

            {/* Message Input */}
            <div className="space-y-1">
              <label htmlFor="message" className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                {t("contact.message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t("contact.message_placeholder")}
                disabled={isPending}
                required
                className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-white placeholder-zinc-600 transition-all focus:border-white/20 focus:bg-white/[0.03] focus:outline-none resize-none disabled:opacity-50"
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-400 text-[10px] font-mono mt-1" />
            </div>

            {/* Captcha Verification */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="captcha" className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex justify-between">
                <span>{t("contact.human_verification")}</span>
                <span className="text-zinc-600 font-normal">{t("contact.security_challenge")}</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.01] text-xs font-mono text-zinc-400 min-w-[90px] text-center select-none">
                  {captchaQuestion.num1} + {captchaQuestion.num2} =
                </div>
                <input
                  type="number"
                  id="captcha"
                  name="captcha"
                  value={userCaptcha}
                  onChange={(e) => {
                    setUserCaptcha(e.target.value);
                    if (captchaError) setCaptchaError("");
                  }}
                  placeholder="?"
                  disabled={isPending}
                  required
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-white placeholder-zinc-600 transition-all focus:border-white/20 focus:bg-white/[0.03] focus:outline-none disabled:opacity-50"
                />
              </div>
              {captchaError && (
                <p className="text-red-400 text-[10px] font-mono mt-1">{captchaError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full group flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-xs font-semibold text-black transition-all hover:bg-zinc-200 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-black" />
                  <span>{t("contact.dispatching")}</span>
                </>
              ) : (
                <>
                  <span>{t("contact.send_message")}</span>
                  <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-6 space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-white tracking-wide">
                {t("contact.success_title")}
              </h4>
              <p className="text-zinc-500 text-xs max-w-sm">
                {t("contact.success_desc")}
              </p>
            </div>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors duration-300"
            >
              {t("contact.send_another")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function Contact() {
  const { t } = useTranslation();
  const { github } = portfolioConfig.personal;
  const [formResetKey, setFormResetKey] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);

  const copyToClipboard = async (text: string, type: "email" | "discord") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedDiscord(true);
        setTimeout(() => setCopiedDiscord(false), 2000);
      }
      
      const id = Date.now();
      setToast({ message: type === "email" ? t("contact.toast_email") : t("contact.toast_discord"), id });
      setTimeout(() => {
        setToast((current) => current?.id === id ? null : current);
      }, 2500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <section id="contact" className="w-full py-16 px-4 relative z-10 pb-24 border-t border-white/[0.02]">
      <div className="mx-auto max-w-5xl">
        
        {/* Section Header */}
        <div className="mb-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            {t("contact.initiate")}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto md:mx-0">
            {t("contact.subtitle")}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Context Card & Connections */}
          <div className="md:col-span-5 flex flex-col justify-between gap-6">
            <GlassCard className="p-6 flex-1 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <h3 className="font-display text-sm font-bold text-white tracking-wide uppercase">
                  {t("contact.direct_line")}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {t("contact.direct_line_desc")}
                </p>
              </div>

              {/* Direct links list */}
              <div className="space-y-3.5">
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300"
                >
                  <Github className="h-4.5 w-4.5 text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-600">GITHUB</span>
                    <span className="font-mono">github.com/mxthevs</span>
                  </div>
                </a>

                <div
                  onClick={() => copyToClipboard("mxthevsdev@gmail.com", "email")}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4.5 w-4.5 text-zinc-500 group-hover:text-white transition-colors" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-500 transition-colors">EMAIL</span>
                      <span className="font-mono">mxthevsdev@gmail.com</span>
                    </div>
                  </div>
                  <div className="text-zinc-500 group-hover:text-white transition-colors p-1">
                    {copiedEmail ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </div>
                </div>

                <a
                  href="https://instagram.com/mxthevsh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300"
                >
                  <Instagram className="h-4.5 w-4.5 text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-600">INSTAGRAM</span>
                    <span className="font-mono">@mxthevsh</span>
                  </div>
                </a>

                <div
                  onClick={() => copyToClipboard("mxthevs", "discord")}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4.5 w-4.5 text-zinc-500 group-hover:text-white transition-colors" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-500 transition-colors">DISCORD</span>
                      <span className="font-mono">mxthevs</span>
                    </div>
                  </div>
                  <div className="text-zinc-500 group-hover:text-white transition-colors p-1">
                    {copiedDiscord ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-zinc-600">
                {t("contact.loc_brazil")}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-7">
            <InnerContactForm key={formResetKey} onReset={() => setFormResetKey(prev => prev + 1)} />
          </div>

        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0a0a0c]/90 border border-white/10 shadow-2xl backdrop-blur-md pointer-events-none"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-xs font-medium text-zinc-200 tracking-tight">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
