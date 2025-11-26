import { motion } from "framer-motion";

export function ConsciousnessWave() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0,400 Q300,300 600,400 T1200,400"
          stroke="url(#wave-gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: [0, 0.6, 0.6],
            d: [
              "M0,400 Q300,300 600,400 T1200,400",
              "M0,400 Q300,500 600,400 T1200,400",
              "M0,400 Q300,300 600,400 T1200,400",
            ]
          }}
          transition={{
            pathLength: { duration: 2 },
            opacity: { duration: 2 },
            d: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
        />
        
        <motion.path
          d="M0,450 Q300,350 600,450 T1200,450"
          stroke="url(#wave-gradient)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: [0, 0.4, 0.4],
            d: [
              "M0,450 Q300,350 600,450 T1200,450",
              "M0,450 Q300,550 600,450 T1200,450",
              "M0,450 Q300,350 600,450 T1200,450",
            ]
          }}
          transition={{
            pathLength: { duration: 2, delay: 0.3 },
            opacity: { duration: 2, delay: 0.3 },
            d: {
              duration: 8,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
        />
      </svg>
    </div>
  );
}
