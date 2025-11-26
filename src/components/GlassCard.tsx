import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = "", delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`relative backdrop-blur-xl bg-white/70 rounded-3xl border border-black/[0.08] shadow-lg shadow-black/5 ${className}`}
      style={{
        backgroundImage: "linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
      }}
    >
      {children}
    </motion.div>
  );
}
