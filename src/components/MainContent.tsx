import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex-1 overflow-auto"
    >
      <div className="min-h-full p-8">
        {children}
      </div>
    </motion.div>
  );
}
