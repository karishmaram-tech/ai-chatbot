"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileSearch, Zap, Brain, X, ArrowRight, Upload } from "lucide-react";

const STEPS = [
  {
    icon: Brain,
    title: "Meet Lumora AI",
    desc: "Your intelligent workspace. Ask anything — or upload a document to unlock document Q&A.",
    highlight: null,
  },
  {
    icon: FileSearch,
    title: "RAG-powered answers",
    desc: "Upload a PDF and Lumora AI will answer questions using your exact document — not generic training data.",
    highlight: "Try uploading any PDF using the paperclip icon below",
  },
  {
    icon: Zap,
    title: "Real-time streaming",
    desc: "Responses appear word-by-word as they generate. Every answer is grounded in what you uploaded.",
    highlight: null,
  },
];

export function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="mx-4 sm:mx-6 mt-4 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(139,92,246,0.08)",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
          <Icon size={18} style={{ color: "#a78bfa" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">{current.title}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            {current.desc}
          </p>
          {current.highlight && (
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "#67e8f9" }}>
              <Upload size={11} />
              {current.highlight}
            </div>
          )}
          <div className="flex items-center gap-2">
            {!isLast ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all text-white"
                style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                Next <ArrowRight size={11} />
              </button>
            ) : (
              <button onClick={onDismiss}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all text-white"
                style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                Get started <ArrowRight size={11} />
              </button>
            )}
            <button onClick={onDismiss} className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>
              Skip
            </button>
          </div>
        </div>
        <button onClick={onDismiss} className="flex-shrink-0 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>
          <X size={14} />
        </button>
      </div>
      <div className="flex" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        {STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 transition-all" style={{
            background: i <= step ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.1)",
          }} />
        ))}
      </div>
    </motion.div>
  );
}
