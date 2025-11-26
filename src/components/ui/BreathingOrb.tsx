import { motion } from "framer-motion";

interface BreathingOrbProps {
  color?: string;
  size?: number;
  className?: string;
}

export function BreathingOrb({ 
  color = "#4A90E2", 
  size = 200,
  className = "" 
}: BreathingOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}40 0%, ${color}10 50%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
