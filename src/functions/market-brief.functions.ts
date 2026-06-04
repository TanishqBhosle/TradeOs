import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { watchlists } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../server/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { isGeminiEnabled, generateAiJson } from "../server/gemini";

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

interface MarketBriefData {
  synthesisTitle: string;
  synthesisBody: string;
  sections: Array<{ title: string; body: string }>;
  actionables: Array<{ tag: "Long" | "Watch" | "Avoid"; sym: string; note: string }>;
}

export const getMarketBrief = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    
    // Fetch user's watchlist symbols to customize the brief notes
    const userWatchlist = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, user.id));

    const watchlistSymbols = userWatchlist.map(w => w.symbol).slice(0, 5).join(", ") || "None";

    const pastBriefs = [
      "Tue, Jun 2",
      "Mon, Jun 1",
      "Fri, May 29",
      "Thu, May 28"
    ];

    const todayDateStr = new Date().toLocaleDateString("en-IN", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) + " · 8:30 AM IST";

    // ─── Default Fallback Data ────────────────────────────────────────────────
    const defaultBrief: MarketBriefData = {
      synthesisTitle: "Consolidation before breakout — stay cautious around key index levels.",
      synthesisBody: "Global markets are trading flat to positive. The Nifty 50 shows minor support at 22,550 and resistance around 22,780. Institutional flows remain neutral ahead of index ex-dates. Auto and Energy sectors hold steady momentum, while metals show signs of minor cooling.",
      sections: [
        {
          title: "Global cues",
          body: "S&P 500 +0.2%, Nasdaq +0.3%, Dow flat. Asian indices are opening mixed with Nikkei down 0.1%. Crude oil prices stable around $83.50/bbl."
        },
        {
          title: "Indian setup",
          body: "GIFT Nifty indicates flat to positive start (+30 pts). FIIs net sold minor ₹320 Cr yesterday, while DIIs bought ₹680 Cr. Financial and FMCG stocks expect support."
        },
        {
          title: "Your watchlist notes",
          body: watchlistSymbols !== "None"
            ? `Reviewing your watchlist (${watchlistSymbols}): Watch for key support tests or patterns developing on these symbols today. Maintain rigid stop loss limits.`
            : "You have no active symbols in your watchlist. Search and add symbols (e.g., RELIANCE, TATAMOTORS) to get tailored briefings."
        },
        {
          title: "Risk events",
          body: "Industrial output numbers to be released later this week. Watch weekly futures index expirations which might raise intraday volatility levels."
        }
      ],
      actionables: [
        { tag: "Long", sym: "RELIANCE", note: "Look for bounce above ₹2,920, target ₹2,980" },
        { tag: "Watch", sym: "TATAMOTORS", note: "Consolidating near ₹965, watch for volume breakout" },
        { tag: "Avoid", sym: "INFY", note: "Wait for trend stabilization below ₹1,800 resistance" }
      ]
    };

    if (isGeminiEnabled) {
      try {
        const prompt = `Generate a structured daily market briefing (Market Brief) for the Indian stock market (NSE/BSE).
Current Date: ${new Date().toDateString()}
The user's watchlist symbols are: ${watchlistSymbols}

Provide a JSON object containing:
- synthesisTitle: Short summary of today's market opening setup
- synthesisBody: 2-3 sentences outlining Nifty index technical triggers, flows, and sector bias
- sections: Array of 4 items with title and body:
  1. "Global cues" (US market closed prices, oil, dollar index, Asian indicators)
  2. "Indian setup" (Gift Nifty guidance, institutional flows, sector focus)
  3. "Your watchlist notes" (tailored technical bulletin for symbols: ${watchlistSymbols})
  4. "Risk events" (economic releases, RBI notes, F&O expiry)
- actionables: Array of exactly 3 trade setups:
  - tag: "Long" | "Watch" | "Avoid"
  - sym: Indian stock ticker symbol (e.g. TCS, HDFCBANK)
  - note: Entry levels, target levels, and stop loss context

Return valid JSON matching the schema of this object.`;

        const result = await generateAiJson<MarketBriefData>(
          prompt,
          "You are an elite Indian market research analyst at a top brokerage. Your reports are concise, analytical, and highly structured."
        );

        if (result && result.synthesisTitle && result.sections && result.actionables) {
          return {
            success: true,
            data: {
              date: todayDateStr,
              ...result,
              pastBriefs
            }
          };
        }
      } catch (err) {
        console.error("Failed to generate dynamic brief with Gemini, falling back:", err);
      }
    }

    return {
      success: true,
      data: {
        date: todayDateStr,
        ...defaultBrief,
        pastBriefs
      }
    };
  }
);
