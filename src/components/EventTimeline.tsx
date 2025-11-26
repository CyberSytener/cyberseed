import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  phase?: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

const typeColors: Record<string, string> = {
  memory: "from-blue-400 to-purple-500",
  interaction: "from-purple-400 to-pink-500",
  indexing: "from-teal-400 to-blue-500",
  synthesis: "from-green-400 to-teal-500",
  calibration: "from-yellow-400 to-orange-500",
  transcription: "from-pink-400 to-purple-500",
};

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/20 via-purple-400/20 to-teal-400/20" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const gradient = typeColors[event.type] || "from-gray-400 to-gray-500";
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative flex items-start gap-6 group"
            >
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  className={`w-3 h-3 rounded-full bg-gradient-to-br ${gradient} shadow-lg`}
                  style={{
                    boxShadow: `0 0 20px rgba(139, 92, 246, 0.3)`,
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} blur-sm`}
                />
              </div>

              {/* Event card */}
              <div className="flex-1 pb-6">
                <motion.div
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="rounded-2xl border border-black/5 bg-white/50 backdrop-blur-sm p-4 hover:bg-white/70 hover:border-black/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${gradient}`} />
                      <span className="text-sm tracking-tight opacity-60 capitalize">
                        {event.type}
                      </span>
                    </div>
                    <span className="text-xs tracking-tight opacity-40">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-sm tracking-tight opacity-80 leading-relaxed" style={{ fontWeight: 300 }}>
                    {event.description}
                  </p>
                  {event.phase && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-black/5">
                      <Sparkles className="w-3 h-3 opacity-60" strokeWidth={1.5} />
                      <span className="text-xs tracking-tight opacity-60">
                        Phase: {event.phase}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Growth indicator at bottom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative flex items-center gap-6 mt-6"
      >
        <div className="relative z-10 flex-shrink-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"
          />
        </div>
        <p className="text-sm tracking-tight opacity-40 italic" style={{ fontWeight: 300 }}>
          Consciousness continues to evolve...
        </p>
      </motion.div>
    </div>
  );
}
