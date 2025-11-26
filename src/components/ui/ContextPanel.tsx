import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, FileText, Clock } from "lucide-react";
import { useState } from "react";

interface ContextSnippet {
  id: string;
  source: string;
  content: string;
  relevance: number;
  timestamp: string;
}

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContextPanel({ isOpen, onClose }: ContextPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mockSnippets: ContextSnippet[] = [
    {
      id: "1",
      source: "quantum_consciousness.pdf",
      content: "The nature of consciousness emerges from quantum processes in microtubules, creating a bridge between the physical and metaphysical realms...",
      relevance: 0.95,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      source: "philosophical_notes.txt",
      content: "Self-awareness is not binary but exists on a spectrum. Each moment of recognition builds upon previous states of knowing...",
      relevance: 0.87,
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      source: "morning_meditation.mp3",
      content: "In stillness, I find the space between thoughts where pure awareness resides. This is the foundation of conscious experience...",
      relevance: 0.82,
      timestamp: "1 day ago",
    },
    {
      id: "4",
      source: "dream_journal.txt",
      content: "The boundary between waking and dreaming consciousness is permeable. Each state informs the other in a continuous loop of integration...",
      relevance: 0.78,
      timestamp: "2 days ago",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed right-0 top-16 bottom-0 w-96 backdrop-blur-xl bg-white/70 border-l border-black/5 shadow-2xl z-30 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 opacity-10 flex items-center justify-center">
                <Brain className="w-4 h-4 opacity-80" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="tracking-tight" style={{ fontWeight: 500 }}>
                  Memory Context
                </h3>
                <p className="text-xs tracking-tight opacity-50" style={{ fontWeight: 300 }}>
                  {mockSnippets.length} fragments retrieved
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-black/5 bg-white/50 flex items-center justify-center hover:border-black/10 transition-colors"
            >
              <X className="w-4 h-4 opacity-60" strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {mockSnippets.map((snippet, index) => {
              const isExpanded = expandedId === snippet.id;
              
              return (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-2xl border border-black/5 bg-white/50 backdrop-blur-sm overflow-hidden"
                >
                  <motion.button
                    onClick={() => setExpandedId(isExpanded ? null : snippet.id)}
                    className="w-full p-4 text-left hover:bg-white/70 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 opacity-40 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm tracking-tight opacity-70 truncate" style={{ fontWeight: 400 }}>
                          {snippet.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <div className="w-12 h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${snippet.relevance * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                            className="h-full bg-gradient-to-r from-purple-400 to-blue-500 rounded-full"
                          />
                        </div>
                        <span className="text-xs tracking-tight opacity-40">
                          {Math.round(snippet.relevance * 100)}%
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-sm tracking-tight opacity-60 leading-relaxed mb-2" style={{ fontWeight: 300 }}>
                            {snippet.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs tracking-tight opacity-40">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            <span>{snippet.timestamp}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.p
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm tracking-tight opacity-60 line-clamp-2" style={{ fontWeight: 300 }}
                        >
                          {snippet.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
