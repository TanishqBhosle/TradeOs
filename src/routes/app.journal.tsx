import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill } from "@/components/app/Primitives";
import { motion } from "framer-motion";
import { Plus, Trash2, Calendar, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJournal, addJournalEntry, deleteJournalEntry } from "@/functions/journal.functions";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/journal")({
  component: Journal,
});

function Journal() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Form states
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [pnl, setPnl] = useState("");
  const [grade, setGrade] = useState("A");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("Today");

  // Fetch journal entries
  const { data: journalData, isLoading } = useQuery({
    queryKey: ["journal"],
    queryFn: () => getJournal(),
  });

  const entries = journalData?.data ?? [];

  // Mutations
  const addMut = useMutation({
    mutationFn: (data: {
      symbol: string;
      side: "BUY" | "SELL";
      qty: number;
      price: number;
      pnl: number;
      grade: string;
      date: string;
      notes?: string;
    }) => addJournalEntry({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      setOpen(false);
      toast.success("Trade logged successfully!");
      // Reset form
      setSymbol("");
      setSide("BUY");
      setQty("");
      setPrice("");
      setPnl("");
      setGrade("A");
      setNotes("");
      setDate("Today");
    },
    onError: (err) => {
      toast.error("Failed to log trade: " + (err as Error).message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteJournalEntry({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      toast.success("Trade log deleted.");
    },
    onError: (err) => {
      toast.error("Failed to delete log: " + (err as Error).message);
    },
  });

  const handleLogTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !qty || !price || !pnl) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addMut.mutate({
      symbol: symbol.toUpperCase(),
      side,
      qty: parseInt(qty),
      price: parseFloat(price),
      pnl: parseFloat(pnl),
      grade,
      date,
      notes: notes.trim() || undefined,
    });
  };

  // Compute stats
  const totalTrades = entries.length;
  const winningTrades = entries.filter((e) => e.pnl > 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  
  // Calculate average profit factor (sum of gains / sum of losses)
  const gains = entries.filter((e) => e.pnl > 0).reduce((sum, e) => sum + e.pnl, 0);
  const losses = Math.abs(entries.filter((e) => e.pnl < 0).reduce((sum, e) => sum + e.pnl, 0));
  const profitFactor = losses > 0 ? (gains / losses).toFixed(2) : gains > 0 ? "Infinite" : "0.00";

  return (
    <div>
      <PageHeader
        title="Trade Journal"
        subtitle="Your edge, documented."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-all cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> Log Trade
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border border-border rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Log Trade Entry
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLogTrade} className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Symbol *</label>
                    <input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. INFY"
                      required
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Side *</label>
                    <select
                      value={side}
                      onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="Qty"
                      required
                      min="1"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price"
                      required
                      min="0.1"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">P&L (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      value={pnl}
                      onChange={(e) => setPnl(e.target.value)}
                      placeholder="Net P&L"
                      required
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Execution Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    >
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D (Mistake)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Date Note</label>
                    <input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. Today, Yesterday"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your setup, emotions, or checklist adherence..."
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addMut.isPending}
                  className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {addMut.isPending ? "Logging Trade..." : "Log Trade Entry"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-12 gap-4 p-6">
        <Card className="col-span-6 md:col-span-3">
          <Stat label="Win Rate" value={`${winRate}%`} change={`${winningTrades} of ${totalTrades} trades`} positive={winRate >= 50} />
        </Card>
        <Card className="col-span-6 md:col-span-3">
          <Stat label="Net Profit" value={`₹${entries.reduce((sum, e) => sum + e.pnl, 0).toLocaleString("en-IN")}`} change="Overall P&L" positive={entries.reduce((sum, e) => sum + e.pnl, 0) >= 0} />
        </Card>
        <Card className="col-span-6 md:col-span-3">
          <Stat label="Profit Factor" value={profitFactor} change="Gains vs Losses" positive={parseFloat(profitFactor) >= 1.5 || profitFactor === "Infinite"} />
        </Card>
        <Card className="col-span-6 md:col-span-3">
          <Stat label="Logged Trades" value={totalTrades.toString()} change="All-time documented" positive />
        </Card>

        <Card className="col-span-12" title="Journal Entries">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span>Loading trade journal...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
              <span>No trade logs documented yet. Click "Log Trade" above.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-secondary/40 p-4 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill tone={e.side === "BUY" ? "success" : "danger"}>{e.side}</Pill>
                      <div className="font-semibold text-sm">{e.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.qty} shares @ ₹{e.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Pill tone={e.grade.startsWith("A") ? "success" : e.grade.startsWith("B") ? "default" : "warn"}>
                        Grade {e.grade}
                      </Pill>
                      <span className={`tabular-nums text-sm font-semibold ${e.pnl > 0 ? "text-success" : "text-danger"}`}>
                        {e.pnl > 0 ? "+" : ""}₹{e.pnl.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground w-16 text-right">{e.date}</span>
                      <button
                        onClick={() => deleteMut.mutate(e.id)}
                        disabled={deleteMut.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-danger rounded hover:bg-secondary cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {e.notes && (
                    <p className="mt-2 text-xs text-muted-foreground border-t border-border/40 pt-2 leading-relaxed">
                      {e.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
