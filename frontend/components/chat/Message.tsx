"use client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/types";
import { Copy, Check, Zap } from "lucide-react";
import { useState } from "react";
import { LumoraLogo } from "@/components/ui/LumoraLogo";

export function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
      className={`flex gap-3 px-6 py-3 group ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-cream-100"
            style={{ background: "linear-gradient(135deg, #5B21B6, #7C3AED)" }}>
            U
          </div>
        ) : (
          <LumoraLogo size="xs" showText={false} />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <div
            className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{ opacity: message.isStreaming ? 0.7 : 1, transition: "opacity 0.2s ease" }}
            style={{
              background: "#1C1916",
              border: "1px solid #2A2520",
              color: "#F5F0EB",
              boxShadow: "inset 0 1px 0 rgba(245,240,235,0.04)",
            }}
          >
            {message.content}
          </div>
        ) : (
          <div className="py-1">
            {message.isStreaming ? (
              <div className="text-sm leading-relaxed" style={{ color: "#EAE3DA" }}>
                {message.content}
                                  <motion.span
                    animate={{ opacity: [1, 0.2, 1], scaleY: [1, 0.8, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full"
                    style={{ background: "linear-gradient(180deg, #C084FC, #67e8f9)", transformOrigin: "bottom" }}
                  />
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose-lumora text-sm"
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="relative group/code my-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(String(children))}
                          className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-[10px] opacity-0 group-hover/code:opacity-100 transition-opacity"
                          style={{ background: "#2A2520", color: "#8C8279", border: "1px solid #3A342C" }}
                        >
                          Copy
                        </button>
                        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div"
                          customStyle={{ background: "#0C0A09", border: "1px solid #1C1916", borderRadius: "10px", fontSize: "12px", margin: 0 }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="prose-lumora" {...props}>{children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Meta */}
        {!isUser && message.tokens && !message.isStreaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button onClick={copy}
              className="flex items-center gap-1 text-[10px] transition-colors"
              style={{ color: "#4A4238" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C084FC")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4238")}
            >
              {copied ? <Check size={9} /> : <Copy size={9} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <span style={{ color: "#2A2520" }}>·</span>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#4A4238" }}>
              <Zap size={9} style={{ color: "#C084FC" }} />
              {message.tokens} tokens
            </div>
            {message.ragUsed && (
              <>
                <span style={{ color: "#2A2520" }}>·</span>
                <span className="text-[10px]" style={{ color: "#FB923C" }}>RAG</span>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
