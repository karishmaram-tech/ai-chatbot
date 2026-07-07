"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FileSearch, Zap, Brain, X, ArrowRight, Check, Upload } from "lucide-react";
import { LumoraLogo } from "@/components/ui/LumoraLogo";

const STEPS = [
  { icon: Brain, title: "Welcome to Lumora AI", subtitle: "Your intelligent workspace",
    desc: "Lumora AI is not just another chatbot. It combines real-time streaming with document intelligence — meaning it can read your PDFs and answer questions about them.", action: "Next" },
  { icon: FileSearch, title: "Document Intelligence", subtitle: "RAG-powered answers",
    desc: "Upload any PDF. Lumora reads it, indexes it, and answers questions grounded in your exact document — not generic training data. This is called RAG (Retrieval-Augmented Generation).",
    action: "Next", tip: "Try uploading a research paper, report, or any PDF" },
  { icon: Zap, title: "Real-time Streaming", subtitle: "Answers appear as they generate",
    desc: "Every response streams word-by-word in real time. You see the AI thinking. Combined with RAG, every answer is grounded in what you actually uploaded.", action: "Start exploring" },
];

export function WelcomeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{ background: "#0d0a18", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 0 80px rgba(139,92,246,0.15), 0 24px 64px rgba(0,0,0,0.6)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
          <X size={14} />
        </button>
        <div className="p-8">
          <div className="flex justify-center mb-6"><LumoraLogo size="sm" /></div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <Icon size={22} style={{ color: "#a78bfa" }} />
              </div>
              <div className="text-center mb-6">
                <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "rgba(139,92,246,0.7)" }}>{current.subtitle}</p>
                <h2 className="text-xl font-bold text-white mb-3">{current.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{current.desc}</p>
              </div>
              {"tip" in current && current.tip && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4"
                  style={{ background: "rgba(103,232,249,0.06)", border: "1px solid rgba(103,232,249,0.15)" }}>
                  <Upload size={13} style={{ color: "#67e8f9", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(103,232,249,0.8)" }}>{current.tip}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all"
                  style={{ width: i === step ? 20 : 8, background: i === step ? "#a78bfa" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            <motion.button onClick={() => isLast ? onClose() : setStep(s => s + 1)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
              {current.action} {isLast ? <Check size={14} /> : <ArrowRight size={14} />}
            </motion.button>
          </div>
        </div>
        <div className="flex" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 transition-all"
              style={{ background: i <= step ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.08)" }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
