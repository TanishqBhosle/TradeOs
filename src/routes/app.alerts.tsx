import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app/Primitives";
import { Bell, Plus, Check, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, addAlert, dismissAlert } from "@/functions/alerts.functions";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/alerts")({
  component: Alerts,
});

function Alerts() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Form states
  const [type, setType] = useState<"Price" | "Risk" | "AI" | "Stop">("Price");
  const [symbol, setSymbol] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warn" | "success" | "danger">("info");

  // Fetch alerts
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => getAlerts(),
  });

  const activeAlerts = alertsData?.data ?? [];

  // Mutations
  const addMut = useMutation({
    mutationFn: (data: {
      type: "Price" | "Risk" | "AI" | "Stop";
      symbol: string;
      message: string;
      severity: "info" | "warn" | "success" | "danger";
    }) => addAlert({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setOpen(false);
      toast.success("Alert rule created successfully!");
      setSymbol("");
      setMessage("");
      setType("Price");
      setSeverity("info");
    },
    onError: (err) => {
      toast.error("Failed to create alert: " + (err as Error).message);
    },
  });

  const dismissMut = useMutation({
    mutationFn: (id: number) => dismissAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert dismissed.");
    },
    onError: (err) => {
      toast.error("Failed to dismiss alert: " + (err as Error).message);
    },
  });

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    addMut.mutate({
      type,
      symbol: symbol.toUpperCase(),
      message,
      severity,
    });
  };

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle={`${activeAlerts.length} active · Real-time monitoring`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-all cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> New Alert
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border border-border rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Create Alert Rule
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAlert} className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "Price" | "Risk" | "AI" | "Stop")}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    >
                      <option value="Price">Price Alert</option>
                      <option value="Risk">Risk Threshold</option>
                      <option value="AI">AI Pattern</option>
                      <option value="Stop">Stop Loss Warning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Symbol / Asset *</label>
                    <input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. RELIANCE"
                      required
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Severity *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as "info" | "warn" | "success" | "danger")}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warn">Warning (Yellow)</option>
                    <option value="danger">Danger (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Trigger Condition *</label>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Crossed above ₹2,950"
                    required
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addMut.isPending}
                  className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {addMut.isPending ? "Creating Rule..." : "Create Alert Rule"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-12 gap-4 p-6">
        <Card className="col-span-12 xl:col-span-8" title="Recent Alerts">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span>Loading alerts...</span>
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Check className="h-8 w-8 text-success/60" />
              <span>All clear. No active alerts.</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {activeAlerts.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3 group"
                >
                  <div
                    className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
                      a.severity === "success"
                        ? "bg-success"
                        : a.severity === "warn"
                          ? "bg-warning"
                          : a.severity === "danger"
                            ? "bg-danger"
                            : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Pill
                        tone={
                          a.severity === "success"
                            ? "success"
                            : a.severity === "warn"
                              ? "warn"
                              : a.severity === "danger"
                                ? "danger"
                                : "info"
                        }
                      >
                        {a.type}
                      </Pill>
                      <span className="text-sm font-semibold">{a.symbol}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{a.time}</span>
                      <button
                        onClick={() => dismissMut.mutate(a.id)}
                        disabled={dismissMut.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-danger rounded hover:bg-secondary cursor-pointer"
                        title="Dismiss Alert"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {a.message}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="col-span-12 xl:col-span-4" title="Alert Rules Index">
          <ul className="space-y-2 text-sm">
            {[
              "RELIANCE crosses ₹2,950",
              "Portfolio drawdown >3% in a day",
              "Any holding hits stop-loss",
              "Banking sector moves >2%",
              "NIFTY VIX above 15",
            ].map((r) => (
              <li
                key={r}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2"
              >
                <span className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  {r}
                </span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
