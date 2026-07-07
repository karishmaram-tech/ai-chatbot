"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Brain, FileSearch, BarChart3, Layers } from "lucide-react";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { LumoraLogo } from "@/components/ui/LumoraLogo";

const FEATURES = [
  { icon: Brain, title: "Streaming AI", desc: "Word-by-word responses via SSE. ChatGPT-like experience built from scratch." },
  { icon: FileSearch, title: "RAG Pipeline", desc: "Upload PDFs. Ask questions. Get answers grounded in your documents." },
  { icon: Shield, title: "JWT Auth", desc: "Secure authentication with bcrypt, role-based access, and refresh tokens." },
  { icon: Zap, title: "Redis Caching", desc: "Rate limiting and response caching for production-grade performance." },
  { icon: BarChart3, title: "Observability", desc: "Prometheus metrics, Grafana dashboards, structured JSON logging." },
  { icon: Layers, title: "Full Stack", desc: "FastAPI + PostgreSQL + Next.js. Docker Compose. CI/CD with GitHub Actions." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden" style={{ background: "#020408", height: "100vh" }}>
      <AmbientBackground />

      {/* Nav */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(2,4,8,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <LumoraLogo size="sm" />
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm transition-all" style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e: any) => (e.target.style.color = "white")}
              onMouseLeave={(e: any) => (e.target.style.color = "rgba(255,255,255,0.4)")}>Sign in</Link>
            <Link href="/register" className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-white transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Production-ready AI SaaS
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hero-anim hero-reveal text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] mb-6 tracking-tight max-w-5xl"
          style={{ fontFamily: "Instrument Serif, Georgia, serif", fontWeight: 400, animationDelay: "0.2s" }}>
          <span className="text-white">Intelligence,</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            beautifully
          </span>
          <span className="text-white"> crafted</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-base sm:text-lg max-w-xl leading-relaxed mb-10 px-2 sm:px-0"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          Lumora AI combines document intelligence, real-time streaming, and full observability into one elegant workspace.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Link href="/register"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: "0 0 40px rgba(139,92,246,0.35), 0 4px 20px rgba(0,0,0,0.4)" }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/demo"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
            Live demo
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[{ num: "15+", label: "API Endpoints" }, { num: "RAG", label: "Document AI" }, { num: "SSE", label: "Live Streaming" }, { num: "7", label: "Tests Passing" }].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold text-white mb-0.5">{num}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Built for <span style={{ background: "linear-gradient(135deg, #a78bfa, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>production</span></h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>Enterprise-grade engineering. Recruiter-impressive portfolio quality.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl cursor-default transition-all"
              style={{ background: "rgba(13,10,20,0.8)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <Icon size={18} style={{ color: "#a78bfa" }} />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-16 rounded-3xl"
          style={{ background: "rgba(13,10,20,0.9)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 0 80px rgba(139,92,246,0.1)" }}>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Instrument Serif, Georgia, serif", fontWeight: 400 }}>Ready to explore?</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Join now and experience the next generation of AI conversations.</p>
          <Link href="/register" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: "0 0 40px rgba(139,92,246,0.4)" }}>
            Get started free <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 px-6 py-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © {new Date().getFullYear()} Lumora AI. Built with FastAPI, Next.js, PostgreSQL, Redis, Neon, FAISS.
        </p>
      </footer>
    </div>
  );
}
