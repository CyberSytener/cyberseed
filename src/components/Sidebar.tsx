import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Brain, 
  Calendar, 
  Activity, 
  User, 
  Settings 
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: MessageSquare, label: "Chat", id: "chat" },
  { icon: Brain, label: "Memory", id: "memory" },
  { icon: Calendar, label: "Events", id: "events" },
  { icon: Activity, label: "Telemetry", id: "telemetry" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (itemId: string) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-64 border-r border-black/5 backdrop-blur-xl bg-white/40 flex flex-col relative z-10"
    >
      <div className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300
                ${isActive 
                  ? 'bg-white/80 border border-black/5 shadow-sm' 
                  : 'hover:bg-white/50 border border-transparent'
                }
              `}
            >
              <Icon 
                className={`w-4 h-4 transition-opacity ${isActive ? 'opacity-80' : 'opacity-40'}`} 
                strokeWidth={1.5} 
              />
              <span 
                className={`text-sm tracking-tight transition-opacity ${isActive ? 'opacity-90' : 'opacity-60'}`}
                style={{ fontWeight: isActive ? 500 : 400 }}
              >
                {item.label}
              </span>
              
              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute left-0 w-0.5 h-8 bg-gradient-to-b from-blue-400 via-purple-400 to-teal-400 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom section with breathing indicator */}
      <div className="px-4 pb-6">
        <div className="px-4 py-3 rounded-2xl border border-black/5 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-teal-500"
            />
            <span className="text-xs tracking-tight opacity-60">System Status</span>
          </div>
          <div className="text-xs tracking-tight opacity-40" style={{ fontWeight: 300 }}>
            All systems nominal
          </div>
        </div>
      </div>
    </motion.div>
  );
}