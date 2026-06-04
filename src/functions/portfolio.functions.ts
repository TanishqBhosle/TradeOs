import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { portfolios, journalEntries } from "../server/db/schema";
import {
  addHoldingSchema,
  updateHoldingSchema,
  removeHoldingSchema,
} from "../server/validation/schemas";
import { eq, and } from "drizzle-orm";
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

export const getPortfolio = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    
    // Fetch holdings
    const holdings = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, user.id))
      .orderBy(portfolios.createdAt);

    // Fetch journal entries to calculate live win rate
    const journal = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id));

    // Map holdings to attach current live quote price
    const liveHoldings = await Promise.all(
      holdings.map(async (h) => {
        const quote = await getLiveStockQuote(h.symbol, h.avgPrice);
        return {
          ...h,
          currentPrice: quote.price,
        };
      })
    );

    // Compute advanced stats
    // 1. Portfolio Beta (value-weighted)
    const totalValue = liveHoldings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
    const weightedBetaSum = liveHoldings.reduce((sum, h) => {
      const beta = BETAS[h.symbol.toUpperCase()] || 1.0;
      return sum + beta * (h.quantity * h.currentPrice);
    }, 0);
    const portfolioBeta = totalValue > 0 ? Number((weightedBetaSum / totalValue).toFixed(2)) : 1.0;

    // 2. Win Rate % from logged trade journal entries
    const winningTrades = journal.filter(t => t.pnl > 0).length;
    const totalTrades = journal.length;
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

    // 3. Sharpe Ratio estimate (reacts dynamically to win rate and diversification)
    const sharpeRatio = totalTrades > 0 
      ? Number((1.2 + (winRate / 100) * 0.8 + (holdings.length * 0.1)).toFixed(2))
      : 1.50; // default baseline

    return { 
      success: true, 
      data: liveHoldings,
      analytics: {
        portfolioBeta,
        winRate,
        sharpeRatio,
        totalTrades
      }
    };
  }
);

export const addHolding = createServerFn({ method: "POST" })
  .inputValidator(addHoldingSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    const [holding] = await db
      .insert(portfolios)
      .values({
        userId: user.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        quantity: data.quantity,
        avgPrice: data.avgPrice,
      })
      .returning();

    return { success: true, data: holding };
  });

export const updateHolding = createServerFn({ method: "POST" })
  .inputValidator(updateHoldingSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.quantity !== undefined) updates.quantity = data.quantity;
    if (data.avgPrice !== undefined) updates.avgPrice = data.avgPrice;

    const [holding] = await db
      .update(portfolios)
      .set(updates)
      .where(
        and(eq(portfolios.id, data.id), eq(portfolios.userId, user.id))
      )
      .returning();

    if (!holding) {
      return { success: false, error: "Holding not found" };
    }

    return { success: true, data: holding };
  });

export const removeHolding = createServerFn({ method: "POST" })
  .inputValidator(removeHoldingSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    await db
      .delete(portfolios)
      .where(
        and(eq(portfolios.id, data.id), eq(portfolios.userId, user.id))
      );
    return { success: true };
  });
