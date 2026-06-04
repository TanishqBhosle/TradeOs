import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { watchlists } from "../server/db/schema";
import { addWatchlistSchema, removeWatchlistSchema } from "../server/validation/schemas";
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

export const getWatchlist = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const items = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, user.id))
      .orderBy(watchlists.createdAt);

    // Map watchlist items to attach live simulated quote details
    const liveItems = await Promise.all(
      items.map(async (w) => {
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

    return { success: true, data: liveItems };
  }
);

export const addToWatchlist = createServerFn({ method: "POST" })
  .inputValidator(addWatchlistSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    // Check if already in watchlist
    const existing = await db
      .select()
      .from(watchlists)
      .where(
        and(eq(watchlists.userId, user.id), eq(watchlists.symbol, data.symbol))
      );

    if (existing.length > 0) {
      return { success: false, error: "Symbol already in watchlist" };
    }

    const [item] = await db
      .insert(watchlists)
      .values({
        userId: user.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
      })
      .returning();

    return { success: true, data: item };
  });

export const removeFromWatchlist = createServerFn({ method: "POST" })
  .inputValidator(removeWatchlistSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    await db
      .delete(watchlists)
      .where(
        and(eq(watchlists.id, data.id), eq(watchlists.userId, user.id))
      );
    return { success: true };
  });
