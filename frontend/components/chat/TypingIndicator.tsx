import { motion } from "framer-motion";
import { LumoraLogo } from "@/components/ui/LumoraLogo";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 px-6 py-3"
    >
      <div className="flex-shrink-0 mt-0.5">
        <LumoraLogo size="xs" showText={false} />
      </div>
      <div className="flex items-center gap-2.5 py-2">
        <span className="text-xs tracking-widest uppercase" style={{ color: "#4A4238" }}>
          thinking
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: "#C084FC" }}
              animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.13, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
