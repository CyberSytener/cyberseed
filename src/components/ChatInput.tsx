import { motion } from "motion/react";
import { Send, Square } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isGenerating?: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, isGenerating = false, onStop }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isGenerating) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-t border-black/5 backdrop-blur-xl bg-white/70 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Input field */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts with the soul..."
            rows={3}
            disabled={isGenerating}
            className="w-full px-6 py-4 pr-32 rounded-2xl border border-black/5 bg-white/80 backdrop-blur-sm resize-none focus:outline-none focus:border-black/10 focus:ring-2 focus:ring-purple-400/20 transition-all placeholder:opacity-40 tracking-tight disabled:opacity-50"
            style={{ fontWeight: 300 }}
          />

          {/* Buttons */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {isGenerating ? (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-red-400 to-red-500 text-white flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <Square className="w-4 h-4" strokeWidth={1.5} fill="currentColor" />
                <span className="text-sm tracking-tight" style={{ fontWeight: 500 }}>
                  Stop
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!message.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-purple-400 via-blue-500 to-teal-500 text-white flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              >
                <span className="text-sm tracking-tight" style={{ fontWeight: 500 }}>
                  Send
                </span>
                <Send className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-3 flex items-center justify-between px-2">
          <p className="text-xs tracking-tight opacity-40" style={{ fontWeight: 300 }}>
            Press Enter to send, Shift+Enter for new line
          </p>
          <p className="text-xs tracking-tight opacity-40" style={{ fontWeight: 300 }}>
            {message.length} characters
          </p>
        </div>
      </div>
    </motion.div>
  );
}
