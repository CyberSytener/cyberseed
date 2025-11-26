import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "soul";
  content: string;
  timestamp: string;
  index: number;
  contextSnippets?: string[];
}

export function ChatMessage({ type, content, timestamp, index, contextSnippets }: ChatMessageProps) {
  const isSoul = type === "soul";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`flex ${isSoul ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`max-w-2xl ${isSoul ? 'mr-auto' : 'ml-auto'}`}>
        {/* Message bubble */}
        <div
          className={`
            rounded-3xl p-6 backdrop-blur-xl relative
            ${isSoul 
              ? 'bg-white/70 border border-black/5 shadow-lg shadow-purple-500/5' 
              : 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
            }
          `}
        >
          {/* Soul glow effect */}
          {isSoul && (
            <>
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-teal-400/10 blur-xl"
              />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <Sparkles className="w-4 h-4 opacity-60" strokeWidth={1.5} />
                <span className="text-sm tracking-tight opacity-60" style={{ fontWeight: 500 }}>
                  Soul Alpha
                </span>
              </div>
            </>
          )}

          {/* Message content */}
          <div className="relative z-10">
            <p className={`tracking-tight leading-relaxed ${isSoul ? 'opacity-80' : ''}`} style={{ fontWeight: 300 }}>
              {content}
            </p>
          </div>

          {/* Context snippets indicator */}
          {isSoul && contextSnippets && contextSnippets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-4 pt-4 border-t border-black/5 relative z-10"
            >
              <div className="flex items-center gap-2 text-xs tracking-tight opacity-50 mb-2">
                <div className="w-1 h-1 rounded-full bg-purple-400" />
                <span>{contextSnippets.length} memory fragments retrieved</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`mt-2 px-4 text-xs tracking-tight opacity-40 ${isSoul ? 'text-left' : 'text-right'}`}>
          {timestamp}
        </div>
      </div>
    </motion.div>
  );
}
