import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app/Primitives";
import { 
  Search, Filter, Download, ArrowUpRight, TrendingUp, TrendingDown, 
  X, HelpCircle, Layers, Activity, DollarSign, PieChart as PieIcon, Briefcase, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getScannerResults } from "@/functions/scanner.functions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  listedBonds, productsSuite, largeCapMovers, smallCapMovers, 
  setupCompanies, getCompanyDetails, CompanyDetails 
} from "@/lib/instruments-data";
import { sectors } from "@/lib/mock-data";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie
} from "recharts";

export const Route = createFileRoute("/app/scanner")({
  component: Scanner,
});

const presets = ["All", "Breakouts", "Reversals", "Volume Surge", "52W Highs", "Oversold"];
const mainTabs = ["Movers & Screeners", "Bonds & Instruments", "Custom Advanced Scanners"];

function Scanner() {
  const [activeTab, setActiveTab] = useState(mainTabs[0]);
  const [selectedSetup, setSelectedSetup] = useState<string>("Resistance Breakouts");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  
  // Real-time ticking trigger
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Preset Scanner Table State
  const [query, setQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("All");

  const { data: scannerData, isLoading, refetch } = useQuery({
    queryKey: ["scanner", query, selectedPreset],
    queryFn: () => getScannerResults({
      data: {
        query: query.trim() || undefined,
        preset: selectedPreset === "All" ? undefined : selectedPreset
      }
    }),
  });

  const results = scannerData?.data ?? [];

  useEffect(() => {
    refetch();
  }, [query, selectedPreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = () => {
    toast.info("Scanner export is a Pro feature. Processing download...");
  };

  // Generate dynamic ticks for movers list
  const getTickedPrice = (base: number, seedStr: string) => {
    const seed = tick + seedStr.charCodeAt(0) * 100;
    const drift = Math.sin(seed / 5) * 0.0015 + (Math.random() - 0.5) * 0.0005;
    const tickPrice = base * (1 + drift);
    const change = tickPrice - base;
    const changePct = (change / base) * 100;
    return {
      price: Number(tickPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePct: Number(changePct.toFixed(2))
    };
  };

  // Resolve company detail data
  const companyDetails: CompanyDetails | null = selectedCompany 
    ? getCompanyDetails(selectedCompany) 
    : null;

  // Generate mock intraday chart for selected company
  const mockChartData = companyDetails ? Array.from({ length: 20 }).map((_, i) => {
    const base = parseFloat(companyDetails.fundamentals.peRatio) * 100;
    return {
      time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15 || "00"}`,
      value: Number((base + Math.sin(i / 2) * 12 + (Math.random() - 0.5) * 4).toFixed(2))
    };
  }) : [];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <PageHeader
        title="Instruments & Trading Screen"
        subtitle="Explore products, listed sovereign bonds, and live technical breakout screens."
      />

      {/* Modern SaaS Tab Header */}
      <div className="border-b border-border bg-card/10 px-6 py-2">
        <div className="flex gap-2">
          {mainTabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedCompany(null);
                }}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {active && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* TAB 1: MOVERS & TRADING SCREEN */}
        {activeTab === mainTabs[0] && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Column: Products Suite & Trading Screen */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              
              {/* Products & Tools Grid */}
              <Card title="Products & Digital Tools" className="relative overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {productsSuite.map((p) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => toast.success(`Launching ${p.name}...`)}
                      className="group flex flex-col justify-between p-3.5 rounded-xl border border-border bg-secondary/25 hover:bg-secondary/40 hover:border-primary/20 transition-all cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground/90 group-hover:text-primary transition-colors">{p.name}</span>
                          {p.badge && (
                            <span className="rounded bg-primary/10 px-1 py-0.5 text-[8px] font-bold text-primary tracking-wider uppercase">{p.badge}</span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground leading-snug">{p.description}</p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-end text-[9px] font-semibold text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        Access Tool <ArrowUpRight className="ml-0.5 h-3 w-3" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Trading Screen Technical filters */}
              <Card title="Trading Screen (Setup Scanner)" className="relative">
                <p className="text-xs text-muted-foreground -mt-1 leading-relaxed">
                  Surface real-time breakouts, indicators, and volume-supported technical patterns.
                </p>

                <div className="mt-4 grid grid-cols-12 gap-4">
                  {/* Bullish & Bearish filter boxes */}
                  <div className="col-span-12 md:col-span-4 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-success/80 mb-1.5">Bullish Setups</div>
                      <div className="flex flex-col gap-1.5">
                        {["Resistance Breakouts", "MACD above Signal Line"].map((s) => {
                          const active = selectedSetup === s;
                          return (
                            <button
                              key={s}
                              onClick={() => {
                                setSelectedSetup(s);
                                setSelectedCompany(null);
                              }}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                                active 
                                  ? "bg-success/10 border-success/30 text-success" 
                                  : "border-border bg-secondary/15 text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                              }`}
                            >
                              <span>{s}</span>
                              <ChevronIcon tone={active ? "success" : "muted"} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-danger/80 mb-1.5">Bearish Setups</div>
                      <div className="flex flex-col gap-1.5">
                        {["RSI Overbought", "RSI Oversold"].map((s) => {
                          const active = selectedSetup === s;
                          return (
                            <button
                              key={s}
                              onClick={() => {
                                setSelectedSetup(s);
                                setSelectedCompany(null);
                              }}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                                active 
                                  ? "bg-danger/10 border-danger/30 text-danger" 
                                  : "border-border bg-secondary/15 text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                              }`}
                            >
                              <span>{s}</span>
                              <ChevronIcon tone={active ? "danger" : "muted"} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right matching stocks panel */}
                  <div className="col-span-12 md:col-span-8 rounded-xl border border-border bg-secondary/15 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="text-xs font-bold text-foreground">{selectedSetup}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Live Feed</span>
                      </div>

                      <div className="divide-y divide-border/30 mt-1 max-h-[190px] overflow-y-auto pr-1 no-scrollbar">
                        {setupCompanies[selectedSetup]?.map((comp) => {
                          const ticked = getTickedPrice(comp.price, comp.symbol);
                          const green = ticked.changePct >= 0;
                          return (
                            <div 
                              key={comp.symbol}
                              onClick={() => setSelectedCompany(comp.symbol)}
                              className="group flex items-center justify-between py-2.5 cursor-pointer hover:bg-secondary/40 px-2 rounded-lg transition-colors mt-1"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-indigo-400 group-hover:bg-primary group-hover:text-white transition-all">
                                  {comp.symbol.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{comp.name}</div>
                                  <div className="text-[10px] text-muted-foreground">Cap: {comp.marketCap}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold tabular-nums">₹{ticked.price}</div>
                                <div className={`text-[10px] font-bold tabular-nums ${green ? "text-success" : "text-danger"}`}>
                                  {green ? "+" : ""}{ticked.changePct}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground pt-3 border-t border-border/20 flex items-center gap-1">
                      <Info className="h-3 w-3 text-primary" /> Click any company row to reveal advanced corporate fundamentals, balance sheets, and shareholding visualizer.
                    </div>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Column: Trending Sectors */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              
              <Card title="Sectors Trending Today" action={<Pill tone="info">Live</Pill>}>
                <div className="space-y-2 mt-3">
                  {sectors.map((s, index) => {
                    const positive = s.change >= 0;
                    return (
                      <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 border border-border/10 transition-colors">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`h-1.5 w-1.5 rounded-full ${positive ? "bg-success" : "bg-danger"}`} />
                          <span className="font-semibold">{s.name} Sector</span>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${positive ? "text-success" : "text-danger"}`}>
                          {positive ? "+" : ""}{s.change.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>

            </div>

          </div>
        )}

        {/* TAB 2: BONDS & INSTRUMENTS */}
        {activeTab === mainTabs[1] && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Listed Bonds Card */}
            <Card title="Popular Listed Bonds" className="col-span-12 xl:col-span-6 overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                    <tr className="text-left">
                      <th className="px-5 py-3 font-semibold">Bond Symbol / Issuer</th>
                      <th className="font-semibold">Rating</th>
                      <th className="font-semibold">Coupon Rate</th>
                      <th className="font-semibold">Yield (YTM)</th>
                      <th className="font-semibold">Maturity</th>
                      <th className="px-5 font-semibold text-right">Min Invest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {listedBonds.map((b) => (
                      <tr key={b.symbol} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-foreground">{b.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{b.name}</div>
                        </td>
                        <td>
                          <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${
                            b.rating === "Sovereign" ? "bg-amber-500/10 text-amber-400" : "bg-primary/10 text-primary"
                          }`}>
                            {b.rating}
                          </span>
                        </td>
                        <td className="font-semibold tabular-nums">{b.couponPct.toFixed(2)}%</td>
                        <td className="font-bold text-success tabular-nums">{b.yieldPct.toFixed(2)}%</td>
                        <td className="text-muted-foreground">{b.maturity}</td>
                        <td className="px-5 text-right font-semibold tabular-nums">₹{b.minInvestment.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Movers Today Card (Large and Small Cap) */}
            <div className="col-span-12 xl:col-span-6 space-y-6">
              <Card title="Popular Movers Today" action={<span className="text-[10px] text-muted-foreground font-semibold">Large & Small Caps</span>}>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* Large Cap Gainers */}
                  <div className="rounded-xl border border-border bg-secondary/15 p-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-success tracking-wider mb-2">
                      <TrendingUp className="h-3.5 w-3.5" /> Large Cap Gainers
                    </div>
                    <div className="space-y-2">
                      {largeCapMovers.gainers.map((stock) => {
                        const ticked = getTickedPrice(stock.price, stock.symbol);
                        return (
                          <div 
                            key={stock.symbol}
                            onClick={() => setSelectedCompany(stock.symbol)}
                            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-border/10 cursor-pointer hover:border-success/30 hover:bg-success/5 transition-all"
                          >
                            <div className="text-xs">
                              <div className="font-bold">{stock.symbol}</div>
                              <div className="text-[9px] text-muted-foreground">{stock.marketCap}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums">₹{ticked.price}</div>
                              <span className="text-[10px] font-bold text-success tabular-nums animate-pulse">+{ticked.changePct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Small Cap Gainers */}
                  <div className="rounded-xl border border-border bg-secondary/15 p-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-success tracking-wider mb-2">
                      <TrendingUp className="h-3.5 w-3.5" /> Small Cap Gainers
                    </div>
                    <div className="space-y-2">
                      {smallCapMovers.gainers.map((stock) => {
                        const ticked = getTickedPrice(stock.price, stock.symbol);
                        return (
                          <div 
                            key={stock.symbol}
                            onClick={() => setSelectedCompany(stock.symbol)}
                            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-border/10 cursor-pointer hover:border-success/30 hover:bg-success/5 transition-all"
                          >
                            <div className="text-xs">
                              <div className="font-bold">{stock.symbol}</div>
                              <div className="text-[9px] text-muted-foreground">{stock.marketCap}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums">₹{ticked.price}</div>
                              <span className="text-[10px] font-bold text-success tabular-nums animate-pulse">+{ticked.changePct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </Card>
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOM ADVANCED SCANNERS (PRESETS TABLE) */}
        {activeTab === mainTabs[2] && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symbols, setups, or sectors…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">/</kbd>
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const active = selectedPreset === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPreset(p)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-card"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <Card className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                    <tr className="text-left">
                      <th className="px-5 py-3 font-semibold">Symbol</th>
                      <th className="font-semibold">Setup</th>
                      <th className="font-semibold">Conviction</th>
                      <th className="font-semibold">Move</th>
                      <th className="font-semibold">Volume</th>
                      <th className="font-semibold">Risk</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                            <span>Scanning NSE & BSE markets...</span>
                          </div>
                        </td>
                      </tr>
                    ) : results.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                          No matching setups found. Try adjusting your search query or preset filter.
                        </td>
                      </tr>
                    ) : (
                      results.map((r, i) => (
                        <tr
                          key={r.symbol}
                          className="border-t border-border/30 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-indigo-400">
                                {r.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold">{r.symbol}</div>
                                <div className="text-[10px] text-muted-foreground">{r.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted-foreground">{r.setup}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                <div className="h-full bg-primary" style={{ width: `${r.score}%` }} />
                              </div>
                              <span className="tabular-nums font-semibold">{r.score}</span>
                            </div>
                          </td>
                          <td className={`tabular-nums font-bold ${r.change > 0 ? "text-success" : "text-danger"}`}>
                            {r.change > 0 ? "+" : ""}{r.change}%
                          </td>
                          <td className="tabular-nums text-muted-foreground">{r.volume}</td>
                          <td>
                            <Pill tone={r.risk === "Low" ? "success" : r.risk === "High" ? "danger" : "warn"}>
                              {r.risk}
                            </Pill>
                          </td>
                          <td className="pr-5 text-right">
                            <button 
                              onClick={() => setSelectedCompany(r.symbol)}
                              className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                            >
                              Analyze
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* DETAILED COMPANY ANALYTICS DRAWER PANEL */}
      <AnimatePresence>
        {selectedCompany && companyDetails && (
          <>
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCompany(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-surface border-l border-border z-50 overflow-y-auto no-scrollbar shadow-2xl p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-xs font-bold text-indigo-400">
                      {companyDetails.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">{companyDetails.sector}</span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-foreground">{companyDetails.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6 mt-5">
                
                {/* Performance Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" /> Live Chart Performance</span>
                    <div className="flex gap-1">
                      {["1D", "1W", "1M"].map((t, idx) => (
                        <span key={t} className={`rounded px-1.5 py-0.5 text-[9px] cursor-pointer ${idx === 0 ? "bg-primary/20 text-primary" : "hover:bg-secondary"}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="h-40 w-full bg-secondary/10 rounded-xl border border-border/40 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData}>
                        <defs>
                          <linearGradient id="live-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.08)", fontSize: 10 }} />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#live-area)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fundamentals Grid */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-primary" /> Corporate Fundamentals</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { label: "Market Capital", value: companyDetails.fundamentals.marketCap },
                      { label: "P/E Ratio", value: companyDetails.fundamentals.peRatio },
                      { label: "P/B Ratio", value: companyDetails.fundamentals.pbRatio },
                      { label: "Industry P/E", value: companyDetails.fundamentals.industryPe },
                      { label: "Debt to Equity", value: companyDetails.fundamentals.debtToEquity },
                      { label: "Beta Value", value: "0.85" }
                    ].map((f) => (
                      <div key={f.label} className="rounded-lg border border-border/30 bg-secondary/20 p-2.5">
                        <div className="text-[10px] text-muted-foreground font-semibold">{f.label}</div>
                        <div className="text-xs font-bold mt-0.5 text-foreground">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials with toggle */}
                <CompanyFinancials financials={companyDetails.financials} />

                {/* About Company */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-primary" /> About {companyDetails.symbol}</div>
                  <div className="rounded-lg border border-border/30 bg-secondary/15 p-3 text-xs leading-relaxed text-muted-foreground">
                    <p>{companyDetails.description}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] border-t border-border/20 pt-2 font-semibold">
                      <div>CEO: <span className="text-foreground">{companyDetails.ceo}</span></div>
                      <div>Founded: <span className="text-foreground">{companyDetails.founded}</span></div>
                      <div>Staff: <span className="text-foreground">{companyDetails.employees}</span></div>
                    </div>
                  </div>
                </div>

                {/* Shareholding Pattern stacked representation */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><PieIcon className="h-3.5 w-3.5 text-primary" /> Shareholding Distribution</div>
                  <div className="rounded-lg border border-border/30 bg-secondary/15 p-3">
                    <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex">
                      {companyDetails.shareholding.map((s, idx) => {
                        const colors = ["#6366f1", "#10b981", "#f59e0b", "#94a3b8"];
                        return (
                          <div 
                            key={s.name} 
                            style={{ width: `${s.value}%`, backgroundColor: colors[idx] }} 
                            title={`${s.name}: ${s.value}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[10px] font-semibold">
                      {companyDetails.shareholding.map((s, idx) => {
                        const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-zinc-400"];
                        return (
                          <div key={s.name} className="flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${colors[idx]}`} />
                            <span className="text-muted-foreground">{s.name}:</span>
                            <span className="text-foreground font-bold">{s.value}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Similar Stocks Comparison */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-primary" /> Peers & Similar Stocks</div>
                  <div className="grid grid-cols-3 gap-2">
                    {companyDetails.similarStocks.map((sim) => (
                      <div 
                        key={sim.symbol} 
                        onClick={() => setSelectedCompany(sim.symbol)}
                        className="rounded-lg border border-border/30 bg-secondary/10 p-2 text-center hover:border-primary/20 transition-all cursor-pointer group"
                      >
                        <span className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors">{sim.symbol}</span>
                        <div className={`text-[10px] font-bold mt-0.5 ${sim.change >= 0 ? "text-success" : "text-danger"}`}>
                          {sim.change >= 0 ? "+" : ""}{sim.change}%
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{sim.mcap}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Financials Segment with interactive toggle
function CompanyFinancials({ financials }: { financials: CompanyDetails["financials"] }) {
  const [period, setPeriod] = useState<"yearly" | "quarterly">("yearly");
  const data = period === "yearly" ? financials.yearly : financials.quarterly;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-primary" /> Financial Metrics (Cr)</span>
        <div className="bg-secondary/40 rounded-lg p-0.5 flex">
          <button 
            onClick={() => setPeriod("yearly")} 
            className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${period === "yearly" ? "bg-zinc-800 text-foreground" : "text-muted-foreground"}`}
          >
            Yearly
          </button>
          <button 
            onClick={() => setPeriod("quarterly")} 
            className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${period === "quarterly" ? "bg-zinc-800 text-foreground" : "text-muted-foreground"}`}
          >
            Quarterly
          </button>
        </div>
      </div>

      <div className="h-44 w-full bg-secondary/10 rounded-xl border border-border/40 p-2.5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey={period === "yearly" ? "year" : "quarter"} tick={{ fill: "#a1a1aa", fontSize: 9 }} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 9 }} width={36} />
            <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.08)", fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 9 }} iconType="circle" />
            <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[2, 2, 0, 0]} />
            <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[2, 2, 0, 0]} />
            <Bar dataKey="netWorth" fill="#f59e0b" name="Net Worth" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChevronIcon({ tone }: { tone: "success" | "danger" | "muted" }) {
  const color = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-muted-foreground";
  return (
    <svg viewBox="0 0 24 24" className={`h-3 w-3 ${color}`} fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
