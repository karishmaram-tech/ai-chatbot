"use client";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowLeft, User, Shield, Bell, Palette } from "lucide-react";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

function ComingSoon() {
  return <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>Soon</span>;
}

export default function SettingsPage() {
  const { token, user } = useStore();
  const router = useRouter();
  useEffect(() => { if (!token) router.push("/login"); }, [token]);

  const sections = [
    { icon: User, title: "Profile", desc: "Account details", items: [
      { label: "Username", value: user?.username || "", soon: false },
      { label: "Email", value: user?.email || "", soon: false },
      { label: "Display name", value: "Coming soon", soon: true },
    ]},
    { icon: Shield, title: "Security", desc: "Authentication", items: [
      { label: "Password", value: "Change password", soon: true },
      { label: "Two-factor auth", value: "Not enabled", soon: true },
    ]},
    { icon: Palette, title: "Appearance", desc: "Customize", items: [
      { label: "Theme", value: "Dark", soon: true },
    ]},
    { icon: Bell, title: "Notifications", desc: "Alerts", items: [
      { label: "Email alerts", value: "Enabled", soon: true },
    ]},
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#020408" }}>
      <AmbientBackground />
      <Sidebar />
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-2xl mx-auto p-6 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => router.push("/chat")} className="flex items-center gap-2 text-sm mb-6 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
              <ArrowLeft size={15} /> Back to chat
            </button>
            <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
            <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>Manage your Lumora AI workspace</p>
            <div className="space-y-3">
              {sections.map(({ icon: Icon, title, desc, items }, si) => (
                <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.07 }}
                  className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <Icon size={15} style={{ color: "#a78bfa" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">{title}</h2>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{desc}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {items.map(({ label, value, soon }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium" style={{ color: soon ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)" }}>{value}</span>
                          {soon && <ComingSoon />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
