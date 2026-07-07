"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import { Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useStore();
  const router = useRouter();

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColors = ["", "rgba(239,68,68,0.7)", "rgba(251,191,36,0.7)", "rgba(52,211,153,0.7)"];
  const strengthLabels = ["", "Too short", "Moderate", "Strong"];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      await api.auth.register(email, username, password);
      const data = await api.auth.login(email, password);
      setAuth(data.access_token, data.user);
      toast.success("Workspace created!");
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally { setLoading(false); }
  }

  function fieldStyle(field: string) {
    return {
      background: "rgba(255,255,255,0.03)",
      border: focused === field ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.07)",
      boxShadow: focused === field ? "0 0 0 3px rgba(139,92,246,0.08)" : "none",
      color: "white", transition: "all 0.2s ease",
    };
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#020408" }}>
      <AmbientBackground />
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-16 relative z-10" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <LumoraLogo size="md" />
        <div>
          <h1 className="text-5xl leading-[1.15] mb-5 font-light text-white" style={{ fontFamily: "Instrument Serif, Georgia, serif" }}>
            Start building<br />
            <em style={{ background: "linear-gradient(135deg, #a78bfa, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>smarter</em>
          </h1>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Upload documents. Ask questions. Get answers grounded in your content.</p>
        </div>
        <div className="flex flex-col gap-2">
          {["Real-time streaming responses", "Document intelligence with RAG", "Full observability stack", "Open source codebase"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Check size={11} style={{ color: "#34d399" }} />{f}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center"><LumoraLogo size="md" /></div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">Create workspace</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Free forever. No credit card.</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { field: "email", label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
              { field: "username", label: "Username", type: "text", val: username, set: setUsername, ph: "yourname" },
            ].map(({ field, label, type, val, set, ph }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                <input type={type} value={val} onChange={(e) => { set(e.target.value); setError(""); }}
                  onFocus={() => setFocused(field)} onBlur={() => setFocused(null)}
                  placeholder={ph} required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle(field)} />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  placeholder="Min. 8 characters" required className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12" style={fieldStyle("password")} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  {[1,2,3].map((l) => (
                    <div key={l} className="flex-1 h-0.5 rounded-full transition-all" style={{ background: strength >= l ? strengthColors[strength] : "rgba(255,255,255,0.08)" }} />
                  ))}
                  <span className="text-[10px]" style={{ color: strengthColors[strength] || "rgba(255,255,255,0.3)" }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
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
                : <>Create workspace <ArrowRight size={14} /></>}
            </motion.button>
          </form>
          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            Already have an account? <Link href="/login" className="font-medium" style={{ color: "#a78bfa" }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
