"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Plus, MessageSquare, Settings, LogOut, BarChart2, ChevronRight, Hash, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import toast from "react-hot-toast";

export function Sidebar() {
  const { token, user, conversations, activeConversationId, sidebarOpen,
    setSidebarOpen, setConversations, setActiveConversation, clearMessages, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (token) api.chat.getConversations(token).then(setConversations).catch(console.error);
  }, [token, activeConversationId]);

  function handleNav(path: string) {
    router.push(path);
    if (isMobile) setSidebarOpen(false);
  }

  function handleConvClick(id: string) {
    setActiveConversation(id);
    router.push("/chat");
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed md:relative z-40 flex flex-col h-screen flex-shrink-0"
            style={{
              width: 256,
              background: "rgba(8,5,16,0.97)",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(40px)",
            }}
          >
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <LumoraLogo size="sm" />
              <button onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center md:hidden"
                style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
                <X size={14} />
              </button>
            </div>
            <div className="px-3 pt-3 pb-2">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => { clearMessages(); handleNav("/chat"); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-white"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", minHeight: 40 }}
              >
                <Plus size={13} style={{ color: "#a78bfa" }} />
                New conversation
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-1">
              {conversations.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Hash size={16} style={{ color: "rgba(255,255,255,0.12)" }} />
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>No conversations yet</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-medium tracking-[0.18em] uppercase px-2 py-2.5" style={{ color: "rgba(255,255,255,0.18)" }}>Recent</p>
                  {conversations.map((conv, i) => {
                    const active = activeConversationId === conv.id;
                    return (
                      <motion.button key={conv.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleConvClick(conv.id)}
                        onMouseEnter={() => setHovered(conv.id)}
                        onMouseLeave={() => setHovered(null)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5"
                        style={{
                          minHeight: 40,
                          background: active ? "rgba(139,92,246,0.12)" : hovered === conv.id ? "rgba(255,255,255,0.03)" : "transparent",
                          border: active ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent",
                        }}
                      >
                        <MessageSquare size={11} style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                        <span className="truncate flex-1 text-xs" style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
                          {conv.title}
                        </span>
                        {active && <ChevronRight size={10} style={{ color: "#a78bfa", flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </>
              )}
            </div>
            <div className="px-3 pb-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[{ icon: BarChart2, label: "Analytics", path: "/analytics" }, { icon: Settings, label: "Settings", path: "/settings" }].map(({ icon: Icon, label, path }) => (
                <button key={path} onClick={() => handleNav(path)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all mb-0.5"
                  style={{ color: pathname === path ? "#a78bfa" : "rgba(255,255,255,0.3)", minHeight: 40 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = pathname === path ? "#a78bfa" : "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon size={13} />{label}
                </button>
              ))}
              <button onClick={() => { logout(); router.push("/login"); toast.success("Signed out"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all mb-2"
                style={{ color: "rgba(255,255,255,0.22)", minHeight: 40 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.22)"; e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={13} />Sign out
              </button>
              {user && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-white">{user.username}</p>
                    <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
