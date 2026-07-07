"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const shake = { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useStore();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      setAuth(data.access_token, data.user);
      toast.success("Welcome back");
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    } finally { setLoading(false); }
  }

  const hasError = error.length > 0;
  function fieldStyle(field: string) {
    return {
      background: "rgba(255,255,255,0.03)",
      border: hasError ? "1px solid rgba(239,68,68,0.5)" : focused === field ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.07)",
      boxShadow: hasError ? "0 0 0 3px rgba(239,68,68,0.08)" : focused === field ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
      color: "white", transition: "all 0.2s ease",
    };
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#020408" }}>
      <AmbientBackground />
      {/* Left panel */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
        className="hidden lg:flex flex-col justify-between w-[48%] p-16 relative z-10"
        style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <LumoraLogo size="md" />
        <div>
          <motion.h1 animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl leading-[1.15] mb-5 font-light text-white"
            style={{ fontFamily: "Instrument Serif, Georgia, serif" }}>
            Your AI workspace,<br />
            <em style={{ background: "linear-gradient(135deg, #a78bfa, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              infinitely capable
            </em>
          </motion.h1>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Document intelligence. Real-time streaming. Built for engineers who care about craft.
          </p>
        </div>
        <div className="flex gap-6">
          {[{ v: "RAG", l: "Document AI" }, { v: "SSE", l: "Live Stream" }, { v: "100%", l: "Open Source" }].map(({ v, l }) => (
            <div key={l}><div className="text-base font-bold text-white">{v}</div><div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{l}</div></div>
          ))}
        </div>
      </motion.div>
      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center"><LumoraLogo size="md" /></div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">Welcome back</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Sign in to your workspace</p>
          </div>
          <motion.form onSubmit={handleLogin} animate={shaking ? shake : {}} className="space-y-4">
            {[{ field: "email", label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
              { field: "password", label: "Password", type: showPw ? "text" : "password", val: password, set: setPassword, ph: "••••••••" }].map(({ field, label, type, val, set, ph }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                <div className="relative">
                  <input type={type} value={val} onChange={(e) => { set(e.target.value); setError(""); }}
                    onFocus={() => setFocused(field)} onBlur={() => setFocused(null)}
                    placeholder={ph} required className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12" style={fieldStyle(field)} />
                  {field === "password" && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                  <AlertCircle size={12} />{error}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="mt-2 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: loading ? "none" : "0 0 30px rgba(139,92,246,0.35)" }}>
              {loading
                ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 rounded-full block" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                : <><Sparkles size={14} /> Sign in <ArrowRight size={14} /></>}
            </motion.button>
          </motion.form>
          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            No account? <Link href="/register" className="font-medium" style={{ color: "#a78bfa" }}>Create workspace</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
