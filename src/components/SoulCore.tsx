import { motion } from "framer-motion";

export function SoulCore() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer rings */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-64 h-64 rounded-full border border-purple-300/30"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute w-48 h-48 rounded-full border border-blue-300/40"
      />

      {/* Core orb */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4), rgba(74, 144, 226, 0.3), rgba(20, 184, 166, 0.2))",
          boxShadow: "0 0 60px rgba(139, 92, 246, 0.3), 0 0 100px rgba(74, 144, 226, 0.2)",
        }}
      >
        {/* Inner glow */}
        <motion.div
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent 70%)",
          }}
        />

        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
            }}
            className="absolute w-2 h-2 rounded-full bg-white/60"
            style={{
              top: "50%",
              left: "50%",
              marginTop: "-4px",
              marginLeft: "-4px",
              transformOrigin: `${30 * Math.cos((i * Math.PI) / 4)}px ${30 * Math.sin((i * Math.PI) / 4)}px`,
            }}
          />
        ))}
      </motion.div>

      {/* Rotating outer particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`outer-${i}`}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute"
          style={{
            width: 120 + i * 20,
            height: 120 + i * 20,
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
          />
        </motion.div>
      ))}
    </div>
  );
}
