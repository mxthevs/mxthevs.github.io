import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  // Smooth mouse coordinates tracking using Framer Motion Springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create spring curves for delay (magnetic/elastic effect)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 25, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25, mass: 0.5 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half the width of the glow cursor (150px) to center it
      mouseX.set(e.clientX - 150);
      mouseY.set(e.clientY - 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-bg">
      {/* 1. Low-opacity grid system overlay */}
      <div className="absolute inset-0 w-full h-full glow-grid opacity-60" />

      {/* 2. Soft, slow pulsing organic ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-900/10 glow-blob pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-800/10 glow-blob pointer-events-none" />

      {/* 3. Real-time Cursor Glow Follower */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-white/3 to-zinc-500/3 blur-[80px] pointer-events-none select-none mix-blend-screen hidden md:block"
        style={{
          left: springX,
          top: springY,
        }}
      />

      {/* 4. Film Grain / Noise Overlay for a tactical premium finish */}
      <div className="absolute inset-0 w-full h-full noise-overlay pointer-events-none z-10" />
    </div>
  );
}
