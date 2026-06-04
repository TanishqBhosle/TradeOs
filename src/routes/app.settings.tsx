import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/app/Primitives";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Personalize your TradeOS experience" />
      <div className="grid grid-cols-12 gap-4 p-6">
        <Card className="col-span-12 xl:col-span-6" title="Preferences">
          <div className="space-y-4 text-sm">
            {[
              ["Default chart timeframe", "1D"],
              ["Risk per trade", "2% of capital"],
              ["Max position size", "5% of portfolio"],
              ["Auto-confirm orders", "Off"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="col-span-12 xl:col-span-6" title="Notifications">
          <div className="space-y-3">
            {["Daily market brief", "AI insight alerts", "Stop-loss breaches", "Earnings reminders", "Weekly performance report"].map((n) => (
              <label key={n} className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
                <span>{n}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </label>
            ))}
          </div>
        </Card>
        <Card className="col-span-12 xl:col-span-6" title="Connected brokers">
          <div className="space-y-2 text-sm">
            {[{ b: "Zerodha", s: "Connected · Read-only" }, { b: "Upstox", s: "Not connected" }, { b: "Groww", s: "Not connected" }].map((x) => (
              <div key={x.b} className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                <div>
                  <div className="font-medium">{x.b}</div>
                  <div className="text-xs text-muted-foreground">{x.s}</div>
                </div>
                <button className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-card">Manage</button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="col-span-12 xl:col-span-6" title="Subscription">
          <div className="rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
            <div className="text-xs text-primary">Current plan</div>
            <div className="mt-1 text-2xl font-semibold">Pro · ₹799/mo</div>
            <div className="mt-1 text-xs text-muted-foreground">Renews on Dec 14, 2025</div>
            <button className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">Upgrade to Premium</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
