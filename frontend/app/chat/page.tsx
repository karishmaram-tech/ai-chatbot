"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { MessageBubble } from "@/components/chat/Message";
import { ChatInput } from "@/components/chat/ChatInput";
import { Sidebar } from "@/components/layout/Sidebar";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import { WelcomeModal } from "@/components/ui/WelcomeModal";
import { MessageSkeleton } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";
import { Menu, Cpu, FileSearch, Code2, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";

const PROMPTS = [
  { icon: Lightbulb, label: "Explain", text: "Explain machine learning in simple terms" },
  { icon: Code2, label: "Code", text: "Write a Python function to parse JSON" },
  { icon: FileSearch, label: "Research", text: "What is RAG and why does it matter?" },
  { icon: Cpu, label: "Analyse", text: "What are the latest trends in AI engineering?" },
];

export default function ChatPage() {
  const { token, messages, conversations, sidebarOpen, setSidebarOpen, isLoading,
    activeConversationId, addMessage, clearMessages } = useStore();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("lumora_welcomed");
  });

  useEffect(() => { if (!token) router.push("/login"); }, [token]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  useEffect(() => {
    const conv = conversations.find((c) => c.id === activeConversationId);
    document.title = conv ? conv.title + " — Lumora AI" : "Lumora AI";
    return () => { document.title = "Lumora AI"; };
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!activeConversationId || !token) return;
    setLoadingHistory(true);
    clearMessages();
    api.chat.getMessages(activeConversationId, token)
      .then((msgs: any[]) => msgs.forEach((m) => addMessage({ role: m.role, content: m.content, tokens: m.tokens_used, cost: m.cost_usd })))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [activeConversationId]);

  function dismissWelcome() {
    setShowWelcome(false);
    localStorage.setItem("lumora_welcomed", "1");
  }

  const showTyping = isLoading && messages.length > 0 && messages[messages.length - 1].role === "user";
  const isEmpty = messages.length === 0 && !loadingHistory;

  return (
    <>
      <AnimatePresence>{showWelcome && <WelcomeModal onClose={dismissWelcome} />}</AnimatePresence>
      <div className="flex h-screen overflow-hidden" style={{ background: "#020408" }}>
        <AmbientBackground />
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 relative z-10">
          <header className="flex items-center gap-3 px-4 sm:px-5 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}>
              <Menu size={17} />
            </motion.button>
            {!sidebarOpen && <LumoraLogo size="sm" />}
            <div className="ml-auto flex items-center gap-2">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Live</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {loadingHistory
                ? <MessageSkeleton />
                : isEmpty
                ? <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full pb-24 px-6">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="mb-8">
                      <LumoraLogo size="lg" />
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                      className="text-3xl mb-3 text-center"
                      style={{ fontFamily: "Instrument Serif, Georgia, serif", fontWeight: 400, color: "white" }}>
                      What shall we explore?
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                      className="text-sm text-center mb-10 max-w-sm" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                      Ask anything. Upload documents for context.<br />Lumora AI remembers your conversation.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                      className="grid grid-cols-2 gap-2 max-w-lg w-full">
                      {PROMPTS.map(({ icon: Icon, label, text }, i) => (
                        <motion.button key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.07 }} whileHover={{ y: -2 }}
                          onClick={() => setInputValue(text)}
                          className="flex items-start gap-3 p-4 rounded-xl text-left group transition-all"
                          style={{ background: "#0d0a18", border: "1px solid rgba(255,255,255,0.06)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(139,92,246,0.12)" }}>
                            <Icon size={13} style={{ color: "#a78bfa" }} />
                          </div>
                          <div>
                            <p className="text-[10px] font-medium tracking-wider uppercase mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>{label}</p>
                            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{text}</p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                : <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-6">
                    {messages.map((msg, i) => <MessageBubble key={i} message={msg} index={i} />)}
                    <AnimatePresence>{showTyping && <TypingIndicator />}</AnimatePresence>
                    <div ref={bottomRef} className="h-6" />
                  </motion.div>}
            </AnimatePresence>
          </div>
          <ChatInput initialValue={inputValue} onInputConsumed={() => setInputValue("")} />
        </div>
      </div>
    </>
  );
}
