import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { watchlists, portfolios, chatHistory, aiUsage } from "../server/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();

    // Fetch user's watchlist
    const userWatchlist = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, user.id))
      .orderBy(watchlists.createdAt);

    // Map watchlist to attach live price details
    const liveWatchlist = await Promise.all(
      userWatchlist.map(async (w) => {
        const quote = await getLiveStockQuote(w.symbol);
        const sentiment = 
          quote.changePct > 0.5 ? "Bullish" : 
          quote.changePct < -0.5 ? "Bearish" : "Neutral";
        return {
          ...w,
          price: quote.price,
          change: quote.changePct,
          sentiment,
        };
      })
    );

    // Fetch user's portfolio
    const userPortfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, user.id));

    // Map portfolio to attach live quotes and profits
    const liveHoldings = await Promise.all(
      userPortfolio.map(async (p) => {
        const quote = await getLiveStockQuote(p.symbol, p.avgPrice);
        const currentPrice = quote.price;
        const currentPnl = (currentPrice - p.avgPrice) * p.quantity;
        const currentPnlPct = p.avgPrice > 0 ? ((currentPrice - p.avgPrice) / p.avgPrice) * 100 : 0;
        return {
          ...p,
          currentPrice,
          currentPnl: Number(currentPnl.toFixed(2)),
          currentPnlPct: Number(currentPnlPct.toFixed(2)),
        };
      })
    );

    // Calculate portfolio summary
    const totalInvested = userPortfolio.reduce(
      (sum, h) => sum + h.quantity * h.avgPrice,
      0
    );

    const totalValue = liveHoldings.reduce(
      (sum, h) => sum + h.quantity * h.currentPrice,
      0
    );

    const totalPnl = totalValue - totalInvested;
    const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Fetch today's AI usage
    const today = new Date().toISOString().split("T")[0];
    const usage = await db
      .select()
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, user.id), eq(aiUsage.date, today)));

    // Fetch recent chat activity
    const recentChats = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, user.id))
      .orderBy(desc(chatHistory.createdAt))
      .limit(5);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: (user as Record<string, unknown>).plan ?? "free",
        },
        watchlist: liveWatchlist,
        portfolio: {
          holdings: liveHoldings,
          totalInvested: Number(totalInvested.toFixed(2)),
          totalValue: Number(totalValue.toFixed(2)),
          totalPnl: Number(totalPnl.toFixed(2)),
          totalPnlPct: Number(totalPnlPct.toFixed(2)),
          holdingCount: userPortfolio.length,
        },
        aiUsage: {
          requestsToday: usage[0]?.requestCount ?? 0,
          limit: 20,
        },
        recentChats,
      },
    };
  }
);
