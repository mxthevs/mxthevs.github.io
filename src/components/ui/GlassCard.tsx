import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverGlow?: boolean;
  delay?: number;
  key?: string;
  animateEntrance?: boolean;
}

export default function GlassCard({
  children,
  className,
  onClick,
  hoverGlow = true,
  delay = 0,
  animateEntrance = true,
}: GlassCardProps) {
  if (!animateEntrance) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300",
          hoverGlow && "hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]",
          onClick && "cursor-pointer active:scale-[0.98]",
          className
        )}
      >
        {/* Decorative subtle border light glint */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay }}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300",
        hoverGlow && "hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {/* Decorative subtle border light glint */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {children}
    </motion.div>
  );
}
