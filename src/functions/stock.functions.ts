import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "../server/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { isGeminiEnabled, generateAiJson } from "../server/gemini";
import { getLiveStockQuote } from "../server/market-ticker";

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const stockQuerySchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
});

// Seed data for major Indian stocks
const stockDatabase: Record<string, {
  name: string;
  category: string;
  price: number;
  change: number;
  changePct: number;
  low: number;
  high: number;
  low52w: number;
  high52w: number;
  metrics: { label: string; value: string }[];
  aiAnalysis: string;
  target1: number;
  target2: number;
  stopLoss: number;
  riskReward: string;
  positionSize: string;
  consensus: { label: string; value: number; color: string }[];
  consensusStatus: string;
  consensusTarget: string;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  riskScore: number;
  overallScore: number;
}> = {
  TATAMOTORS: {
    name: "Tata Motors Ltd.",
    category: "NSE: TATAMOTORS · Auto · Large Cap",
    price: 982.40,
    change: 39.70,
    changePct: 4.21,
    low: 942.10,
    high: 988.20,
    low52w: 598.40,
    high52w: 1022.10,
    metrics: [
      { label: "Market Cap", value: "₹3.62L Cr" },
      { label: "P/E", value: "12.4" },
      { label: "EPS", value: "78.4" },
      { label: "Div Yield", value: "0.18%" },
      { label: "Beta", value: "1.32" },
      { label: "Debt/Equity", value: "0.84" },
      { label: "ROE", value: "21.4%" },
      { label: "Promoter", value: "46.4%" }
    ],
    aiAnalysis: "TATAMOTORS is in a confirmed breakout from a 6-week base, supported by 3.2× average volume and broad strength in the Auto sector. The setup carries an A+ technical grade: clean horizontal resistance taken out at ₹952, retest held, and momentum oscillators (RSI 67, MACD bullish cross) align.",
    target1: 1020,
    target2: 1065,
    stopLoss: 952,
    riskReward: "2.6:1",
    positionSize: "3.5% of capital",
    consensusStatus: "BUY",
    consensusTarget: "₹1,085 (+10.4%)",
    consensus: [
      { label: "Strong Buy", value: 22, color: "#22C55E" },
      { label: "Buy", value: 12, color: "#3B82F6" },
      { label: "Hold", value: 6, color: "#94A3B8" },
      { label: "Sell", value: 2, color: "#EF4444" }
    ],
    technicalScore: 92,
    fundamentalScore: 84,
    sentimentScore: 88,
    riskScore: 35,
    overallScore: 82
  },
  RELIANCE: {
    name: "Reliance Industries Ltd.",
    category: "NSE: RELIANCE · Energy / Telecom · Large Cap",
    price: 2945.60,
    change: 41.25,
    changePct: 1.42,
    low: 2901.00,
    high: 2962.00,
    low52w: 2220.00,
    high52w: 3020.00,
    metrics: [
      { label: "Market Cap", value: "₹19.92L Cr" },
      { label: "P/E", value: "28.2" },
      { label: "EPS", value: "104.5" },
      { label: "Div Yield", value: "0.34%" },
      { label: "Beta", value: "0.85" },
      { label: "Debt/Equity", value: "0.42" },
      { label: "ROE", value: "14.1%" },
      { label: "Promoter", value: "50.3%" }
    ],
    aiAnalysis: "RELIANCE is showing a strong consolidation breakout near the horizontal barrier of ₹2,940. Volumes have picked up over the last 3 sessions. Moving averages (50-DMA and 200-DMA) indicate a long-term bullish trend. Sentiment has turned positive due to expected tariff hikes in JIO.",
    target1: 3050,
    target2: 3120,
    stopLoss: 2890,
    riskReward: "2.3:1",
    positionSize: "5.0% of capital",
    consensusStatus: "STRONG BUY",
    consensusTarget: "₹3,210 (+9.0%)",
    consensus: [
      { label: "Strong Buy", value: 28, color: "#22C55E" },
      { label: "Buy", value: 10, color: "#3B82F6" },
      { label: "Hold", value: 3, color: "#94A3B8" },
      { label: "Sell", value: 1, color: "#EF4444" }
    ],
    technicalScore: 88,
    fundamentalScore: 89,
    sentimentScore: 92,
    riskScore: 20,
    overallScore: 87
  },
  HDFCBANK: {
    name: "HDFC Bank Ltd.",
    category: "NSE: HDFCBANK · Private Bank · Large Cap",
    price: 1672.40,
    change: 13.90,
    changePct: 0.84,
    low: 1652.00,
    high: 1678.00,
    low52w: 1363.00,
    high52w: 1794.00,
    metrics: [
      { label: "Market Cap", value: "₹12.7L Cr" },
      { label: "P/E", value: "18.1" },
      { label: "EPS", value: "92.4" },
      { label: "Div Yield", value: "1.14%" },
      { label: "Beta", value: "1.12" },
      { label: "Debt/Equity", value: "7.40" },
      { label: "ROE", value: "16.8%" },
      { label: "Promoter", value: "0.0%" }
    ],
    aiAnalysis: "HDFCBANK is trading in a healthy pullback zone near its 50-DMA at ₹1,660. The stock has consolidated post-merger, and valuation metrics are historically cheap. Momentum is currently neutral but risk/reward is extremely favorable for long swing positions.",
    target1: 1740,
    target2: 1800,
    stopLoss: 1630,
    riskReward: "3.2:1",
    positionSize: "6.0% of capital",
    consensusStatus: "BUY",
    consensusTarget: "₹1,850 (+10.6%)",
    consensus: [
      { label: "Strong Buy", value: 20, color: "#22C55E" },
      { label: "Buy", value: 15, color: "#3B82F6" },
      { label: "Hold", value: 4, color: "#94A3B8" },
      { label: "Sell", value: 1, color: "#EF4444" }
    ],
    technicalScore: 78,
    fundamentalScore: 94,
    sentimentScore: 82,
    riskScore: 18,
    overallScore: 84
  },
  TCS: {
    name: "Tata Consultancy Services Ltd.",
    category: "NSE: TCS · IT Services · Large Cap",
    price: 4120.10,
    change: -13.25,
    changePct: -0.32,
    low: 4092.00,
    high: 4155.00,
    low52w: 3173.00,
    high52w: 4585.00,
    metrics: [
      { label: "Market Cap", value: "₹15.1L Cr" },
      { label: "P/E", value: "31.4" },
      { label: "EPS", value: "131.2" },
      { label: "Div Yield", value: "1.36%" },
      { label: "Beta", value: "0.78" },
      { label: "Debt/Equity", value: "0.02" },
      { label: "ROE", value: "48.2%" },
      { label: "Promoter", value: "72.4%" }
    ],
    aiAnalysis: "TCS is showing signs of short-term exhaustion post-earnings. The IT index as a whole is underperforming. The stock has key support at ₹4,020. Relative Strength Index (RSI) is neutral at 48, suggesting consolidation will continue. Long-term fundamentals remain solid.",
    target1: 4350,
    target2: 4500,
    stopLoss: 3980,
    riskReward: "1.9:1",
    positionSize: "2.0% of capital",
    consensusStatus: "HOLD",
    consensusTarget: "₹4,280 (+3.9%)",
    consensus: [
      { label: "Strong Buy", value: 8, color: "#22C55E" },
      { label: "Buy", value: 14, color: "#3B82F6" },
      { label: "Hold", value: 18, color: "#94A3B8" },
      { label: "Sell", value: 6, color: "#EF4444" }
    ],
    technicalScore: 61,
    fundamentalScore: 92,
    sentimentScore: 68,
    riskScore: 22,
    overallScore: 75
  },
  INFY: {
    name: "Infosys Ltd.",
    category: "NSE: INFY · IT Services · Large Cap",
    price: 1840.70,
    change: -21.95,
    changePct: -1.18,
    low: 1832.00,
    high: 1872.00,
    low52w: 1352.00,
    high52w: 1992.00,
    metrics: [
      { label: "Market Cap", value: "₹7.64L Cr" },
      { label: "P/E", value: "29.1" },
      { label: "EPS", value: "63.2" },
      { label: "Div Yield", value: "2.44%" },
      { label: "Beta", value: "0.82" },
      { label: "Debt/Equity", value: "0.08" },
      { label: "ROE", value: "32.1%" },
      { label: "Promoter", value: "14.8%" }
    ],
    aiAnalysis: "INFY has broken below its 50-DMA and is approaching major structural support near ₹1,820. The current technical posture is bearish with negative MACD crossover. Wait for confirmation at ₹1,820 support test before entering swing longs.",
    target1: 1940,
    target2: 2010,
    stopLoss: 1795,
    riskReward: "2.2:1",
    positionSize: "2.5% of capital",
    consensusStatus: "ACCUMULATE",
    consensusTarget: "₹1,960 (+6.5%)",
    consensus: [
      { label: "Strong Buy", value: 11, color: "#22C55E" },
      { label: "Buy", value: 18, color: "#3B82F6" },
      { label: "Hold", value: 10, color: "#94A3B8" },
      { label: "Sell", value: 4, color: "#EF4444" }
    ],
    technicalScore: 48,
    fundamentalScore: 86,
    sentimentScore: 59,
    riskScore: 28,
    overallScore: 66
  },
  ITC: {
    name: "ITC Ltd.",
    category: "NSE: ITC · Conglomerate / FMCG · Large Cap",
    price: 459.20,
    change: 0.80,
    changePct: 0.18,
    low: 455.10,
    high: 462.40,
    low52w: 399.00,
    high52w: 502.00,
    metrics: [
      { label: "Market Cap", value: "₹5.72L Cr" },
      { label: "P/E", value: "26.4" },
      { label: "EPS", value: "17.4" },
      { label: "Div Yield", value: "3.42%" },
      { label: "Beta", value: "0.62" },
      { label: "Debt/Equity", value: "0.00" },
      { label: "ROE", value: "29.2%" },
      { label: "Promoter", value: "0.0%" }
    ],
    aiAnalysis: "ITC is trading in a tight consolidation range between ₹450 and ₹465. Known as a low-beta defensive bet, the stock offers solid dividend yields. Technical momentum is neutral (RSI 52), making it a stable choice during periods of index volatility.",
    target1: 485,
    target2: 505,
    stopLoss: 442,
    riskReward: "2.4:1",
    positionSize: "4.0% of capital",
    consensusStatus: "BUY",
    consensusTarget: "₹508 (+10.6%)",
    consensus: [
      { label: "Strong Buy", value: 24, color: "#22C55E" },
      { label: "Buy", value: 12, color: "#3B82F6" },
      { label: "Hold", value: 4, color: "#94A3B8" },
      { label: "Sell", value: 0, color: "#EF4444" }
    ],
    technicalScore: 72,
    fundamentalScore: 88,
    sentimentScore: 78,
    riskScore: 12,
    overallScore: 79
  }
};

interface StockAnalysisData {
  name: string;
  category: string;
  price: number;
  change: number;
  changePct: number;
  low: number;
  high: number;
  low52w: number;
  high52w: number;
  metrics: Array<{ label: string; value: string }>;
  aiAnalysis: string;
  target1: number;
  target2: number;
  stopLoss: number;
  riskReward: string;
  positionSize: string;
  consensusStatus: string;
  consensusTarget: string;
  consensus: Array<{ label: string; value: number; color: string }>;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  riskScore: number;
  overallScore: number;
}

export const getStockAnalysis = createServerFn({ method: "POST" })
  .inputValidator(stockQuerySchema)
  .handler(async ({ data }) => {
    await requireUser();

    const sym = data.symbol.toUpperCase();
    let basePrice = 520.40;
    let finalData: any = null;

    // 1. If Gemini is enabled, try generating dynamic analysis
    if (isGeminiEnabled) {
      try {
        const prompt = `Perform a comprehensive stock analysis for the Indian equity ticker: ${sym}.
Generate a structured JSON object representing the technical, fundamental, and risk metrics.
The output MUST match this interface exactly:
interface StockAnalysisData {
  name: string; // The official company name (e.g. "Tata Motors Ltd." or "Infosys Ltd.")
  category: string; // Ticker category description (e.g. "NSE: ${sym} · Equities · Large Cap")
  price: number; // Current trading price in INR
  change: number; // Net change today in INR
  changePct: number; // Percentage change today
  low: number; // Intraday low price in INR
  high: number; // Intraday high price in INR
  low52w: number; // 52-week low price in INR
  high52w: number; // 52-week high price in INR
  metrics: [
    { label: "Market Cap", value: string },
    { label: "P/E", value: string },
    { label: "EPS", value: string },
    { label: "Div Yield", value: string },
    { label: "Beta", value: string },
    { label: "Debt/Equity", value: string },
    { label: "ROE", value: string },
    { label: "Promoter", value: string }
  ];
  aiAnalysis: string; // 3-4 sentence detailed professional analyst assessment of trend, support/resistance, volume triggers, and strategy.
  target1: number; // Short term target price 1 in INR
  target2: number; // Medium term target price 2 in INR
  stopLoss: number; // Recommended stop-loss price in INR
  riskReward: string; // Risk to reward ratio (e.g. "2.4:1")
  positionSize: string; // Suggested position sizing (e.g. "3.5% of capital")
  consensusStatus: string; // Consensus rating (e.g. "BUY", "STRONG BUY", "HOLD", "ACCUMULATE")
  consensusTarget: string; // Consensus target text (e.g. "₹1,085 (+10.4%)")
  consensus: [
    { label: "Strong Buy", value: number, color: "#22C55E" },
    { label: "Buy", value: number, color: "#3B82F6" },
    { label: "Hold", value: number, color: "#94A3B8" },
    { label: "Sell", value: number, color: "#EF4444" }
  ]; // Sum of values should represent research analyst counts
  technicalScore: number; // Technical analysis rating (0-100)
  fundamentalScore: number; // Fundamental analysis rating (0-100)
  sentimentScore: number; // Market sentiment rating (0-100)
  riskScore: number; // Overall risk rating (0-100, where higher is riskier/volatile)
  overallScore: number; // Overall AI health rating (0-100, aggregate quality score)
}

Ensure the response is raw, valid JSON only without markdown wrapping, matching the interface exactly. Do not include any trailing commas.`;

        const result = await generateAiJson<StockAnalysisData>(
          prompt,
          "You are an expert financial analyst specialising in the Indian equity markets (NSE & BSE). Your reports are highly analytical and fact-based."
        );

        if (result && result.name && result.price && result.metrics) {
          basePrice = result.price;
          finalData = result;
        }
      } catch (err) {
        console.error(`Failed to generate dynamic stock analysis for ${sym} with Gemini, falling back:`, err);
      }
    }

    // 2. Fallback to database seed entries if defined
    if (!finalData) {
      const staticAnalysis = stockDatabase[sym];
      if (staticAnalysis) {
        basePrice = staticAnalysis.price;
        finalData = { ...staticAnalysis };
      }
    }

    // 3. Fallback fallback generator for any unknown symbol
    if (!finalData) {
      const mockScore = Math.floor(60 + Math.random() * 30);
      basePrice = 520.40;
      finalData = {
        name: `${sym} Ltd.`,
        category: `NSE: ${sym} · Equities · Mid Cap`,
        price: 520.40,
        change: 12.30,
        changePct: 2.42,
        low: 505.00,
        high: 525.00,
        low52w: 350.00,
        high52w: 580.00,
        metrics: [
          { label: "Market Cap", value: "₹1.2L Cr" },
          { label: "P/E", value: "19.5" },
          { label: "EPS", value: "26.4" },
          { label: "Div Yield", value: "0.95%" },
          { label: "Beta", value: "1.10" },
          { label: "Debt/Equity", value: "0.25" },
          { label: "ROE", value: "14.5%" },
          { label: "Promoter", value: "54.1%" }
        ],
        aiAnalysis: `TradeOS AI has flagged ${sym} as showing moderate bullish momentum. The stock is holding above its major exponential moving averages on the daily chart. Volatility indicators are expanding, suggesting a potential trend resolution. Observe key support levels closely.`,
        target1: 550,
        target2: 575,
        stopLoss: 502,
        riskReward: "2.5:1",
        positionSize: "3.0% of capital",
        consensusStatus: "BUY",
        consensusTarget: "₹570 (+9.5%)",
        consensus: [
          { label: "Strong Buy", value: 12, color: "#22C55E" },
          { label: "Buy", value: 8, color: "#3B82F6" },
          { label: "Hold", value: 4, color: "#94A3B8" },
          { label: "Sell", value: 1, color: "#EF4444" }
        ],
        technicalScore: mockScore,
        fundamentalScore: mockScore - 5,
        sentimentScore: mockScore + 2,
        riskScore: 25,
        overallScore: mockScore - 1
      };
    }

    // 4. Overwrite price details with dynamic live quote!
    const quote = await getLiveStockQuote(sym, basePrice);
    finalData.price = quote.price;
    finalData.change = quote.change;
    finalData.changePct = quote.changePct;
    finalData.high = quote.high;
    finalData.low = quote.low;

    return {
      success: true,
      data: finalData
    };
  });

const backtestInputSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  strategy: z.enum(["EMA_CROSS", "RSI_REVERSAL", "BREAKOUT"]),
  timeframe: z.enum(["3M", "6M", "1Y"]),
});

export const runBacktestStrategy = createServerFn({ method: "POST" })
  .inputValidator(backtestInputSchema)
  .handler(async ({ data }) => {
    await requireUser();

    const { symbol, strategy, timeframe } = data;

    // Seed deterministic random walk based on symbol, strategy, and timeframe
    let hash = 0;
    const seedStr = symbol + strategy + timeframe;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(hash + offset) * 10000;
      return x - Math.floor(x);
    };

    // Determine performance baseline parameters
    let totalTrades = 0;
    let winRate = 0;
    let profitFactor = 0.0;
    let maxDrawdown = 0.0;
    let strategyTrendMultiplier = 0.05; // general upward bias

    if (strategy === "EMA_CROSS") {
      totalTrades = timeframe === "3M" ? 6 : timeframe === "6M" ? 12 : 22;
      winRate = Math.round(48 + pseudoRandom(1) * 12); // 48% to 60%
      profitFactor = Number((1.3 + pseudoRandom(2) * 0.5).toFixed(2));
      maxDrawdown = Number((-(6 + pseudoRandom(3) * 6)).toFixed(1));
      strategyTrendMultiplier = 0.07;
    } else if (strategy === "RSI_REVERSAL") {
      totalTrades = timeframe === "3M" ? 8 : timeframe === "6M" ? 15 : 28;
      winRate = Math.round(52 + pseudoRandom(4) * 15); // 52% to 67%
      profitFactor = Number((1.4 + pseudoRandom(5) * 0.6).toFixed(2));
      maxDrawdown = Number((-(4 + pseudoRandom(6) * 5)).toFixed(1));
      strategyTrendMultiplier = 0.09;
    } else { // BREAKOUT
      totalTrades = timeframe === "3M" ? 5 : timeframe === "6M" ? 9 : 18;
      winRate = Math.round(40 + pseudoRandom(7) * 18); // 40% to 58%
      profitFactor = Number((1.2 + pseudoRandom(8) * 0.8).toFixed(2));
      maxDrawdown = Number((-(8 + pseudoRandom(9) * 10)).toFixed(1));
      strategyTrendMultiplier = 0.12;
    }

    const dataPointsCount = 15;
    const series: Array<{ label: string; strategy: number; benchmark: number }> = [];
    
    let strategyCapital = 100000;
    let benchmarkCapital = 100000;

    // Generate price path
    for (let i = 0; i < dataPointsCount; i++) {
      const progress = i / (dataPointsCount - 1);
      
      // Benchmark: basic stock random walk
      const benchFluctuation = (pseudoRandom(i + 10) - 0.45) * 0.08; // -3.6% to +4.4%
      benchmarkCapital = benchmarkCapital * (1 + benchFluctuation);
      
      // Strategy: outperforms or locks in gains (simulating cash status)
      const stratFluctuation = (pseudoRandom(i + 20) - 0.38) * 0.09 + strategyTrendMultiplier * progress;
      // Simulating stop losses: strategy doesn't suffer extreme drops
      const adjustedStratFluctuation = Math.max(stratFluctuation, -0.04);
      strategyCapital = strategyCapital * (1 + adjustedStratFluctuation);

      // Determine date label
      let label = "";
      if (timeframe === "3M") {
        label = `W${i + 1}`;
      } else if (timeframe === "6M") {
        label = `W${(i + 1) * 2}`;
      } else {
        label = `M${Math.floor(i / 1.2) + 1}`;
      }

      series.push({
        label,
        strategy: Math.round(strategyCapital),
        benchmark: Math.round(benchmarkCapital)
      });
    }

    return {
      success: true,
      data: {
        symbol,
        strategy,
        timeframe,
        stats: {
          totalTrades,
          winRate,
          profitFactor,
          maxDrawdown
        },
        series
      }
    };
  });
