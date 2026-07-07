"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ArrowLeft, TrendingUp, MessageSquare, Zap, DollarSign, Activity } from "lucide-react";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const { token } = useStore();
  const router = useRouter();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    api.analytics.getUsage(token).then(setUsage).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = usage ? [
    { label: "Conversations", value: usage.total_conversations ?? 0, icon: MessageSquare, color: "#a78bfa" },
    { label: "Messages", value: usage.total_messages ?? 0, icon: TrendingUp, color: "#67e8f9" },
    { label: "Tokens used", value: (usage.total_tokens || 0).toLocaleString(), icon: Zap, color: "#fbbf24" },
    { label: "Total cost", value: "$" + (usage.total_cost_usd || 0).toFixed(6), icon: DollarSign, color: "#34d399" },
  ] : [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#020408" }}>
      <AmbientBackground />
      <Sidebar />
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto p-6 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => router.push("/chat")} className="flex items-center gap-2 text-sm mb-6 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
              <ArrowLeft size={15} /> Back to chat
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <Activity size={17} style={{ color: "#a78bfa" }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Usage and cost tracking</p>
              </div>
            </div>
            {loading
              ? <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", animation: "skeletonPulse 1.8s ease-in-out infinite" }} />)}</div>
              : <>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {stats.map(({ label, value, icon: Icon, color }, i) => (
                      <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-2 mb-3"><Icon size={14} style={{ color }} /><span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span></div>
                        <p className="text-2xl font-bold text-white">{value}</p>
                      </motion.div>
                    ))}
                  </div>
                  {usage?.recent_conversations?.length > 0 && (
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <h2 className="text-sm font-semibold text-white mb-4">Recent conversations</h2>
                      <div className="space-y-1">
                        {usage.recent_conversations.map((conv: any) => (
                          <div key={conv.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <p className="text-xs truncate flex-1 max-w-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{conv.title}</p>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{conv.tokens} tok</span>
                              <span className="text-xs" style={{ color: "#34d399" }}>${conv.cost_usd?.toFixed(6)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
