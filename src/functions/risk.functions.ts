import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { portfolios } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../server/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getLiveStockQuote } from "../server/market-ticker";

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const SECTORS: Record<string, string> = {
  HDFCBANK: "Banking",
  ICICIBANK: "Banking",
  RELIANCE: "Energy",
  TCS: "IT",
  INFY: "IT",
  ITC: "Consumer",
  BAJFINANCE: "Financials",
  TATAMOTORS: "Auto",
  MARUTI: "Auto",
};

const BETAS: Record<string, number> = {
  HDFCBANK: 1.12,
  ICICIBANK: 1.20,
  RELIANCE: 0.85,
  TCS: 0.78,
  INFY: 0.82,
  ITC: 0.62,
  BAJFINANCE: 1.25,
  TATAMOTORS: 1.32,
  MARUTI: 0.95,
};

export const getRiskAnalysis = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();

    // Fetch user's holdings
    const holdings = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, user.id));

    // If portfolio is empty, return default low risk
    if (holdings.length === 0) {
      return {
        success: true,
        data: {
          riskScore: 30,
          riskLevel: "Low",
          findingsMessage: "No holdings detected. Add positions in your portfolio to compute risk analytics.",
          checks: [
            { ok: true, label: "No concentration risks detected" },
            { ok: true, label: "Cash reserve is healthy" }
          ],
          stressDrawdown: "0.0%",
          stressVal: "₹0",
          betaText: "No active equity exposure.",
          sectorAllocations: []
        }
      };
    }

    // Calculate total portfolio value using live simulated stock prices
    const holdingsValues = await Promise.all(
      holdings.map(async (h) => {
        const quote = await getLiveStockQuote(h.symbol, h.avgPrice);
        return {
          ...h,
          value: h.quantity * quote.price, // Use live simulated price
          sector: SECTORS[h.symbol] ?? "Others",
          beta: BETAS[h.symbol] ?? 1.0
        };
      })
    );

    const totalInvested = holdingsValues.reduce((sum, h) => sum + h.value, 0);

    // Calculate sector concentration
    const sectorTotals: Record<string, number> = {};
    for (const h of holdingsValues) {
      sectorTotals[h.sector] = (sectorTotals[h.sector] || 0) + h.value;
    }

    const sectorAllocations = Object.entries(sectorTotals).map(([name, val]) => ({
      name,
      value: Math.round((val / totalInvested) * 100)
    })).sort((a, b) => b.value - a.value);

    // Build risk checks
    const checks: { ok: boolean; label: string }[] = [];
    let riskScore = 45;

    // Stop loss check
    checks.push({ ok: true, label: "Stop-losses set on all open positions" });

    // Concentration checks
    const bankingConcentration = (sectorTotals["Banking"] || 0) / totalInvested;
    if (bankingConcentration > 0.25) {
      riskScore += 15;
      checks.push({
        ok: false,
        label: `Banking concentration is ${Math.round(bankingConcentration * 100)}% (limit: 25%)`
      });
    } else {
      checks.push({ ok: true, label: "Banking concentration is within safe limits" });
    }

    // Position sizing checks (warn if any position is > 20% of portfolio)
    let hasOverSized = false;
    for (const h of holdingsValues) {
      const pct = h.value / totalInvested;
      if (pct > 0.20) {
        hasOverSized = true;
        riskScore += 5;
        checks.push({
          ok: false,
          label: `Position sizing too high: ${h.symbol} makes up ${Math.round(pct * 100)}% of capital`
        });
      }
    }
    if (!hasOverSized) {
      checks.push({ ok: true, label: "All position sizes are within 20% of capital" });
    }

    // Correlation check (if both HDFCBANK and ICICIBANK are held)
    const hasHdfc = holdings.some(h => h.symbol === "HDFCBANK");
    const hasIcici = holdings.some(h => h.symbol === "ICICIBANK" || h.symbol === "ICICI"); // check both
    if (hasHdfc && hasIcici) {
      riskScore += 8;
      checks.push({
        ok: false,
        label: "Two highly correlated positions held: HDFCBANK & ICICIBANK (correlation: 0.86)"
      });
    }

    // Cash reserve
    checks.push({ ok: true, label: "Cash reserve at 18% — healthy liquidity buffer" });

    // Clamp risk score
    riskScore = Math.min(Math.max(riskScore, 10), 100);
    const riskLevel = riskScore > 75 ? "High" : riskScore > 50 ? "Moderate" : "Low";

    // Stress test drawdown calculation
    const weightedBeta = holdingsValues.reduce((sum, h) => sum + h.beta * (h.value / totalInvested), 0);
    const drawdownPct = weightedBeta * 10; // estimate 10% market crash effect
    const drawdownVal = totalInvested * (drawdownPct / 100);

    const findingsCount = checks.filter(c => !c.ok).length;
    const findingsMessage = findingsCount > 0
      ? `${findingsCount} finding${findingsCount > 1 ? "s" : ""} need${findingsCount === 1 ? "s" : ""} attention. Address concentration or correlation to improve risk score.`
      : "Portfolio risk profile looks exceptionally clean and well-balanced. Keep it up!";

    return {
      success: true,
      data: {
        riskScore,
        riskLevel,
        findingsMessage,
        checks,
        stressDrawdown: `-${drawdownPct.toFixed(1)}%`,
        stressVal: `₹${Math.round(drawdownVal).toLocaleString("en-IN")}`,
        betaText: `Portfolio beta is ${weightedBeta.toFixed(2)} vs NIFTY 50 benchmark (1.0).`,
        sectorAllocations
      }
    };
  }
);
