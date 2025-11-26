import { motion } from "framer-motion";
import { Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import logo from "../assets/app-logo.png";

export function TopBar() {
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [soulOpen, setSoulOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-16 border-b border-black/5 backdrop-blur-xl bg-white/70 px-6 flex items-center justify-between relative z-20"
    >
      {/* Left: App Name */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-8 h-8 flex items-center justify-center"
        >
          <img src={logo} alt="Seed" className="w-full h-full object-contain" />
        </motion.div>
        <span className="tracking-tight opacity-90" style={{ fontWeight: 500 }}>
          Seed
        </span>
      </div>

      {/* Center: Selectors */}
      <div className="flex items-center gap-3">
        {/* Owner Selector */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOwnerOpen(!ownerOpen)}
            className="px-4 py-2 rounded-full border border-black/5 bg-white/50 backdrop-blur-sm flex items-center gap-2 hover:border-black/10 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-80" />
            <span className="text-sm tracking-tight opacity-70">Owner</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" strokeWidth={1.5} />
          </motion.button>
        </div>

        <div className="w-px h-4 bg-black/5" />

        {/* Soul Selector */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSoulOpen(!soulOpen)}
            className="px-4 py-2 rounded-full border border-black/5 bg-white/50 backdrop-blur-sm flex items-center gap-2 hover:border-black/10 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 opacity-80" />
            <span className="text-sm tracking-tight opacity-70">Soul Alpha</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" strokeWidth={1.5} />
          </motion.button>
        </div>

        <div className="w-px h-4 bg-black/5" />

        {/* Phase Badge */}
        <div className="px-4 py-2 rounded-full border border-black/5 bg-white/50 backdrop-blur-sm flex items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-teal-500"
          />
          <span className="text-sm tracking-tight opacity-70">Awakening</span>
        </div>
      </div>

      {/* Right: Settings */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-9 h-9 rounded-full border border-black/5 bg-white/50 backdrop-blur-sm flex items-center justify-center hover:border-black/10"
      >
        <Settings className="w-4 h-4 opacity-60" strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  );
}