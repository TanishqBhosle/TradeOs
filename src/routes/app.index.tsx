import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, Tooltip } from "recharts";
import { PageHeader, Card, Stat, Pill } from "@/components/app/Primitives";
import {
  niftySeries, opportunityFeed, sectors, portfolioSeries
} from "@/lib/mock-data";
import { ArrowUpRight, Sparkles, TrendingUp, Bell, Plus, X, Activity } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getDashboardData } from "@/functions/dashboard.functions";
import { addToWatchlist, removeFromWatchlist } from "@/functions/watchlist.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Stagger animation variants
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

function Dashboard() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userName = session?.user?.name?.split(" ")[0] ?? "Trader";

  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardData(),
    refetchInterval: 1000,
  });

  const dashboard = dashData?.data;
  const watchlist = (dashboard?.watchlist ?? []) as any[];
  const holdings = dashboard?.portfolio?.holdings ?? [];
  const totalInvested = dashboard?.portfolio?.totalInvested ?? 0;
  const totalValue = dashboard?.portfolio?.totalValue ?? 0;
  const totalPnl = dashboard?.portfolio?.totalPnl ?? 0;
  const totalPnlPct = dashboard?.portfolio?.totalPnlPct ?? 0;

  // Watchlist add
  const [newSymbol, setNewSymbol] = useState("");
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);

  const addWatchlistMut = useMutation({
    mutationFn: (data: { symbol: string; name?: string }) =>
      addToWatchlist({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setNewSymbol("");
      setShowAddWatchlist(false);
    },
  });

  const removeWatchlistMut = useMutation({
    mutationFn: (id: number) => removeFromWatchlist({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <div>
      {/* Market Ticker Strip */}
      <div className="border-b border-border bg-surface/30 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-1.5 text-xs">
          {[...sectors, ...sectors].map((s, i) => (
            <span key={`${s.name}-${i}`} className="mx-4 inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium text-foreground/80">{s.name}</span>
              <span className={s.change > 0 ? "text-success" : "text-danger"}>
                {s.change > 0 ? "+" : ""}{s.change}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <PageHeader
        title={`${getGreeting()}, ${userName}`}
        subtitle="Markets opened higher. Here's what matters today."
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs hover:bg-card transition-colors">
              <Bell className="h-3.5 w-3.5" /> Alerts
            </button>
            <Link to="/app/coach" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              <Sparkles className="h-3.5 w-3.5" /> Ask AI Coach
            </Link>
          </>
        }
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-4 p-6"
      >
        {/* Market Sentiment */}
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-4 xl:col-span-3">
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Market Sentiment</div>
              <Pill tone="success">Bullish</Pill>
            </div>
            {/* Radial gauge */}
            <div className="mt-4 flex items-center justify-center">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${72 * 3.14} ${100 * 3.14}`}
                    initial={{ strokeDasharray: `0 ${100 * 3.14}` }}
                    animate={{ strokeDasharray: `${72 * 3.14} ${100 * 3.14}` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums">72</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-secondary/60 p-2.5 transition-colors hover:bg-secondary"><div className="text-muted-foreground">FII Flow</div><div className="text-success font-medium mt-0.5">+₹1,842 Cr</div></div>
              <div className="rounded-lg bg-secondary/60 p-2.5 transition-colors hover:bg-secondary"><div className="text-muted-foreground">DII Flow</div><div className="text-success font-medium mt-0.5">+₹920 Cr</div></div>
              <div className="rounded-lg bg-secondary/60 p-2.5 transition-colors hover:bg-secondary"><div className="text-muted-foreground">VIX</div><div className="font-medium mt-0.5">13.4</div></div>
              <div className="rounded-lg bg-secondary/60 p-2.5 transition-colors hover:bg-secondary"><div className="text-muted-foreground">PCR</div><div className="font-medium mt-0.5">1.04</div></div>
            </div>
          </Card>
        </motion.div>

        {/* Nifty Overview */}
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-8 xl:col-span-6">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  NIFTY 50
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="text-3xl font-semibold tabular-nums">22,684.20</div>
                  <div className="flex items-center gap-1 text-xs text-success font-medium"><TrendingUp className="h-3 w-3" />+142.30 (0.63%)</div>
                </div>
              </div>
              <div className="flex gap-1 text-[10px]">
                {["1D", "1W", "1M", "3M", "1Y"].map((t, i) => (
                  <button key={t} className={`rounded-md px-2 py-1 transition-colors ${i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={niftySeries}>
                  <defs>
                    <linearGradient id="nifty-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }} labelStyle={{ color: "#94A3B8" }} />
                  <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={1.5} fill="url(#nifty-area)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Portfolio Summary — from DB */}
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-12 xl:col-span-3">
          <Card>
            <div className="text-xs text-muted-foreground">Portfolio Value</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">
              ₹{totalValue > 0 ? totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—"}
            </div>
            <div className={`text-xs font-medium ${totalPnl >= 0 ? "text-success" : "text-danger"}`}>
              {totalPnl >= 0 ? "+" : ""}₹{Math.abs(totalPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({totalPnlPct}%)
            </div>
            <div className="mt-3 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioSeries}>
                  <defs>
                    <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={1.5} fill="url(#pf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <Link to="/app/portfolio" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">View portfolio <ArrowUpRight className="h-3 w-3" /></Link>
          </Card>
        </motion.div>

        {/* Stocks to Watch — from DB watchlist */}
        <motion.div variants={fadeUp} className="col-span-12 xl:col-span-7">
          <Card
            title="Stocks to Watch"
            action={
              <button
                onClick={() => setShowAddWatchlist(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            }
          >
            {showAddWatchlist && (
              <div className="mb-3 flex items-center gap-2">
                <input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="Symbol (e.g. SBIN)"
                  className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground input-glow focus:border-primary transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSymbol.trim()) {
                      addWatchlistMut.mutate({ symbol: newSymbol.trim() });
                    }
                  }}
                />
                <button
                  onClick={() => newSymbol.trim() && addWatchlistMut.mutate({ symbol: newSymbol.trim() })}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddWatchlist(false)}
                  className="rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {watchlist.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No stocks in your watchlist yet. Click "Add" to get started.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {watchlist.map((w, i) => {
                  const hasMarket = w.price !== undefined;
                  return (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between py-2.5 rounded-lg px-1 hover:bg-secondary/30 transition-colors -mx-1"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                          {w.symbol.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{w.symbol}</div>
                          <div className="truncate text-xs text-muted-foreground">{w.name ?? w.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasMarket && (
                          <>
                            <div className="h-7 w-16">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={niftySeries.slice(i * 4, i * 4 + 14)}>
                                  <Line type="monotone" dataKey="value" stroke={w.change > 0 ? "#22C55E" : "#EF4444"} strokeWidth={1.5} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="w-24 text-right tabular-nums">
                              <div className="text-sm">₹{w.price.toFixed(2)}</div>
                              <div className={`text-xs font-medium ${w.change > 0 ? "text-success" : "text-danger"}`}>{w.change > 0 ? "+" : ""}{w.change}%</div>
                            </div>
                            <Pill tone={w.sentiment === "Bullish" ? "success" : w.sentiment === "Bearish" ? "danger" : "default"}>{w.sentiment}</Pill>
                          </>
                        )}
                        <button
                          onClick={() => removeWatchlistMut.mutate(w.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-danger transition-colors"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Opportunity Feed */}
        <motion.div variants={fadeUp} className="col-span-12 xl:col-span-5">
          <Card title="Opportunity Feed" action={<Pill tone="info"><span className="relative h-1.5 w-1.5 rounded-full bg-primary live-indicator" /> Live</Pill>}>
            <ul className="space-y-2">
              {opportunityFeed.map((o, i) => (
                <motion.li
                  key={o.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-start gap-3 rounded-lg p-2.5 hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <div className={`mt-1.5 h-2 w-2 flex-none rounded-full ${o.level === "high" ? "bg-success" : o.level === "medium" ? "bg-warning" : "bg-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug group-hover:text-foreground transition-colors">{o.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Pill>{o.tag}</Pill>
                      <span>{o.time}</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Sector Heatmap */}
        <motion.div variants={fadeUp} className="col-span-12 xl:col-span-7">
          <Card title="Sector Performance" action={<span className="text-xs text-muted-foreground">Today</span>}>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectors}>
                  <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }} labelStyle={{ color: "#94A3B8" }} />
                  <Bar dataKey="change" radius={[6, 6, 0, 0]}>
                    {sectors.map((s, i) => (
                      <Cell key={i} fill={s.change > 0 ? "#22C55E" : "#EF4444"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
              {sectors.map((s) => (
                <span key={s.name} className={`rounded-md px-2 py-0.5 border transition-colors hover:bg-secondary/60 ${s.change > 0 ? 'border-success/20 text-success/80' : 'border-danger/20 text-danger/80'}`}>
                  {s.name} {s.change > 0 ? "+" : ""}{s.change}%
                </span>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={fadeUp} className="col-span-12 xl:col-span-5">
          <Card className="border-primary/20 bg-primary/[0.03] gradient-border" title="AI Insights" action={<Pill tone="info"><Sparkles className="h-3 w-3" /> GPT-Trade</Pill>}>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-border bg-card/60 p-3.5 hover:bg-card/80 transition-colors">
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Setup detected</div>
                <p className="mt-1.5 text-muted-foreground">TATAMOTORS broke out of a 6-week base on 3.2x volume. Initial target ₹1,020; stop ₹952.</p>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-3.5 hover:bg-card/80 transition-colors">
                <div className="flex items-center gap-1.5 text-xs text-warning font-medium"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Risk note</div>
                <p className="mt-1.5 text-muted-foreground">Your Banking exposure is 32% — above your 25% rule. Consider trimming HDFCBANK or ICICIBANK.</p>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-3.5 hover:bg-card/80 transition-colors">
                <div className="flex items-center gap-1.5 text-xs text-success font-medium"><span className="h-1.5 w-1.5 rounded-full bg-success" />Behavior insight</div>
                <p className="mt-1.5 text-muted-foreground">You've held winning trades 22% longer this month — discipline trending up.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Holdings from DB */}
        <motion.div variants={fadeUp} className="col-span-12">
          <Card title="Your Holdings" action={<Link to="/app/portfolio" className="text-xs text-primary hover:underline font-medium">View all</Link>}>
            {holdings.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No holdings yet. <Link to="/app/portfolio" className="text-primary hover:underline font-medium">Add your first position</Link>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2 font-medium">Symbol</th>
                      <th className="font-medium">Qty</th>
                      <th className="font-medium">Avg</th>
                      <th className="font-medium">LTP</th>
                      <th className="font-medium">P&L</th>
                      <th className="font-medium">Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {holdings.map((h) => {
                      const ltp = (h as any).currentPrice ?? h.avgPrice;
                      const pnl = (ltp - h.avgPrice) * h.quantity;
                      const pnlPct = ((ltp - h.avgPrice) / h.avgPrice * 100).toFixed(2);
                      const alloc = totalInvested > 0 ? Math.round((h.quantity * h.avgPrice / totalInvested) * 100) : 0;
                      return (
                        <tr key={h.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-2.5 font-medium">{h.symbol}</td>
                          <td className="tabular-nums">{h.quantity}</td>
                          <td className="tabular-nums">₹{h.avgPrice.toFixed(2)}</td>
                          <td className="tabular-nums">₹{ltp.toFixed(2)}</td>
                          <td className={`tabular-nums font-medium ${pnl > 0 ? "text-success" : "text-danger"}`}>
                            {pnl > 0 ? "+" : ""}₹{Math.round(pnl)} <span className="text-xs font-normal">({pnlPct}%)</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(alloc * 3, 100)}%` }}
                                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                  className="h-full rounded-full bg-primary"
                                />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">{alloc}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
