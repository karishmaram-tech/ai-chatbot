"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ChatInputProps {
  initialValue?: string;
  onInputConsumed?: () => void;
}

export function ChatInput({ initialValue = "", onInputConsumed }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { token, isLoading, setIsLoading, activeConversationId, setActiveConversation } = useStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      if (onInputConsumed) onInputConsumed();
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [initialValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || !token) return;
    const message = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    useStore.getState().addMessage({ role: "user", content: message });
    useStore.getState().addMessage({ role: "assistant", content: "", isStreaming: true });
    try {
      let full = "";
      for await (const data of api.chat.stream(message, token, activeConversationId || undefined)) {
        if (data.type === "chunk") {
          full += data.content;
          const msgs = useStore.getState().messages;
          const last = msgs[msgs.length - 1];
          useStore.setState({ messages: [...msgs.slice(0, -1), { ...last, content: full, isStreaming: true }] });
        } else if (data.type === "done") {
          if (data.conversation_id) setActiveConversation(data.conversation_id);
          const msgs = useStore.getState().messages;
          const last = msgs[msgs.length - 1];
          useStore.setState({ messages: [...msgs.slice(0, -1), { ...last, content: full, isStreaming: false, tokens: data.tokens, cost: data.cost_usd, ragUsed: data.rag_used }] });
        } else if (data.type === "error") {
          const msgs = useStore.getState().messages;
          useStore.setState({ messages: msgs.slice(0, -1) });
          toast.error(data.message || "Error");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed");
      const msgs = useStore.getState().messages;
      useStore.setState({ messages: msgs.slice(0, -1) });
    } finally { setIsLoading(false); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      toast.error("Only PDF and TXT files supported");
      return;
    }
    const id = toast.loading("Indexing document...");
    try {
      const r = await api.documents.upload(file, token);
      toast.success(r.chunks_indexed + " chunks indexed — RAG enabled", { id });
    } catch { toast.error("Upload failed", { id }); }
    e.target.value = "";
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="px-3 sm:px-4 pb-4 sm:pb-6 pt-2 flex-shrink-0">
      <motion.div
        animate={{ boxShadow: focused ? "0 0 0 1px rgba(139,92,246,0.4), 0 8px 32px rgba(0,0,0,0.5)" : "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)" }}
        transition={{ duration: 0.2 }}
        className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
        style={{ background: "#0d0a18" }}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 sm:gap-3 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-0.5"
              style={{ color: "rgba(255,255,255,0.2)", minWidth: 32, minHeight: 32 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
              <Paperclip size={15} />
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handleUpload} className="hidden" />
            <textarea ref={textareaRef} value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
              placeholder="Ask anything..."
              disabled={isLoading} rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none max-h-28 sm:max-h-36 disabled:opacity-50"
              style={{ color: "rgba(255,255,255,0.9)", caretColor: "#a78bfa", fontSize: "16px", lineHeight: 1.5 }} />
            <AnimatePresence mode="wait">
              <motion.button key={canSend ? "on" : "off"} type="submit" disabled={!canSend}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                whileHover={canSend ? { scale: 1.05 } : {}} whileTap={canSend ? { scale: 0.95 } : {}}
                className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all mb-0.5"
                style={{ width: 36, height: 36, minWidth: 36, minHeight: 36,
                  background: canSend ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : "rgba(255,255,255,0.05)",
                  boxShadow: canSend ? "0 0 20px rgba(139,92,246,0.35)" : "none",
                  transition: "background 0.3s ease, box-shadow 0.3s ease",
                  border: canSend ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
                {isLoading
                  ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="block rounded-full" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                  : <ArrowUp size={15} style={{ color: canSend ? "white" : "rgba(255,255,255,0.2)" }} />}
              </motion.button>
            </AnimatePresence>
          </div>
        </form>
        <div className="flex items-center justify-between px-3 sm:px-4 pb-2 sm:pb-3">
          <p className="text-[10px] sm:text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            <span className="hidden sm:inline">Enter to send · Shift+Enter for new line</span>
            <span className="sm:hidden">Tap send or press Enter</span>
          </p>
          <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            <Sparkles size={9} style={{ color: "#a78bfa" }} />RAG active
          </div>
        </div>
      </motion.div>
    </div>
  );
}
