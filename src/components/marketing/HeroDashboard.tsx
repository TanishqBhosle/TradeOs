import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";
import { niftySeries, sectors, watchlist } from "@/lib/mock-data";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";

export function HeroDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.35], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.96, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0.8, 1]);

  return (
    <div ref={containerRef} className="relative" style={{ perspective: 1200 }}>
      {/* Glow */}
      <div className="absolute inset-x-10 -top-10 -bottom-20 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-50 pointer-events-none" />

      <motion.div
        style={{ rotateX, scale, opacity }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-5xl origin-top"
      >
        <div className="glass-strong rounded-2xl p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-1.5 px-2 pb-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <div className="ml-3 text-xs text-muted-foreground">tradeos.ai / dashboard</div>
          </div>

          <div className="grid grid-cols-12 gap-3 rounded-xl bg-background/80 p-3">
            {/* Sentiment */}
            <div className="col-span-12 rounded-xl border border-border bg-card p-4 md:col-span-4">
              <div className="text-xs text-muted-foreground">Market Sentiment</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl font-semibold">Bullish</div>
                <div className="text-xs text-success">+12%</div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ delay: 1, duration: 1.2 }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {sectors.slice(0, 6).map((s) => (
                  <div key={s.name} className="rounded-md bg-secondary/60 border border-border px-2 py-1.5 hover:bg-secondary transition-colors">
                    <div className="text-[10px] text-muted-foreground">{s.name}</div>
                    <div className={s.change > 0 ? "text-success font-medium" : "text-danger font-medium"}>
                      {s.change > 0 ? "+" : ""}{s.change.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NIFTY chart */}
            <div className="col-span-12 rounded-xl border border-border bg-card p-4 md:col-span-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">NIFTY 50</div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <div className="text-2xl font-semibold tabular-nums">22,684.20</div>
                    <div className="flex items-center gap-1 text-xs text-success font-medium"><TrendingUp className="h-3 w-3" />+142.30 (0.63%)</div>
                  </div>
                </div>
                <div className="flex gap-1 text-[10px]">
                  {["1D", "1W", "1M", "1Y"].map((t, i) => (
                    <button key={t} className={`rounded-md px-2 py-1 transition-colors ${i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="mt-3 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={niftySeries}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Watchlist */}
            <div className="col-span-12 rounded-xl border border-border bg-card p-4 md:col-span-7">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Stocks to Watch</div>
                <div className="text-xs text-muted-foreground">Live</div>
              </div>
              <div className="mt-3 space-y-2">
                {watchlist.slice(0, 4).map((w, i) => (
                  <motion.div
                    key={w.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/20 text-primary text-center text-[10px] leading-7 font-bold">{w.symbol.slice(0, 2)}</div>
                      <div>
                        <div className="text-xs font-semibold">{w.symbol}</div>
                        <div className="text-[10px] text-muted-foreground">{w.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={niftySeries.slice(i * 6, i * 6 + 12)}>
                            <Line type="monotone" dataKey="value" stroke={w.change > 0 ? "#22C55E" : "#EF4444"} strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-xs">₹{w.price.toFixed(2)}</div>
                        <div className={`text-[10px] font-medium ${w.change > 0 ? "text-success" : "text-danger"}`}>{w.change > 0 ? "+" : ""}{w.change}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI insight */}
            <div className="col-span-12 rounded-xl border border-primary/15 bg-primary/[0.03] p-4 md:col-span-5">
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Sparkles className="h-3.5 w-3.5" /> AI Insight
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Banking momentum is turning positive. <span className="text-foreground font-semibold">3 stocks</span> in your watchlist match a high-probability breakout setup.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  {["HDFCBANK", "ICICIBANK", "SBIN"].map((s) => (
                    <span key={s} className="rounded-md border border-border bg-card px-2 py-0.5">{s}</span>
                  ))}
                </div>
                <button className="flex items-center gap-1 text-primary hover:underline">View <ArrowUpRight className="h-3 w-3" /></button>
              </div>
              <div className="mt-3 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectors.slice(0, 8)}>
                    <Bar dataKey="change" radius={3}>
                      {sectors.slice(0, 8).map((s, i) => (
                        <rect key={i} fill={s.change > 0 ? "#22C55E" : "#EF4444"} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="glass-strong absolute -left-4 top-1/3 hidden w-52 rounded-xl p-3 shadow-xl md:block"
        >
          <div className="flex items-center gap-2 text-xs text-success"><span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" /> Live signal</div>
          <div className="mt-2 text-sm font-semibold">TATAMOTORS</div>
          <div className="text-xs text-muted-foreground">Breakout confirmed · 3.2x volume</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-semibold tabular-nums">₹982.40</span>
            <span className="text-xs text-success">+4.21%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="glass-strong absolute -right-4 top-12 hidden w-56 rounded-xl p-3 shadow-xl md:block"
        >
          <div className="flex items-center gap-2 text-xs text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Risk Guardian
          </div>
          <div className="mt-2 text-sm">Banking exposure at <span className="font-semibold">32%</span> — consider rebalancing.</div>
          <button className="mt-2 w-full rounded-md bg-secondary py-1 text-xs">Review portfolio</button>
        </motion.div>
      </motion.div>
    </div>
  );
}
