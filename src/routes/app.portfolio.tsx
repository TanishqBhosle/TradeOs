import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill } from "@/components/app/Primitives";
import { portfolioSeries } from "@/lib/mock-data";
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPortfolio, addHolding, removeHolding } from "@/functions/portfolio.functions";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/portfolio")({
  component: Portfolio,
});

const SECTOR_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#A855F7", "#EF4444", "#06B6D4"];

// Live quotes are attached to holdings from the server service

function Portfolio() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ symbol: "", name: "", quantity: "", avgPrice: "" });

  const { data: portfolioData } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => getPortfolio(),
    refetchInterval: 1000,
  });

  const holdings = (portfolioData?.data ?? []) as any[];
  const analytics = (portfolioData as any)?.analytics ?? { portfolioBeta: 1.0, winRate: 0, sharpeRatio: 1.50, totalTrades: 0 };

  // Calculate metrics using live prices
  const totalInvested = holdings.reduce((s, h) => s + h.quantity * h.avgPrice, 0);
  const totalCurrent = holdings.reduce((s, h) => {
    const ltp = h.currentPrice ?? h.avgPrice;
    return s + h.quantity * ltp;
  }, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested * 100).toFixed(2) : "0";

  // Sector allocation for pie chart
  const alloc = holdings.map((h, i) => ({
    name: h.symbol,
    value: Math.round((h.quantity * h.avgPrice / Math.max(totalInvested, 1)) * 100),
    color: SECTOR_COLORS[i % SECTOR_COLORS.length],
  }));

  const addMut = useMutation({
    mutationFn: (data: { symbol: string; name?: string; quantity: number; avgPrice: number }) =>
      addHolding({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setShowAddForm(false);
      setFormData({ symbol: "", name: "", quantity: "", avgPrice: "" });
    },
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => removeHolding({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.avgPrice) return;
    addMut.mutate({
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || undefined,
      quantity: parseInt(formData.quantity),
      avgPrice: parseFloat(formData.avgPrice),
    });
  };

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle={`${holdings.length} holdings · ₹${totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 0 })} total value`}
        actions={
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add Holding
          </button>
        }
      />
      <div className="grid grid-cols-12 gap-4 p-6">
        <Card className="col-span-6 md:col-span-3"><Stat label="Total Value" value={`₹${totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${totalPnl >= 0 ? "+" : ""}${totalPnlPct}%`} positive={totalPnl >= 0} /></Card>
        <Card className="col-span-6 md:col-span-3"><Stat label="Total P&L" value={`${totalPnl >= 0 ? "+" : ""}₹${Math.abs(totalPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${totalPnl >= 0 ? "+" : ""}${totalPnlPct}%`} positive={totalPnl >= 0} /></Card>
        <Card className="col-span-6 md:col-span-3"><Stat label="Invested" value={`₹${totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${holdings.length} stocks`} positive /></Card>
        <Card className="col-span-6 md:col-span-3"><Stat label="Holdings" value={String(holdings.length)} change={totalPnl >= 0 ? "Portfolio healthy" : "Needs attention"} positive={totalPnl >= 0} /></Card>

        <Card className="col-span-12 xl:col-span-8" title="Equity Curve" action={<Pill tone="info">vs NIFTY 50</Pill>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioSeries}>
                <defs>
                  <linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="bb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8" stopOpacity={0.25} /><stop offset="100%" stopColor="#94A3B8" stopOpacity={0} /></linearGradient>
                </defs>
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="benchmark" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} fill="url(#bb)" />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#pp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 xl:col-span-4" title="Stock Allocation">
          <div className="h-64">
            {alloc.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={alloc} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {alloc.map((a, i) => <Cell key={i} fill={a.color} stroke="transparent" />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No holdings to display</div>
            )}
          </div>
        </Card>

        {/* AI Portfolio Analytics */}
        <Card className="col-span-12" title="AI Advanced Analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col p-4 rounded-xl border border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground font-medium">Sharpe Ratio</span>
              <span className="mt-2 text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent tabular-nums">
                {analytics.sharpeRatio.toFixed(2)}
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">Risk-adjusted return ratio. Ideal benchmark: &gt; 1.0.</span>
            </div>
            <div className="flex flex-col p-4 rounded-xl border border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground font-medium">Portfolio Beta</span>
              <span className="mt-2 text-3xl font-bold text-warning tabular-nums">
                {analytics.portfolioBeta.toFixed(2)}
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">Value-weighted sensitivity relative to Nifty 50 benchmark (1.0).</span>
            </div>
            <div className="flex flex-col p-4 rounded-xl border border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground font-medium">Journal Win Rate</span>
              <span className="mt-2 text-3xl font-bold text-success tabular-nums">
                {analytics.winRate}%
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">Live win rate calculated dynamically from {analytics.totalTrades} journaled trades.</span>
            </div>
          </div>
        </Card>

        {/* Add Holding Form */}
        {showAddForm && (
          <Card className="col-span-12 border-primary/30" title="Add New Holding">
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Symbol *</label>
                <input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} placeholder="RELIANCE" required className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Company Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Reliance Industries" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Quantity *</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="50" required min={1} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Avg Price *</label>
                <input type="number" step="0.01" value={formData.avgPrice} onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })} placeholder="2810.00" required min={0.01} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={addMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50">{addMut.isPending ? "Adding..." : "Add"}</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
              </div>
            </form>
          </Card>
        )}

        <Card className="col-span-12" title="Holdings">
          {holdings.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No holdings yet. Click "Add Holding" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="text-left">
                    <th className="py-2 font-medium">Symbol</th><th className="font-medium">Qty</th><th className="font-medium">Avg</th>
                    <th className="font-medium">LTP</th><th className="font-medium">Invested</th><th className="font-medium">Current</th>
                    <th className="font-medium">P&L</th><th className="font-medium">Allocation</th><th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((h, i) => {
                    const ltp = h.currentPrice ?? h.avgPrice;
                    const invested = h.quantity * h.avgPrice;
                    const current = h.quantity * ltp;
                    const pnl = current - invested;
                    const pnlPct = (pnl / invested * 100).toFixed(2);
                    const allocPct = totalInvested > 0 ? Math.round((invested / totalInvested) * 100) : 0;
                    return (
                      <motion.tr key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-secondary/40">
                        <td className="py-2.5 font-medium">{h.symbol}</td>
                        <td className="tabular-nums">{h.quantity}</td>
                        <td className="tabular-nums">₹{h.avgPrice.toFixed(2)}</td>
                        <td className="tabular-nums">₹{ltp.toFixed(2)}</td>
                        <td className="tabular-nums">₹{invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                        <td className="tabular-nums">₹{current.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                        <td className={`tabular-nums ${pnl > 0 ? "text-success" : "text-danger"}`}>{pnl > 0 ? "+" : ""}₹{Math.round(pnl)} ({pnlPct}%)</td>
                        <td><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${allocPct * 4}%` }} /></div><span className="text-xs">{allocPct}%</span></div></td>
                        <td>
                          <button onClick={() => removeMut.mutate(h.id)} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-danger" title="Remove">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
