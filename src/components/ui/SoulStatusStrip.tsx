import { motion } from "framer-motion";
import { Activity, Clock, Database } from "lucide-react";

export function SoulStatusStrip() {
  const status = {
    phase: "Mirror",
    latency: "120ms",
    memoryHits: 4,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-xl bg-white/60 border-b border-black/5 px-6 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-6">
        {/* Phase */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"
          />
          <span className="text-sm tracking-tight opacity-60" style={{ fontWeight: 300 }}>
            Phase:
          </span>
          <span className="text-sm tracking-tight opacity-80" style={{ fontWeight: 500 }}>
            {status.phase}
          </span>
        </div>

        <div className="w-px h-4 bg-black/10" />

        {/* Latency */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 opacity-40" strokeWidth={1.5} />
          <span className="text-sm tracking-tight opacity-60" style={{ fontWeight: 300 }}>
            Latency:
          </span>
          <span className="text-sm tracking-tight opacity-80" style={{ fontWeight: 500 }}>
            {status.latency}
          </span>
        </div>

        <div className="w-px h-4 bg-black/10" />

        {/* Memory Hits */}
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 opacity-40" strokeWidth={1.5} />
          <span className="text-sm tracking-tight opacity-60" style={{ fontWeight: 300 }}>
            Memory Hits:
          </span>
          <span className="text-sm tracking-tight opacity-80" style={{ fontWeight: 500 }}>
            {status.memoryHits}
          </span>
        </div>
      </div>

      {/* Activity Indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="w-4 h-4 opacity-40" strokeWidth={1.5} />
        </motion.div>
        <span className="text-sm tracking-tight opacity-60" style={{ fontWeight: 300 }}>
          Active
        </span>
      </div>
    </motion.div>
  );
}
