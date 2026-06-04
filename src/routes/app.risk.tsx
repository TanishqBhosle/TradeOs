import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app/Primitives";
import { Shield, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRiskAnalysis } from "@/functions/risk.functions";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/app/risk")({
  component: Risk,
});

const SECTOR_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#a855f7", "#EF4444", "#0EA5E9"];

function Risk() {
  const { data: riskData, isLoading } = useQuery({
    queryKey: ["risk-analysis"],
    queryFn: () => getRiskAnalysis(),
    refetchInterval: 1000,
  });

  const risk = riskData?.data;
  const checks = risk?.checks ?? [];
  const sectorAllocations = risk?.sectorAllocations ?? [];

  return (
    <div>
      <PageHeader title="Risk Guardian" subtitle="Your real-time portfolio risk monitor" />
      
      {isLoading ? (
        <div className="py-24 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span>Running portfolio risk checks...</span>
        </div>
      ) : !risk ? (
        <div className="py-24 text-center text-sm text-muted-foreground">
          Failed to load portfolio risk statistics.
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 p-6">
          <Card className="col-span-12 xl:col-span-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-primary" /> Portfolio Risk Score
            </div>
            <div className="mt-3 text-5xl font-bold tabular-nums">
              {risk.riskScore}<span className="text-base text-muted-foreground font-normal">/100</span>
            </div>
            <div className="mt-2.5">
              <Pill tone={risk.riskLevel === "Low" ? "success" : risk.riskLevel === "High" ? "danger" : "warn"}>
                {risk.riskLevel} Risk
              </Pill>
            </div>
            <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed">
              {risk.findingsMessage}
            </p>
          </Card>

          <Card className="col-span-12 xl:col-span-8" title="Risk Audits & Checks">
            <ul className="space-y-2.5 mt-2">
              {checks.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-2.5"
                >
                  {c.ok ? (
                    <CheckCircle2 className="h-4 w-4 flex-none text-success mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 flex-none text-warning mt-0.5" />
                  )}
                  <span className="text-xs font-medium">{c.label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="col-span-12 xl:col-span-6" title="Max Drawdown Stress Test">
            <p className="text-xs text-muted-foreground leading-relaxed">
              If the broad market indexes drop 10% in a correction, your portfolio is estimated to drop:
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-danger">{risk.stressDrawdown}</span>
              <span className="text-xs text-muted-foreground">({risk.stressVal})</span>
            </div>
            <div className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
              {risk.betaText}
            </div>
          </Card>

          <Card className="col-span-12 xl:col-span-6 border-warning/20" title="Sector Concentration Risk" action={<TrendingDown className="h-4 w-4 text-warning" />}>
            {sectorAllocations.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active exposure in any sector.
              </div>
            ) : (
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap mt-2">
                <div className="h-28 w-28 flex-none mx-auto md:mx-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={24}
                        outerRadius={44}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sectorAllocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 text-xs w-full">
                  {sectorAllocations.slice(0, 4).map((s, index) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full flex-none"
                          style={{ backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }}
                        />
                        {s.name}
                      </span>
                      <span className="font-semibold tabular-nums">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
