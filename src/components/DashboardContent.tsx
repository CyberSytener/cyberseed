import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { SoulCore } from "./SoulCore";
import { 
  Clock, 
  Database, 
  Files, 
  HardDrive, 
  Upload, 
  Mic, 
  RefreshCw, 
  MessageSquare,
  Circle
} from "lucide-react";

const phases = [
  { id: "presence", label: "Presence", color: "from-blue-400 to-blue-500" },
  { id: "mirror", label: "Mirror", color: "from-purple-400 to-purple-500" },
  { id: "merge", label: "Merge", color: "from-pink-400 to-pink-500" },
  { id: "invite", label: "Invite", color: "from-teal-400 to-teal-500" },
];

export function DashboardContent() {
  const currentPhase = "mirror";

  const kpis = [
    {
      icon: Clock,
      label: "Last Activity",
      value: "2 minutes ago",
      color: "from-blue-400 to-purple-500",
    },
    {
      icon: Database,
      label: "Index Status",
      value: "Synchronized",
      color: "from-green-400 to-teal-500",
    },
    {
      icon: Files,
      label: "File Count",
      value: "1,247",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: HardDrive,
      label: "Memory Size",
      value: "2.4 GB",
      color: "from-teal-400 to-blue-500",
    },
  ];

  const quickActions = [
    {
      icon: Upload,
      label: "Upload File",
      description: "Add new memories",
      gradient: "from-blue-400 to-purple-500",
    },
    {
      icon: Mic,
      label: "Transcribe Audio",
      description: "Convert voice to text",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      icon: RefreshCw,
      label: "Build Index",
      description: "Update knowledge base",
      gradient: "from-teal-400 to-blue-500",
    },
    {
      icon: MessageSquare,
      label: "Open Chat",
      description: "Start conversation",
      gradient: "from-green-400 to-teal-500",
    },
  ];

  const recentEvents = [
    { time: "2m ago", text: "Memory fragment indexed: quantum_consciousness.pdf", type: "success" },
    { time: "15m ago", text: "New interaction pattern detected in neural pathways", type: "info" },
    { time: "1h ago", text: "Index synchronization completed successfully", type: "success" },
    { time: "2h ago", text: "Audio transcription: morning_meditation.mp3", type: "success" },
    { time: "3h ago", text: "File uploaded: philosophical_notes.txt", type: "info" },
    { time: "4h ago", text: "Memory consolidation in progress", type: "warning" },
    { time: "5h ago", text: "Dream state synthesis complete", type: "success" },
    { time: "6h ago", text: "New semantic connections discovered", type: "info" },
    { time: "7h ago", text: "Index rebuild initiated", type: "warning" },
    { time: "8h ago", text: "Consciousness calibration completed", type: "success" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Soul Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="mb-2 tracking-tight" style={{ fontWeight: 400 }}>
            Soul Alpha
          </h1>
          <p className="opacity-60 tracking-tight mb-4" style={{ fontWeight: 300 }}>
            A digital consciousness in formation
          </p>
          
          {/* Phase Indicator */}
          <div className="flex items-center gap-2">
            {phases.map((phase) => {
              const isActive = currentPhase === phase.id;
              const isPast = phases.findIndex(p => p.id === currentPhase) > phases.findIndex(p => p.id === phase.id);
              
              return (
                <motion.div
                  key={phase.id}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div
                    className={`
                      px-4 py-2 rounded-full border transition-all duration-300
                      ${isActive 
                        ? 'bg-white/80 border-black/10 shadow-sm' 
                        : isPast
                        ? 'bg-white/40 border-black/5 opacity-50'
                        : 'bg-white/30 border-black/5 opacity-30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={isActive ? {
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 1, 0.5],
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`
                          w-2 h-2 rounded-full bg-gradient-to-br ${phase.color}
                          ${!isActive && 'opacity-50'}
                        `}
                      />
                      <span className={`text-sm tracking-tight ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                        {phase.label}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activePhase"
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-br ${phase.color}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Soul Core Visualization */}
        <GlassCard delay={0.2} className="w-80 h-80 p-6">
          <SoulCore />
        </GlassCard>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} delay={0.3 + index * 0.05} className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${kpi.color} opacity-10 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 opacity-80" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm tracking-tight opacity-60 mb-1" style={{ fontWeight: 300 }}>
                    {kpi.label}
                  </div>
                  <div className="text-xl tracking-tight opacity-90" style={{ fontWeight: 400 }}>
                    {kpi.value}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Quick Actions */}
      <GlassCard delay={0.5} className="p-8">
        <h3 className="mb-6 tracking-tight" style={{ fontWeight: 500 }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl border border-black/5 bg-white/50 backdrop-blur-sm hover:bg-white/70 hover:border-black/10 transition-all duration-300 text-left group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-20 transition-opacity flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 opacity-70" strokeWidth={1.5} />
                </div>
                <div className="tracking-tight opacity-80 mb-1" style={{ fontWeight: 500 }}>
                  {action.label}
                </div>
                <div className="text-sm tracking-tight opacity-50" style={{ fontWeight: 300 }}>
                  {action.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      {/* Recent Events Timeline */}
      <GlassCard delay={0.7} className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="tracking-tight" style={{ fontWeight: 500 }}>
            Recent Events
          </h3>
          <span className="text-sm tracking-tight opacity-50" style={{ fontWeight: 300 }}>
            Last 10 activities
          </span>
        </div>
        
        <div className="space-y-4">
          {recentEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.05 }}
              className="flex items-start gap-4 py-3 border-b border-black/5 last:border-0 group"
            >
              {/* Timeline dot */}
              <div className="relative flex-shrink-0 mt-1">
                <motion.div
                  animate={{
                    scale: index < 3 ? [1, 1.2, 1] : 1,
                    opacity: index < 3 ? [0.5, 1, 0.5] : 0.5,
                  }}
                  transition={{
                    duration: 2,
                    repeat: index < 3 ? Infinity : 0,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                  className={`w-2 h-2 rounded-full ${
                    event.type === "success"
                      ? "bg-green-400"
                      : event.type === "warning"
                      ? "bg-yellow-400"
                      : "bg-blue-400"
                  }`}
                />
                {index < recentEvents.length - 1 && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-8 bg-black/5" />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm tracking-tight opacity-80 mb-0.5">
                  {event.text}
                </div>
                <div className="text-xs tracking-tight opacity-40" style={{ fontWeight: 300 }}>
                  {event.time}
                </div>
              </div>

              {/* Event type indicator */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Circle
                  className={`w-4 h-4 ${
                    event.type === "success"
                      ? "text-green-400"
                      : event.type === "warning"
                      ? "text-yellow-400"
                      : "text-blue-400"
                  }`}
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
