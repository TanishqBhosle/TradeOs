import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { chatHistory, aiUsage, watchlists, portfolios } from "../server/db/schema";
import { sendMessageSchema } from "../server/validation/schemas";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../server/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { isGeminiEnabled, startGeminiChat } from "../server/gemini";

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// ─── AI Response Generator Fallback (Rule-based) ─────────────────────────────
function generateFallbackAiResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("breakout") || lower.includes("setup")) {
    return "Based on current market conditions, I see a few potential setups forming. TATAMOTORS is showing a breakout pattern above its 6-week consolidation with 3.2x volume. DIVISLAB has a bullish RSI divergence on the 1H chart. Would you like me to analyze position sizing for any of these?";
  }

  if (lower.includes("risk") || lower.includes("stop")) {
    return "For risk management, I recommend keeping position sizes at 2-5% of your total capital per trade. Your current stop-loss levels look reasonable. Remember: the goal isn't to avoid all losses — it's to keep losses small and let winners run. Would you like me to calculate specific position sizes?";
  }

  if (lower.includes("portfolio") || lower.includes("holding")) {
    return "Your portfolio shows good diversification across sectors, but I notice your Banking exposure is at 32% — above the recommended 25% threshold. Consider trimming HDFCBANK or ICICIBANK to reduce concentration risk. Your overall risk score is 68/100 (Moderate). Want me to suggest a rebalancing strategy?";
  }

  if (lower.includes("nifty") || lower.includes("market")) {
    return "The NIFTY 50 is currently trading above its 20-DMA with bullish momentum. Key levels to watch: Support at 22,500, Resistance at 22,750. FII flows have been positive for 3 consecutive sessions. Banking and Auto sectors are showing the strongest momentum. VIX is at 13.4 which indicates low fear in the market.";
  }

  if (lower.includes("learn") || lower.includes("beginner") || lower.includes("how")) {
    return "Great question! I'd recommend starting with the Trading Academy — specifically the 'Technical Analysis Foundations' module. Key concepts to master first: 1) Support & Resistance, 2) Candlestick patterns, 3) Moving averages, 4) Volume analysis. Would you like me to explain any of these in detail?";
  }

  return "That's an interesting question. Let me break it down for you: In the current market environment, it's important to focus on quality setups with clear risk/reward ratios. I'd suggest looking at stocks showing strong momentum with volume confirmation. Would you like me to dive deeper into any specific stock or concept?";
}

// ─── Chat Functions ───────────────────────────────────────────────────────────

export const getChatHistory = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const messages = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, user.id))
      .orderBy(chatHistory.createdAt);
    return { success: true, data: messages };
  }
);

export const getChatThreads = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();

    // Get distinct threads with their latest message
    const allMessages = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, user.id))
      .orderBy(desc(chatHistory.createdAt));

    // Group by threadId and get the latest
    const threadMap = new Map<
      string,
      { threadId: string; threadTitle: string | null; lastMessage: string; createdAt: Date }
    >();

    for (const msg of allMessages) {
      if (!threadMap.has(msg.threadId)) {
        threadMap.set(msg.threadId, {
          threadId: msg.threadId,
          threadTitle: msg.threadTitle,
          lastMessage: msg.message,
          createdAt: msg.createdAt,
        });
      }
    }

    return { success: true, data: Array.from(threadMap.values()) };
  }
);

export const getThreadMessages = createServerFn({ method: "POST" })
  .inputValidator(z.object({ threadId: z.string() }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    const messages = await db
      .select()
      .from(chatHistory)
      .where(
        and(
          eq(chatHistory.userId, user.id),
          eq(chatHistory.threadId, data.threadId)
        )
      )
      .orderBy(chatHistory.createdAt);
    return { success: true, data: messages };
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(sendMessageSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    // 1. Fetch thread history before saving new message
    const prevMessages = await db
      .select()
      .from(chatHistory)
      .where(
        and(
          eq(chatHistory.userId, user.id),
          eq(chatHistory.threadId, data.threadId)
        )
      )
      .orderBy(chatHistory.createdAt);

    const historyData = prevMessages.map((m) => ({
      role: (m.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: m.message }],
    }));

    // 2. Fetch user's current context (watchlist & portfolio)
    const userWatchlist = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, user.id));

    const userPortfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, user.id));

    // Save user message
    await db.insert(chatHistory).values({
      userId: user.id,
      threadId: data.threadId,
      threadTitle: data.threadTitle,
      role: "user",
      message: data.message,
    });

    // 3. Construct system prompt with context
    const watchlistStr = userWatchlist.map((w) => w.symbol).join(", ") || "None";
    const holdingsStr =
      userPortfolio
        .map((p) => `${p.symbol} (${p.quantity} shares @ ₹${p.avgPrice.toFixed(2)})`)
        .join(", ") || "None";

    const systemInstruction = `You are TradeOS AI Coach, an expert financial advisor specializing in the Indian stock market (NSE/BSE).
Your goal is to help beginner and intermediate traders learn trading, understand technical analysis, and manage risk.
Always keep risk management, stop losses, and position sizing at the center of your advice.

Here is the user's current context:
- Watchlisted stock symbols: ${watchlistStr}
- Current portfolio holdings: ${holdingsStr}

Be encouraging, professional, and reference their watchlisted stocks or portfolio holdings when relevant.
Do NOT give direct buy/sell recommendations or financial advice (always add a disclaimer that you are an AI assistant and they should do their own research).
Keep your answers clear, concise, and structured with bullet points where appropriate.`;

    // 4. Generate AI response (Gemini or Fallback)
    let aiResponse = "";
    if (isGeminiEnabled) {
      try {
        const chatSession = startGeminiChat(historyData, systemInstruction);
        if (chatSession) {
          const result = await chatSession.sendMessage(data.message);
          aiResponse = result.response.text();
        } else {
          aiResponse = generateFallbackAiResponse(data.message);
        }
      } catch (err) {
        console.error("Gemini coach chat generation failed, using fallback:", err);
        aiResponse = generateFallbackAiResponse(data.message);
      }
    } else {
      aiResponse = generateFallbackAiResponse(data.message);
    }

    // Save AI response
    const [savedResponse] = await db
      .insert(chatHistory)
      .values({
        userId: user.id,
        threadId: data.threadId,
        threadTitle: data.threadTitle,
        role: "ai",
        message: aiResponse,
      })
      .returning();

    // Track AI usage
    const today = new Date().toISOString().split("T")[0];
    const existingUsage = await db
      .select()
      .from(aiUsage)
      .where(
        and(eq(aiUsage.userId, user.id), eq(aiUsage.date, today))
      );

    if (existingUsage.length > 0) {
      await db
        .update(aiUsage)
        .set({
          requestCount: existingUsage[0].requestCount + 1,
        })
        .where(eq(aiUsage.id, existingUsage[0].id));
    } else {
      await db.insert(aiUsage).values({
        userId: user.id,
        date: today,
        requestCount: 1,
      });
    }

    return {
      success: true,
      data: {
        userMessage: data.message,
        aiResponse,
        savedId: savedResponse.id,
      },
    };
  });

export const getAiUsage = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    const usage = await db
      .select()
      .from(aiUsage)
      .where(
        and(eq(aiUsage.userId, user.id), eq(aiUsage.date, today))
      );

    return {
      success: true,
      data: {
        requestsToday: usage[0]?.requestCount ?? 0,
        limit: 20, // Free plan limit
      },
    };
  }
);
