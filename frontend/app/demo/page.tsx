"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import { ArrowRight, Bot, User, Zap, FileSearch, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DEMO = [
  { role: "user", content: "What is RAG and how does Lumora AI use it?" },
  { role: "assistant", content: "RAG (Retrieval-Augmented Generation) grounds AI responses in real documents rather than just training data.\n\nHow Lumora AI uses it:\n\n1. You upload a PDF\n2. Lumora splits it into semantic chunks and embeds each one\n3. When you ask a question, Lumora searches those embeddings for relevant context\n4. The AI answers using both its training AND your specific document\n\nThis means the AI cannot hallucinate information your document does not contain.", tokens: 142, ragUsed: true },
  { role: "user", content: "What makes this different from just asking ChatGPT?" },
  { role: "assistant", content: "ChatGPT has no access to your private documents. It can only answer from its training data.\n\nLumora AI gives you:\n- Document-aware answers specific to what you uploaded\n- Source grounding — responses cite your actual content\n- Private by design — your documents stay in your workspace\n- Real-time streaming — answers appear word by word as they generate", tokens: 98, ragUsed: true },
];

function DemoMessage({ msg, visible }: { msg: typeof DEMO[0]; visible: boolean }) {
  const isUser = msg.role === "user";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible || isUser) { setDisplayed(msg.content); setDone(true); return; }
    let i = 0;
    const interval = setInterval(() => {
      i += 3; setDisplayed(msg.content.slice(0, i));
      if (i >= msg.content.length) { setDone(true); clearInterval(interval); }
    }, 16);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={`flex gap-3 px-4 py-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 mt-0.5">
        {isUser
          ? <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}><User size={13} className="text-white" /></div>
          : <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}><Bot size={13} style={{ color: "#a78bfa" }} /></div>}
      </div>
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : ""}`}>
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          style={{ background: isUser ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)", border: isUser ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.9)" }}>
          {displayed}
          {!done && <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.7, repeat: Infinity }} className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full" style={{ background: "#a78bfa" }} />}
        </div>
        {done && "ragUsed" in msg && msg.ragUsed && (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            <FileSearch size={9} style={{ color: "#67e8f9" }} /><span>RAG</span>
            <Zap size={9} style={{ color: "#a78bfa" }} /><span>{"tokens" in msg ? msg.tokens : 0} tokens</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DemoPage() {
  const [visibleCount, setVisibleCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= DEMO.length) return;
    const msg = DEMO[visibleCount];
    const charDelay = msg.role === "assistant" ? (msg.content.length * 16) + 300 : 400;
    const delay = visibleCount === 0 ? 400 : charDelay + 600;
    const t = setTimeout(() => setVisibleCount(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [visibleCount]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [visibleCount]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#020408", height: "100vh", overflow: "hidden" }}>
      <AmbientBackground />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <LumoraLogo size="sm" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />Live demo
            </div>
            <Link href="/register" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
              Try free <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto py-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6 px-4">
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Interactive preview</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Watch Lumora AI answer questions using document intelligence</p>
          </motion.div>
          {DEMO.map((msg, i) => <DemoMessage key={i} msg={msg} visible={i < visibleCount} />)}
          {visibleCount >= DEMO.length && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-6 p-6 rounded-2xl text-center"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-white font-semibold mb-1">Ready to try with your own documents?</p>
              <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>Upload any PDF and ask questions about it.</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}>
                Create free workspace <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
        <div className="flex-shrink-0 px-6 pb-4">
          <Link href="/" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>
            <ArrowLeft size={12} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
