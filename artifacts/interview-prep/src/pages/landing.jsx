import { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, BarChart2, Target, FileSearch,
  CheckCircle2, Brain, Zap, ChevronRight,
  Sparkles, Shield, TrendingUp, MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

// ─── Animated counter ────────────────────────────────────────────────────────

function Counter({ to, suffix = "", prefix = "", duration = 1600 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!isInView) return;
    const steps = 60;
    const inc = to / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= to) { setCount(to); clearInterval(id); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(id);
  }, [isInView, to, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ─── App mockup (hero visual) ─────────────────────────────────────────────────

function AppMockup() {
  const scores = [
    { label: "Keyword Match",     value: 72, color: "#f59e0b" },
    { label: "Formatting",        value: 91, color: "#22c55e" },
    { label: "Quantified Impact", value: 58, color: "#f59e0b" },
    { label: "Role Alignment",    value: 84, color: "#22c55e" },
    { label: "Seniority Signals", value: 35, color: "#ef4444" },
  ];

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-[#00d4a0]/10 rounded-3xl blur-3xl scale-95 translate-y-4" />

      {/* Floating badge — top left */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: -28, y: -16 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute -top-4 -left-6 z-20 bg-[#111113] border border-[#27272a] rounded-xl px-3 py-2 shadow-xl flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
        <span className="text-[10px] font-mono text-[#a1a1aa]">AI Analysis Complete</span>
      </motion.div>

      {/* Floating badge — bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 28, y: 16 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="absolute -bottom-4 -right-6 z-20 bg-[#111113] border border-[#27272a] rounded-xl px-3 py-2.5 shadow-xl"
      >
        <p className="text-[9px] font-mono text-[#71717a] uppercase tracking-wider mb-0.5">Questions ready</p>
        <p className="text-xs font-semibold text-[#f4f4f5]">20 personalized questions</p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a] bg-[#0f0f11]">
          <div>
            <p className="text-[9px] font-mono text-[#00d4a0] tracking-widest uppercase">Phase 02 · Audit</p>
            <p className="text-sm font-bold text-white mt-0.5">Alignment Audit</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 px-2.5 bg-[#1c1c1f] border border-[#27272a] rounded-lg text-[10px] text-[#a1a1aa] flex items-center">Export</div>
            <div className="h-6 px-2.5 bg-[#00d4a0] rounded-lg text-[10px] text-black font-semibold flex items-center gap-1">
              <span className="text-[8px]">▶</span> Generate
            </div>
          </div>
        </div>

        {/* Score + breakdown */}
        <div className="p-4 grid grid-cols-[auto,1fr] gap-4">
          {/* Radial gauge */}
          <div className="bg-[#0d0d0f] rounded-xl p-4 flex flex-col items-center justify-center min-w-[130px]">
            <p className="text-[8px] font-mono text-[#71717a] tracking-widest uppercase mb-2">Fit Score</p>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#27272a" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="38"
                fill="none" stroke="#00d4a0" strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="238"
                initial={{ strokeDashoffset: 238 }}
                animate={{ strokeDashoffset: 238 - (238 * 0.82) }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="46" textAnchor="middle" fill="#f4f4f5" fontSize="20" fontWeight="bold" fontFamily="Inter">82</text>
              <text x="50" y="60" textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="Inter">/ 100</text>
            </svg>
            <p className="text-[9px] text-[#71717a] mt-1.5">
              Potential: <span className="text-[#00d4a0] font-semibold">91</span>
            </p>
          </div>

          {/* Score bars */}
          <div className="flex flex-col justify-center gap-2.5">
            {scores.map(({ label, value, color }, i) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-[#a1a1aa]">{label}</span>
                  <span className="text-[9px] font-mono text-[#71717a]">{value}</span>
                </div>
                <div className="h-1 bg-[#27272a] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: 0.9 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
          {["java", "react", "node.js"].map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-[9px] bg-green-500/10 text-green-400 border border-green-500/20">{s}</span>
          ))}
          {["spring boot"].map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">{s}</span>
          ))}
          {[".net", "kubernetes"].map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-[9px] bg-red-500/10 text-red-400 border border-red-500/20">{s}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#27272a]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00d4a0]/10 border border-[#00d4a0]/20 flex items-center justify-center">
            <span className="text-[#00d4a0] font-bold text-sm font-mono">AI</span>
          </div>
          <span className="text-sm font-semibold text-[#f4f4f5]">Interview Prep</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "FAQ"].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-[#71717a] hover:text-[#f4f4f5] transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button onClick={onGetStarted}
            className="text-sm text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors">
            Sign In
          </button>
          <button onClick={onGetStarted}
            className="flex items-center gap-1.5 h-8 px-4 bg-[#00d4a0] text-black text-sm font-semibold rounded-lg hover:bg-[#00d4a0]/90 transition-colors">
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HEADLINE_WORDS = ["Land", "Your", "Dream", "Role."];

function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, #27272a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] bg-[#00d4a0]/7 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-100px] left-[-150px] w-[600px] h-[600px] bg-purple-600/7 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00d4a0]/20 bg-[#00d4a0]/5 w-fit"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00d4a0]" />
            <span className="text-xs font-mono text-[#00d4a0] tracking-wide">AI-Powered · Groq Llama 3.3 70B</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold text-[#f4f4f5] leading-[1.08] tracking-tight">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="inline-block mr-4"
              >
                {i === 2 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4a0] to-[#00b4d8]">
                    {word}
                  </span>
                ) : word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-lg text-[#a1a1aa] leading-relaxed max-w-md"
          >
            Upload your resume, paste the job description. Get a strict ATS score,
            skill gap analysis, bullet optimizations, and 20 personalized interview
            questions — in under 30 seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <button
              onClick={onGetStarted}
              className="group relative flex items-center gap-2 h-11 px-6 bg-[#00d4a0] text-black font-semibold rounded-xl hover:bg-[#00d4a0]/90 transition-all duration-150 overflow-hidden"
            >
              <span className="relative z-10">Analyze My Resume</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <a href="#how-it-works"
              className="flex items-center gap-1.5 h-11 px-5 text-sm text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-all duration-150">
              See how it works
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-5 flex-wrap"
          >
            {["Free to start", "No credit card", "Instant results"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00d4a0]" />
                <span className="text-xs text-[#71717a]">{t}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — App mockup */}
        <div className="hidden lg:flex justify-center">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: 120, suffix: "+", label: "ATS Signals Analyzed" },
  { value: 20,  suffix: "",  label: "Questions per Session" },
  { value: 14,  suffix: "s", prefix: "~", label: "Avg. Analysis Time" },
  { value: 5,   suffix: "",  label: "Interview Tracks" },
];

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-y border-[#27272a] bg-[#0d0d0f]">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(({ value, suffix, prefix, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="flex flex-col items-center text-center gap-1"
          >
            <span className="text-4xl font-bold text-[#f4f4f5] font-mono tracking-tight">
              {isInView && <Counter to={value} suffix={suffix} prefix={prefix ?? ""} />}
            </span>
            <span className="text-xs text-[#71717a]">{label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    phase: "01",
    icon: FileSearch,
    title: "Upload Your Materials",
    desc: "Paste your job description or upload a PDF, then add your resume. Our parser extracts structured data instantly.",
    accent: "#00d4a0",
  },
  {
    phase: "02",
    icon: BarChart2,
    title: "Get ATS Analysis",
    desc: "Receive a strict ATS score, skill gap breakdown, and bullet-by-bullet optimization suggestions powered by Llama 3.3 70B.",
    accent: "#00b4d8",
  },
  {
    phase: "03",
    icon: Brain,
    title: "Practice Interview Questions",
    desc: "20 personalized questions across dynamic tracks — with frameworks, talking points, and skills to mention for each.",
    accent: "#8b5cf6",
  },
];

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00d4a0]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono text-[#00d4a0] tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f4f4f5] tracking-tight">
            Three steps to interview confidence
          </h2>
          <p className="text-[#71717a] mt-3 max-w-lg mx-auto">
            From raw resume to a full prep kit in under a minute.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[33%] right-[33%] h-px bg-gradient-to-r from-[#27272a] via-[#00d4a0]/30 to-[#27272a]" />

          {STEPS.map(({ phase, icon: Icon, title, desc, accent }, i) => (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative flex flex-col gap-5 p-6 bg-[#111113] border border-[#27272a] rounded-2xl hover:border-[#3f3f46] transition-colors group"
            >
              {/* Phase icon */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}25` }}
                >
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <span className="text-xs font-mono text-[#3f3f46] tracking-widest">PHASE {phase}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#f4f4f5] mb-2">{title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{desc}</p>
              </div>
              {/* Bottom glow on hover */}
              <div
                className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to right, transparent, ${accent}60, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Target,
    title: "Strict ATS Scoring",
    desc: "No fluff. We count only explicit keyword matches against the JD, giving you an honest score with a potential ceiling after optimizations.",
    tag: "Analysis",
    color: "#00d4a0",
  },
  {
    icon: TrendingUp,
    title: "Skill Gap Mapping",
    desc: "Three-tier skill classification — matched, partial, and missing — so you know exactly what to learn or emphasize before applying.",
    tag: "Insights",
    color: "#00b4d8",
  },
  {
    icon: Zap,
    title: "Bullet Optimization",
    desc: "Before/after rewrites of your weakest resume bullets, with injected signals, metrics, and ATS keywords baked in.",
    tag: "Resume",
    color: "#f59e0b",
  },
  {
    icon: MessageSquare,
    title: "Interview Simulator",
    desc: "20 role-specific questions across dynamic tracks with suggested frameworks, key talking points, and skills to mention for each.",
    tag: "Practice",
    color: "#8b5cf6",
  },
  {
    icon: Shield,
    title: "Google Auth & Data Privacy",
    desc: "Sign in with Google. All sessions, analyses, and questions are scoped to your account — no data is ever shared.",
    tag: "Security",
    color: "#22c55e",
  },
  {
    icon: Brain,
    title: "Powered by Llama 3.3 70B",
    desc: "Running on Groq's ultra-fast inference. Analysis in ~14s. Questions that reference your actual resume, not generic templates.",
    tag: "AI Engine",
    color: "#ec4899",
  },
];

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-28 bg-[#0d0d0f] border-t border-[#27272a]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono text-[#00d4a0] tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f4f4f5] tracking-tight">
            Everything you need to prepare
          </h2>
          <p className="text-[#71717a] mt-3 max-w-lg mx-auto">
            A complete prep pipeline from resume audit to mock interview, driven by AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, tag, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="group relative flex flex-col gap-4 p-6 bg-[#111113] border border-[#27272a] rounded-2xl hover:border-[#3f3f46] transition-all duration-200 overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                style={{ background: color, transform: "translate(40%, -40%)" }}
              />

              <div className="flex items-start justify-between relative">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color, backgroundColor: `${color}10`, borderColor: `${color}25` }}
                >
                  {tag}
                </span>
              </div>

              <div className="relative">
                <h3 className="text-sm font-semibold text-[#f4f4f5] mb-1.5">{title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA section ─────────────────────────────────────────────────────────────

function CTASection({ onGetStarted }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00d4a0]/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#00d4a0]/10 border border-[#00d4a0]/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-[#00d4a0]" />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f4f4f5] tracking-tight mb-3">
              Ready to prepare smarter?
            </h2>
            <p className="text-[#71717a] leading-relaxed">
              Stop guessing what interviewers want. Get a data-driven prep kit
              tailored to your resume and target role — in seconds.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2.5 h-12 px-8 bg-[#00d4a0] text-black font-semibold rounded-xl hover:bg-[#00d4a0]/90 transition-all duration-150 text-base"
          >
            Start for Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="flex items-center gap-5">
            {["Free forever", "Google sign-in", "Instant results"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00d4a0]" />
                <span className="text-xs text-[#71717a]">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#27272a] bg-[#0d0d0f]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#00d4a0]/10 border border-[#00d4a0]/20 flex items-center justify-center">
            <span className="text-[#00d4a0] font-bold text-xs font-mono">AI</span>
          </div>
          <span className="text-sm font-semibold text-[#a1a1aa]">Interview Prep</span>
        </div>
        <p className="text-xs text-[#3f3f46]">
          © {new Date().getFullYear()} Interview Prep · Built with Groq · Llama 3.3 70B
        </p>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms"].map(l => (
            <a key={l} href="#" className="text-xs text-[#3f3f46] hover:text-[#71717a] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function LandingPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/intake");
  }, [isAuthenticated]);

  const handleGetStarted = () => navigate("/login");

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] overflow-x-hidden">
      <Navbar onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}
