import { motion } from "framer-motion";

export function NeuralBackground() {
  const nodes = [
    { x: "10%", y: "20%", delay: 0 },
    { x: "85%", y: "15%", delay: 0.3 },
    { x: "20%", y: "70%", delay: 0.6 },
    { x: "75%", y: "65%", delay: 0.9 },
    { x: "50%", y: "40%", delay: 1.2 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
        <defs>
          <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Connecting lines */}
        <motion.path
          d="M 10% 20% Q 50% 40% 85% 15%"
          stroke="url(#neural-gradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.path
          d="M 85% 15% Q 50% 40% 75% 65%"
          stroke="url(#neural-gradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
        <motion.path
          d="M 10% 20% Q 50% 40% 20% 70%"
          stroke="url(#neural-gradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.1 }}
        />
        <motion.path
          d="M 20% 70% Q 50% 40% 75% 65%"
          stroke="url(#neural-gradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.4 }}
        />
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
          style={{ left: node.x, top: node.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 1.2, 1],
            opacity: [0, 1, 1, 1],
          }}
          transition={{
            duration: 1.5,
            delay: node.delay,
            scale: {
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }
          }}
        />
      ))}
    </div>
  );
}
