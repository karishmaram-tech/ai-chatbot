"use client";
import { motion } from "framer-motion";

interface LogoProps { size?: "xs" | "sm" | "md" | "lg"; showText?: boolean; }

export function LumoraLogo({ size = "md", showText = true }: LogoProps) {
  const px = { xs: 22, sm: 28, md: 34, lg: 48 }[size];
  const text = { xs: "text-xs", sm: "text-sm", md: "text-base", lg: "text-xl" }[size];
  return (
    <motion.div className="flex items-center gap-2.5 select-none" whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
      <div className="relative flex-shrink-0 flex items-center justify-center rounded-xl"
        style={{ width: px, height: px,
          background: "linear-gradient(145deg, #1a1025 0%, #0d0a18 100%)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 0 20px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        <svg width={px * 0.55} height={px * 0.55} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3.5" fill="#a78bfa" />
          <circle cx="12" cy="12" r="3.5" fill="#a78bfa" opacity="0.3" className="animate-ping" style={{ animationDuration: "3s" }} />
          <line x1="12" y1="3" x2="12" y2="8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="12" y1="16" x2="12" y2="21" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="3" y1="12" x2="8" y2="12" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="16" y1="12" x2="21" y2="12" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
      {showText && (
        <div className="leading-none">
          <div className={`font-semibold tracking-tight text-white ${text}`}>Lumora</div>
          <div className="text-[9px] tracking-[0.25em] uppercase" style={{ color: "#a78bfa" }}>AI</div>
        </div>
      )}
    </motion.div>
  );
}
