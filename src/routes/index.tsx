import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MarketingNav, Logo } from "@/components/marketing/Nav";
import { HeroDashboard } from "@/components/marketing/HeroDashboard";
import { Reveal, Counter, SectionLabel } from "@/components/marketing/Primitives";
import {
  Brain, Shield, Telescope, GraduationCap,
  AlertTriangle, Wallet, Check, ChevronDown, ArrowRight, Sparkles, Zap,
  TrendingDown, BookOpen, Twitter, Github, Linkedin, Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { testimonials, faqs, scannerResults, courses } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Typewriter({ words, delay = 100, deleteDelay = 60, pause = 2000 }: { words: string[], delay?: number, deleteDelay?: number, pause?: number }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      setText(words[index].substring(0, subIndex + (isDeleting ? -2 : 0)));
    }, isDeleting ? deleteDelay : delay);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, words]);

  return (
    <span className="relative inline-block text-primary font-semibold min-w-[140px] text-left">
      {text}
      <span className="absolute -right-[2px] top-[15%] bottom-[15%] w-[2px] bg-primary animate-pulse" />
    </span>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-75" />
      <MarketingNav />

      <Hero />
      <TrustedBy />
      <Problem />
      <Solution />
      <FeatureShowcase />
      <AICoachSection />
      <ScannerSection />
      <PortfolioSection />
      <AcademySection />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-36 pb-16 md:pt-44 md:pb-24 overflow-hidden">
      {/* Premium Floating Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] rounded-full bg-primary/5 blur-[110px] animate-float pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[420px] h-[420px] rounded-full bg-blue-500/5 blur-[130px] animate-float pointer-events-none" style={{ animationDelay: "2.5s" }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 backdrop-blur-md px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="flex h-1.5 w-1.5"><span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-primary" /><span className="h-1.5 w-1.5 rounded-full bg-primary" /></span>
          Now live for Indian markets — NSE & BSE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-balance text-5xl font-semibold tracking-[-0.04em] sm:text-6xl md:text-7xl"
        >
          Your AI Copilot for <br className="hidden sm:block" />
          <span className="text-gradient-brand">Smarter Trading</span> Decisions
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg min-h-[56px] flex flex-wrap items-center justify-center gap-x-1.5"
        >
          <span>Discover opportunities, analyze stocks, and</span>
          <Typewriter words={["manage portfolio risk", "identify breakout setups", "synthesize market news", "optimize position sizing"]} />
          <span>with an AI that thinks alongside you, built for active Indian traders.</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/app"
            className="group relative overflow-hidden rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all duration-300 hover:shadow-[0_4px_24px_-2px_rgba(37,99,235,0.6)] hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="relative flex items-center gap-2">
              Start Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <button className="group relative inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/80 hover:bg-secondary px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:border-primary/20 hover:scale-[1.01] active:scale-[0.99]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] transition-transform duration-300 group-hover:scale-110">▶</span> Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 text-xs text-muted-foreground"
        >
          Free forever for individuals. No credit card required.
        </motion.div>
      </div>

      <div className="mt-16 px-4 md:mt-24">
        <HeroDashboard />
      </div>
    </section>
  );
}

function TrustedBy() {
  const stats = [
    { v: 48200, label: "Active traders" },
    { v: 3800, label: "Stocks tracked", suffix: "+" },
    { v: 1240000, label: "AI insights generated" },
    { v: 99, label: "Uptime", suffix: "%" },
  ];
  return (
    <section className="border-y border-border bg-surface/40 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Trusted by India's most thoughtful traders</p>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="text-center">
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  <Counter to={s.v} suffix={s.suffix ?? ""} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    { icon: Activity, title: "Information Overload", text: "100+ news sources, 10 chat groups, 50 indicators. You can't find the signal." },
    { icon: TrendingDown, title: "Emotional Trading", text: "FOMO entries. Panic exits. Revenge trades. Discipline is hard alone." },
    { icon: Shield, title: "Poor Risk Management", text: "Hidden concentration. Oversized positions. No clear stop framework." },
    { icon: Telescope, title: "Missed Opportunities", text: "Setups break out while you're in meetings. Alerts come too late." },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Trading is harder than it should be.</h2>
            <p className="mt-4 text-muted-foreground">The retail trader fights a war on four fronts — without the tools institutions take for granted.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-danger/20 hover:shadow-[0_8px_30px_rgba(239,68,68,0.03)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger transition-transform duration-300 group-hover:scale-110">
                  <it.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-medium">{it.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{it.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const items = [
    { icon: Brain, title: "AI Market Brief", text: "Your morning intelligence. Macro, sectors, your watchlist — synthesized in 60 seconds." },
    { icon: Telescope, title: "AI Scanner", text: "Find high-probability setups across 3,800+ stocks. Ranked by conviction, not noise." },
    { icon: Sparkles, title: "AI Coach", text: "Conversational analysis. Ask 'why is HDFCBANK moving?' and get a real answer." },
    { icon: Wallet, title: "Portfolio Intelligence", text: "X-ray your holdings. See hidden risk, factor exposure, and rebalance prompts." },
    { icon: Shield, title: "Risk Guardian", text: "Real-time guardrails. Stop overtrading, oversizing, and sector concentration." },
    { icon: GraduationCap, title: "Trading Academy", text: "Structured learning paths from beginner to F&O. Practice with paper trading." },
  ];
  return (
    <section id="features" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The Solution</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">One operating system for your trading life.</h2>
            <p className="mt-4 text-muted-foreground">Six interlocking modules that turn raw market data into confident decisions.</p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(37,99,235,0.04)]"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <it.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium">{it.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{it.text}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const features = [
    {
      tag: "AI Market Brief",
      title: "Wake up to a market that already makes sense.",
      desc: "Every morning at 8:30 AM IST, TradeOS digests global cues, FII/DII flows, sector rotation, and earnings — and writes you a brief tailored to your portfolio.",
      bullets: ["Global cues & overnight moves", "Sector rotation snapshot", "Stocks on your watchlist", "Risk events for the day"],
      mock: <BriefMock />,
    },
    {
      tag: "AI Coach",
      title: "Talk to a senior analyst — anytime.",
      desc: "Ask why a stock is moving. Get setup quality scores. Stress-test your thesis. The AI Coach explains, debates, and never sleeps.",
      bullets: ["Plain-English explanations", "Setup quality scoring", "Thesis stress-testing", "Bias detection"],
      mock: <CoachMock />,
    },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl space-y-28 px-4">
        {features.map((f, i) => (
          <div key={f.tag} className={`grid gap-10 lg:grid-cols-2 lg:items-center ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <Reveal>
              <div>
                <SectionLabel>{f.tag}</SectionLabel>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{f.title}</h2>
                <p className="mt-4 text-muted-foreground">{f.desc}</p>
                <ul className="mt-6 space-y-2.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-success" /> <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.15}>{f.mock}</Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

function BriefMock() {
  return (
    <div className="glass-strong rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-primary" /> Morning Brief · 8:30 AM IST</div>
        <span>Today</span>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p><span className="text-primary">Global cues</span> are mixed. S&P closed +0.4%, Nasdaq +0.8%. Asian markets opening flat.</p>
        <p>Indian markets likely to open <span className="text-success">positive</span>. FIIs net bought ₹1,842 Cr yesterday. <span className="text-foreground">Banking</span> and <span className="text-foreground">Auto</span> showing strongest momentum.</p>
        <p>From your watchlist: <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs">RELIANCE</span> approaching resistance at ₹2,960. <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs">TATAMOTORS</span> breakout setup live.</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">3 actionable insights</span>
        <button className="flex items-center gap-1 text-primary">Open full brief <ArrowRight className="h-3 w-3" /></button>
      </div>
    </div>
  );
}

function CoachMock() {
  return (
    <div className="glass-strong rounded-2xl p-5 shadow-2xl">
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
            Why is HDFCBANK up today?
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary"><Sparkles className="h-3.5 w-3.5" /></div>
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2 text-sm">
            HDFCBANK is +0.84% on three drivers: stronger Q3 deposit growth guidance, FII buying in private banks (₹420 Cr), and a positive analyst upgrade from Jefferies. Technicals show a clean pullback to the 50-DMA.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary"><Sparkles className="h-3.5 w-3.5" /></div>
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4" /> Ask anything about markets, your portfolio, or a stock…
      </div>
    </div>
  );
}

function ScannerSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <SectionLabel>Market Scanner</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Find tomorrow's movers — today.</h2>
              <p className="mt-4 text-muted-foreground">The scanner watches every NSE stock around the clock, ranks setups by conviction, and surfaces only what's worth your attention.</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { v: "3,800+", l: "Stocks scanned" },
                  { v: "24/7", l: "Real-time" },
                  { v: "<2s", l: "Alert latency" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-card p-3">
                    <div className="text-2xl font-semibold tracking-tight">{s.v}</div>
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl">
              <div className="border-b border-border px-5 py-3 text-xs text-muted-foreground">Live · Top setups by conviction</div>
              <div className="divide-y divide-border">
                {scannerResults.slice(0, 5).map((r, i) => (
                  <motion.div
                    key={r.symbol}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between px-5 py-3 hover:bg-secondary/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary/30 to-purple-500/20 text-center text-[11px] leading-8 font-semibold">{r.symbol.slice(0, 2)}</div>
                      <div>
                        <div className="text-sm font-medium">{r.symbol}</div>
                        <div className="text-xs text-muted-foreground">{r.setup}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right text-xs">
                      <div>
                        <div className="text-muted-foreground">Score</div>
                        <div className="font-semibold text-primary tabular-nums">{r.score}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Move</div>
                        <div className="font-semibold text-success tabular-nums">+{r.change}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal delay={0.1}>
            <div className="glass-strong rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Portfolio Value</div>
                  <div className="mt-1 text-3xl font-semibold tabular-nums">₹9,84,210</div>
                  <div className="text-xs text-success">+₹42,180 (4.47%) this month</div>
                </div>
                <div className="rounded-lg bg-success/10 px-2 py-1 text-xs text-success">Healthy</div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { l: "Diversification", v: 82, c: "#22C55E" },
                  { l: "Concentration risk", v: 34, c: "#F59E0B" },
                  { l: "Beta", v: 61, c: "#3B82F6" },
                  { l: "Liquidity", v: 91, c: "#A855F7" },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl border border-border bg-card p-3">
                    <div className="text-xs text-muted-foreground">{m.l}</div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.v}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: m.c }} />
                    </div>
                    <div className="mt-1 text-xs font-medium">{m.v}/100</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs">
                <div className="flex items-center gap-1.5 text-warning"><AlertTriangle className="h-3.5 w-3.5" /> Risk alert</div>
                <p className="mt-1 text-muted-foreground">Banking exposure is 32%. Consider trimming to stay under your 25% rule.</p>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <SectionLabel>Portfolio Intelligence</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Know what you actually own.</h2>
              <p className="mt-4 text-muted-foreground">Beyond P&L. See your factor exposure, hidden concentration, sector tilt, and personalized rebalancing prompts — across stocks, ETFs, and mutual funds.</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Factor & sector decomposition", "Cross-asset risk consolidation", "Personalized rebalancing prompts", "Tax-aware exit suggestions"].map((b) => (
                  <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" />{b}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function AcademySection() {
  return (
    <section id="academy" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Trading Academy</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Learn the craft. Compound the edge.</h2>
            <p className="mt-4 text-muted-foreground">Structured paths from your first chart to advanced derivatives. Practice with paper trading. Track real progress.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: c.color + "20", color: c.color }}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.level}</span>
                </div>
                <h3 className="mt-4 text-base font-medium leading-snug">{c.title}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{c.lessons} lessons · {c.duration}</div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{c.progress}%</span></div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.progress}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="h-full rounded-full" style={{ backgroundColor: c.color }} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AICoachSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-4xl px-4">
        <Reveal>
          <div className="text-center">
            <SectionLabel>AI Coach</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A senior analyst, on call.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Conversational, contextual, and brutally honest. Ask anything.</p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="glass-strong mt-10 rounded-2xl p-6 shadow-2xl">
            <div className="space-y-4">
              <ChatBubble side="user">Should I average down on INFY?</ChatBubble>
              <ChatBubble side="ai">
                Averaging down works when conviction is high <em>and</em> the original thesis hasn't broken. For INFY:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Down 7% from your entry — within normal volatility</li>
                  <li>• Earnings unchanged, FY24 EPS guidance intact</li>
                  <li>• But sector rotation has shifted away from IT this quarter</li>
                </ul>
                <p className="mt-2">My take: <span className="text-foreground">don't average</span>. Wait for a higher low confirmation. If you must add, scale in only 25% of intended size at ₹1,820 support.</p>
              </ChatBubble>
              <ChatBubble side="user">What's my position risk if I add?</ChatBubble>
              <ChatBubble side="ai" typing />
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Ask your coach anything…
              <span className="ml-auto rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">⌘K</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChatBubble({ side, children, typing }: { side: "user" | "ai"; children?: React.ReactNode; typing?: boolean }) {
  if (side === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/20 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
        {typing ? (
          <div className="flex items-center gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.2s" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.4s" }} />
          </div>
        ) : children}
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Loved by traders</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Built with traders who use it daily.</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-xs font-semibold">{t.initial}</div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free", price: "₹0", desc: "Everything to start trading smarter.",
      features: ["Daily AI Market Brief", "Scanner: 5 setups/day", "Portfolio tracking", "Academy basics"],
      cta: "Start Free", highlight: false,
    },
    {
      name: "Pro", price: "₹799", desc: "For active traders. The most popular.",
      features: ["Unlimited Scanner", "AI Coach conversations", "Risk Guardian", "Real-time alerts", "Trade Journal", "Advanced charting"],
      cta: "Start 14-day trial", highlight: true,
    },
    {
      name: "Premium", price: "₹2,499", desc: "For professionals managing serious capital.",
      features: ["Everything in Pro", "Multi-portfolio support", "Options analytics", "Backtesting engine", "Priority AI", "1-on-1 strategy review"],
      cta: "Contact sales", highlight: false,
    },
  ];
  return (
    <section id="pricing" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Simple plans. Honest pricing.</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when TradeOS pays for itself. Cancel anytime.</p>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div className={`relative h-full rounded-2xl border p-6 transition-all duration-300 ${p.highlight ? "border-primary/30 bg-card shadow-[0_12px_40px_rgba(37,99,235,0.08)]" : "border-border bg-card hover:border-white/10"}`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">Most popular</div>}
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <Link
                  to="/app"
                  className={`mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-medium transition-all ${p.highlight ? "bg-primary text-primary-foreground hover:bg-blue-700" : "border border-border bg-secondary/80 hover:bg-card"}`}
                >{p.cta}</Link>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" />{f}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <div className="text-center">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Questions, answered.</h2>
          </div>
        </Reveal>
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium">{f.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-4 text-sm text-muted-foreground">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-4 py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card p-12 text-center md:p-20">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <Reveal>
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">Trade with the edge of an institution.</h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">Join 48,000+ traders making sharper, calmer, better-informed decisions every day.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_4px_24px_-2px_rgba(37,99,235,0.6)] transition-all">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-medium hover:bg-card">Book a demo</button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 group">
              <Logo size={36} />
              <div className="flex flex-col text-left">
                <div className="flex items-center font-display leading-none">
                  <span className="text-sm font-extrabold tracking-wider text-white">TRADE</span>
                  <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">OS</span>
                  <span className="ml-1 rounded px-1 py-0.5 text-[8px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-400 tracking-wider uppercase">AI</span>
                </div>
                <span className="text-[7.5px] font-bold tracking-[0.2em] text-muted-foreground/80 uppercase mt-0.5 whitespace-nowrap">
                  TRADE SMART • INVEST BETTER
                </span>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">An AI-powered trading operating system for Indian markets. Built for traders who want to think clearer, decide faster, and learn forever.</p>
            <div className="mt-5 flex gap-3 text-muted-foreground">
              <a className="rounded-md border border-border bg-card p-2 hover:text-foreground" href="#"><Twitter className="h-4 w-4" /></a>
              <a className="rounded-md border border-border bg-card p-2 hover:text-foreground" href="#"><Github className="h-4 w-4" /></a>
              <a className="rounded-md border border-border bg-card p-2 hover:text-foreground" href="#"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Academy", "Roadmap", "Changelog"] },
            { title: "Company", links: ["About", "Customers", "Careers", "Press", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Disclaimer", "SEBI Compliance"] },
          ].map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {c.links.map((l) => <li key={l}><a href="#" className="text-muted-foreground transition-colors hover:text-foreground">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} TradeOS AI. Investments in securities are subject to market risk. Read all related documents carefully.</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" /> All systems normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
