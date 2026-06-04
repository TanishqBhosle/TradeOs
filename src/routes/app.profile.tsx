import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat } from "@/components/app/Primitives";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/app/profile")({
  component: Profile,
});

function Profile() {
  const { data: session } = useSession();
  const user = session?.user;

  const name = user?.name ?? "Trader";
  const email = user?.email ?? "";
  const plan = ((user as Record<string, unknown>)?.plan as string) ?? "free";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your trading identity" />
      <div className="grid grid-cols-12 gap-4 p-6">
        <Card className="col-span-12 xl:col-span-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-2xl font-semibold">{initials}</div>
            <div className="mt-3 text-lg font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary capitalize">{plan} Plan</div>
            <button className="mt-5 w-full rounded-lg border border-border bg-secondary py-2 text-sm hover:bg-card">Edit profile</button>
          </div>
        </Card>
        <Card className="col-span-12 xl:col-span-8" title="Trading Style">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Style" value="Swing" />
            <Stat label="Avg Hold" value="6.2d" />
            <Stat label="Markets" value="Equity" />
            <Stat label="Capital" value="₹10L+" />
          </div>
          <div className="mt-6">
            <div className="text-xs text-muted-foreground">Strengths (AI-detected)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Trend following", "Patience on entries", "Sector rotation reads", "Pre-earnings setups"].map((s) => (
                <span key={s} className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">{s}</span>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <div className="text-xs text-muted-foreground">Improvement areas</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Exiting winners early", "Monday overtrading", "Position sizing after wins"].map((s) => (
                <span key={s} className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning">{s}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
