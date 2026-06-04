import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill } from "@/components/app/Primitives";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  Cell,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { stockCandles } from "@/lib/mock-data";
import {
  Sparkles, Star, Search, Plus, StarOff, TrendingUp, TrendingDown,
  Activity, BarChart3, ShieldAlert, ArrowLeftRight, Calendar, Newspaper,
  Percent, Shield, Layers, HelpCircle, Info, Calculator, MessageSquare, Play, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockAnalysis, runBacktestStrategy } from "@/functions/stock.functions";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/functions/watchlist.functions";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

const stockSearchSchema = z.object({
  sym: z.string().optional(),
});

export const Route = createFileRoute("/app/stock")({
  validateSearch: stockSearchSchema,
  component: StockAnalysis,
});

// Rich Extended Mock Data for HDFCBANK, TATAMOTORS, RELIANCE, TCS, INFY, ITC
interface ExtendedMockData {
  sector: string;
  industry: string;
  lowerCircuit: number;
  upperCircuit: number;
  allTimeHigh: number;
  allTimeLow: number;
  liveVolume: number;
  avgVolume: number;
  returns: { period: string; pct: number }[];
  technicalIndicators: { name: string; value: string; signal: "BUY" | "SELL" | "NEUTRAL"; desc: string }[];
  bullishSignals: { name: string; desc: string; logic: string; data: string; benefit: string }[];
  bearishSignals: { name: string; desc: string; logic: string; data: string; benefit: string }[];
  fundamentals: {
    category: string;
    metrics: { name: string; value: string; formula: string; meaning: string; goodValue: string; badValue: string; explanation: string }[];
  }[];
  financials: {
    quarterly: { period: string; revenue: number; ebitda: number; netProfit: number }[];
    yearly: { period: string; revenue: number; ebitda: number; netProfit: number; assets: number; liabilities: number }[];
  };
  shareholding: {
    pattern: { name: string; pct: number; qoq: string; color: string }[];
    pledgeInfo: string;
    pledgeRisk: "Low" | "Medium" | "High";
    deals: { date: string; type: string; party: string; action: "BUY" | "SELL"; qty: string; price: string }[];
  };
  actionsAndEvents: {
    type: string;
    date: string;
    details: string;
  }[];
  news: { headline: string; sentiment: number; impact: string; summary: string }[];
  risk: { beta: number; volatility: string; drawdown: string; varVal: string; riskScore: number };
  peers?: { symbol: string; mcap: string; pe: string; roe: string; growth: string; returns1y: string }[];
  etfDetails?: { nav: number; aum: string; expenseRatio: string; trackingError: string; holdings: { name: string; pct: number }[] };
  bondDetails?: { couponRate: string; ytm: string; rating: string; duration: string; maturity: string };
  optionsData?: {
    oiBuildUp: string;
    pcr: number;
    maxPain: number;
    iv: number;
    oiDistribution: { strike: number; callOi: number; putOi: number }[];
  };
  aiOpportunityScore?: {
    technical: number;
    fundamental: number;
    sentiment: number;
    risk: number;
    overall: number;
  };
}

const extendedDatabase: Record<string, ExtendedMockData> = {
  HDFCBANK: {
    sector: "Financial Services",
    industry: "Private Sector Bank",
    lowerCircuit: 1505.15,
    upperCircuit: 1839.60,
    allTimeHigh: 1794.00,
    allTimeLow: 12.50,
    liveVolume: 12450210,
    avgVolume: 9800000,
    returns: [
      { period: "1D", pct: 0.84 },
      { period: "1W", pct: 2.10 },
      { period: "1M", pct: 4.50 },
      { period: "3M", pct: -1.20 },
      { period: "6M", pct: 8.40 },
      { period: "1Y", pct: 12.40 },
      { period: "3Y", pct: 24.50 },
      { period: "5Y", pct: 48.20 },
      { period: "10Y", pct: 242.00 }
    ],
    technicalIndicators: [
      { name: "RSI (14)", value: "54.20", signal: "NEUTRAL", desc: "Relative Strength Index is neutral, indicating stable momentum without overbought risks." },
      { name: "MACD (12, 26, 9)", value: "5.12", signal: "BUY", desc: "MACD line is above the signal line on daily candles, pointing to structural buying support." },
      { name: "ADX (14)", value: "24.50", signal: "NEUTRAL", desc: "ADX at 24.5 indicates a building trend, but not yet at extreme strength (>25)." },
      { name: "Momentum (10)", value: "12.80", signal: "BUY", desc: "Short term momentum oscillator is expanding upwards." },
      { name: "ATR (14)", value: "21.40", signal: "NEUTRAL", desc: "Average True Range shows typical bank daily volatility." },
      { name: "VWAP", value: "₹1,668.50", signal: "BUY", desc: "Current price is trading above intraday VWAP, validating bullish intraday pressure." }
    ],
    bullishSignals: [
      { name: "MACD Bullish Cross", desc: "The MACD line crossed above the signal line on daily intervals.", logic: "MACD_t > Signal_t && MACD_t-1 <= Signal_t-1", data: "12, 26, 9 EMA series", benefit: "Identifies early shifts in macro momentum for quick swing entries." },
      { name: "Volume Breakout", desc: "Intraday volume surged past the 20-day trailing session average.", logic: "Volume_t > 1.8 * Avg_20D_Volume", data: "Live tick volume + 20D baseline", benefit: "Signals institutional entry (FII/DII accumulation)." }
    ],
    bearishSignals: [
      { name: "None Detected", desc: "No major immediate bearish warning patterns active on HDFCBANK charts.", logic: "Supports holding structural long positions.", data: "OHLCV 200 daily series", benefit: "Confidence indicator for long-term swing positions." }
    ],
    fundamentals: [
      {
        category: "Valuation",
        metrics: [
          { name: "Market Cap", value: "₹12.7L Cr", formula: "Shares outstanding × Market Price", meaning: "Total equity value of the bank.", goodValue: "N/A (Size benchmark)", badValue: "N/A", explanation: "Think of this as the price tag to buy 100% of HDFC Bank today." },
          { name: "P/E Ratio", value: "18.1", formula: "Market Price / EPS", meaning: "Price paid per rupee of annual earnings.", goodValue: "< 22 for banks", badValue: "> 35", explanation: "You pay ₹18.1 for every ₹1 of profit HDFC Bank makes. Historically cheap for this lender." },
          { name: "P/B Ratio", value: "2.8", formula: "Market Price / Book Value per share", meaning: "Market price compared to assets minus liabilities.", goodValue: "< 3.0 for private banks", badValue: "> 4.5", explanation: "Shows how much the market values the bank's actual net assets. 2.8 represents great historic value." },
          { name: "PEG Ratio", value: "1.22", formula: "PE Ratio / Earnings Growth Rate", meaning: "P/E adjusted for actual earnings growth speed.", goodValue: "< 1.0 (Undervalued)", badValue: "> 2.0", explanation: "Adjusts PE for growth. At 1.22, the price is reasonable relative to the bank's double digit expansion." }
        ]
      },
      {
        category: "Profitability & Efficiency",
        metrics: [
          { name: "ROE (Return on Equity)", value: "16.8%", formula: "Net Income / Shareholder Equity", meaning: "Profits made per rupee of shareholders' capital.", goodValue: "> 15%", badValue: "< 10%", explanation: "HDFC earns ₹16.8 on every ₹100 of net wealth shareholders keep in the business." },
          { name: "ROCE (Return on Capital)", value: "18.4%", formula: "EBIT / Capital Employed", meaning: "Efficiency of overall deployed capital.", goodValue: "> 16%", badValue: "< 11%", explanation: "Evaluates returns from both equity capital and long-term borrowings." },
          { name: "Net Profit Margin", value: "24.5%", formula: "Net Profit / Total Revenue", meaning: "Percentage of income left as net earnings.", goodValue: "> 20% (Financials)", badValue: "< 12%", explanation: "For every ₹100 earned in interest/fees, ₹24.5 goes straight to bottom-line net profit." }
        ]
      }
    ],
    financials: {
      quarterly: [
        { period: "Q1 FY26", revenue: 41200, ebitda: 14800, netProfit: 9820 },
        { period: "Q2 FY26", revenue: 42500, ebitda: 15100, netProfit: 10120 },
        { period: "Q3 FY26", revenue: 44100, ebitda: 16200, netProfit: 10950 },
        { period: "Q4 FY26", revenue: 46800, ebitda: 17900, netProfit: 12180 }
      ],
      yearly: [
        { period: "FY23", revenue: 142000, ebitda: 49500, netProfit: 32000, assets: 2240000, liabilities: 1980000 },
        { period: "FY24", revenue: 161000, ebitda: 56400, netProfit: 36200, assets: 2480000, liabilities: 2190000 },
        { period: "FY25", revenue: 184000, ebitda: 64100, netProfit: 41200, assets: 2840000, liabilities: 2490000 }
      ]
    },
    shareholding: {
      pattern: [
        { name: "FIIs (Foreign Funds)", pct: 38.2, qoq: "-1.2%", color: "#3B82F6" },
        { name: "DIIs (Domestic Funds)", pct: 26.4, qoq: "+1.8%", color: "#22C55E" },
        { name: "Promoters", pct: 25.6, qoq: "+0.0%", color: "#A855F7" },
        { name: "Public", pct: 9.7, qoq: "-0.6%", color: "#F59E0B" },
        { name: "Government", pct: 0.1, qoq: "+0.0%", color: "#64748B" }
      ],
      pledgeInfo: "No promoter pledges reported. Exceptional governance.",
      pledgeRisk: "Low",
      deals: [
        { date: "28 May 2026", type: "Bulk Deal", party: "LIC of India", action: "BUY", qty: "4,50,000 shares", price: "₹1,668.20" },
        { date: "15 May 2026", type: "Insider Trade", party: "Managing Director", action: "BUY", qty: "12,000 shares", price: "₹1,655.00" },
        { date: "02 May 2026", type: "Block Deal", party: "Fidelity Investments", action: "BUY", qty: "18,00,000 shares", price: "₹1,662.00" }
      ]
    },
    actionsAndEvents: [
      { type: "Dividend", date: "Ex-Date: 12 Jun 2026", details: "Final dividend of ₹19.50 per share declared for FY26." },
      { type: "Earnings Call", date: "Scheduled: 18 Jul 2026", details: "Q1 FY27 financial results conference call." },
      { type: "AGM", date: "Scheduled: 24 Aug 2026", details: "Annual General Meeting covering merger synergy timelines." }
    ],
    news: [
      { headline: "HDFC Bank receives RBI nod for corporate debt restructuring portal", sentiment: 8, impact: "High", summary: "RBI has approved HDFC Bank's digital debt restructuring framework, expected to lower provisioning costs by ₹400 Cr next quarter." },
      { headline: "Private banks witness strong deposit growth in May 2026 reviews", sentiment: 6, impact: "Medium", summary: "HDFC deposit growth outperformed competitors, hitting a robust 18.2% YoY clip." }
    ],
    risk: {
      beta: 1.12,
      volatility: "14.20% annual",
      drawdown: "-18.5% peak-to-trough",
      varVal: "₹34.50 per share (99% 1D)",
      riskScore: 18
    },
    peers: [
      { symbol: "HDFCBANK", mcap: "₹12.7L Cr", pe: "18.1", roe: "16.8%", growth: "+14.5%", returns1y: "+12.4%" },
      { symbol: "ICICIBANK", mcap: "₹8.4L Cr", pe: "17.1", roe: "18.5%", growth: "+18.4%", returns1y: "+24.1%" },
      { symbol: "AXISBANK", mcap: "₹3.6L Cr", pe: "14.8", roe: "15.2%", growth: "+12.1%", returns1y: "+18.0%" }
    ],
    optionsData: {
      oiBuildUp: "Long Buildup (Bullish)",
      pcr: 1.18,
      maxPain: 1660,
      iv: 14.2,
      oiDistribution: [
        { strike: 1620, callOi: 1200000, putOi: 3400000 },
        { strike: 1640, callOi: 1800000, putOi: 2900000 },
        { strike: 1660, callOi: 2500000, putOi: 2100000 },
        { strike: 1680, callOi: 3800000, putOi: 1200000 },
        { strike: 1700, callOi: 4500000, putOi: 800000 }
      ]
    },
    aiOpportunityScore: {
      technical: 82,
      fundamental: 91,
      sentiment: 74,
      risk: 65,
      overall: 84
    }
  },
  TATAMOTORS: {
    sector: "Automobile",
    industry: "Commercial Vehicles & PVs",
    lowerCircuit: 884.15,
    upperCircuit: 1080.60,
    allTimeHigh: 1022.10,
    allTimeLow: 32.50,
    liveVolume: 8450120,
    avgVolume: 6200000,
    returns: [
      { period: "1D", pct: 4.21 },
      { period: "1W", pct: 6.80 },
      { period: "1M", pct: 9.40 },
      { period: "3M", pct: 14.20 },
      { period: "6M", pct: 22.40 },
      { period: "1Y", pct: 64.20 },
      { period: "3Y", pct: 182.40 },
      { period: "5Y", pct: 312.00 },
      { period: "10Y", pct: 420.00 }
    ],
    technicalIndicators: [
      { name: "RSI (14)", value: "67.40", signal: "BUY", desc: "RSI is trending high but remains below overbought levels (70), indicating powerful bullish momentum." },
      { name: "MACD (12, 26, 9)", value: "18.42", signal: "BUY", desc: "MACD recently completed a strong bullish crossover below the zero-line." },
      { name: "ADX (14)", value: "32.10", signal: "BUY", desc: "ADX at 32 indicates an extremely strong trend, implying the breakout has massive technical strength." },
      { name: "EMA (50)", value: "₹924.10", signal: "BUY", desc: "Stock is trading firmly above its 50-day EMA." },
      { name: "VWAP", value: "₹972.10", signal: "BUY", desc: "Current price is well above intraday VWAP, indicating buyers are dominating." }
    ],
    bullishSignals: [
      { name: "Resistance Breakout", desc: "Stock has taken out its heavy multi-week horizontal ceiling at ₹952.", logic: "Price_t > Horizontal_R && Volume_t > Avg_Volume", data: "Daily close series", benefit: "Enters blue-sky territory with limited structural overhead resistance." },
      { name: "Golden Cross", desc: "50 SMA crossed above the 200 SMA indicating macro uptrend structural start.", logic: "SMA_50 > SMA_200 && prev_SMA_50 <= prev_SMA_200", data: "Daily SMA 50 vs 200", benefit: "Guarantees macro direction has flipped bullish." }
    ],
    bearishSignals: [
      { name: "RSI Near Overbought", desc: "RSI is approaching 68, indicating that the stock is highly heated in the short term.", logic: "RSI > 65", data: "Daily 14-period RSI", benefit: "Alerts swing traders to avoid buying local tops and wait for consolidation." }
    ],
    fundamentals: [
      {
        category: "Valuation",
        metrics: [
          { name: "Market Cap", value: "₹3.62L Cr", formula: "Shares outstanding × Market Price", meaning: "Total valuation of company.", goodValue: "N/A", badValue: "N/A", explanation: "The cost to buy out the entire Tata Motors conglomerate." },
          { name: "P/E Ratio", value: "12.4", formula: "Market Price / EPS", meaning: "Price paid per rupee of earnings.", goodValue: "< 18 for auto sector", badValue: "> 25", explanation: "Extremely cheap. You pay just ₹12.4 for every ₹1 of profit, largely driven by Jaguar Land Rover (JLR) margin recovery." }
        ]
      }
    ],
    financials: {
      quarterly: [
        { period: "Q1 FY26", revenue: 98400, ebitda: 14200, netProfit: 5400 },
        { period: "Q2 FY26", revenue: 101200, ebitda: 14800, netProfit: 5900 },
        { period: "Q3 FY26", revenue: 104500, ebitda: 15600, netProfit: 6200 },
        { period: "Q4 FY26", revenue: 110200, ebitda: 16800, netProfit: 7100 }
      ],
      yearly: [
        { period: "FY23", revenue: 345000, ebitda: 38200, netProfit: 2400, assets: 320000, liabilities: 280000 },
        { period: "FY24", revenue: 389000, ebitda: 44200, netProfit: 14200, assets: 340000, liabilities: 290000 },
        { period: "FY25", revenue: 422000, ebitda: 52100, netProfit: 22100, assets: 370000, liabilities: 310000 }
      ]
    },
    shareholding: {
      pattern: [
        { name: "Promoters", pct: 46.4, qoq: "+0.0%", color: "#A855F7" },
        { name: "FIIs (Foreign Funds)", pct: 18.2, qoq: "+1.2%", color: "#3B82F6" },
        { name: "DIIs (Domestic Funds)", pct: 17.4, qoq: "+0.8%", color: "#22C55E" },
        { name: "Public", pct: 17.9, qoq: "-2.0%", color: "#F59E0B" },
        { name: "Government", pct: 0.1, qoq: "+0.0%", color: "#64748B" }
      ],
      pledgeInfo: "Promoter pledged shares at 2.4%. Completely safe.",
      pledgeRisk: "Low",
      deals: [
        { date: "29 May 2026", type: "Bulk Deal", party: "Morgan Stanley India", action: "BUY", qty: "6,00,000 shares", price: "₹972.50" }
      ]
    },
    actionsAndEvents: [
      { type: "Board Meeting", date: "Ex-Date: 28 Jun 2026", details: "Approval of strategic demerger of PV and CV divisions into separate entities." }
    ],
    news: [
      { headline: "Tata Motors EV division targets 30% sales jump in fiscal 2027", sentiment: 9, impact: "High", summary: "Launching new high-range Punch.ev and Curvv architectures expected to cement leading EV market share." }
    ],
    risk: {
      beta: 1.32,
      volatility: "22.40% annual",
      drawdown: "-32.1% peak-to-trough",
      varVal: "₹42.20 per share (99% 1D)",
      riskScore: 35
    },
    peers: [
      { symbol: "TATAMOTORS", mcap: "₹3.62L Cr", pe: "12.4", roe: "24.5%", growth: "+14.2%", returns1y: "+64.2%" },
      { symbol: "M&M", mcap: "₹3.20L Cr", pe: "18.2", roe: "16.8%", growth: "+12.1%", returns1y: "+48.0%" }
    ],
    optionsData: {
      oiBuildUp: "Short Covering (Bullish)",
      pcr: 0.85,
      maxPain: 960,
      iv: 22.4,
      oiDistribution: [
        { strike: 920, callOi: 400000, putOi: 1200000 },
        { strike: 940, callOi: 600000, putOi: 1500000 },
        { strike: 960, callOi: 1100000, putOi: 900000 },
        { strike: 980, callOi: 1800000, putOi: 500000 },
        { strike: 1000, callOi: 2500000, putOi: 200000 }
      ]
    },
    aiOpportunityScore: {
      technical: 88,
      fundamental: 74,
      sentiment: 90,
      risk: 68,
      overall: 80
    }
  },
  NIFTYBEES: {
    sector: "Exchange Traded Fund",
    industry: "Index Fund",
    lowerCircuit: 205.50,
    upperCircuit: 251.20,
    allTimeHigh: 234.00,
    allTimeLow: 45.00,
    liveVolume: 4520100,
    avgVolume: 3200000,
    returns: [
      { period: "1D", pct: 0.63 },
      { period: "1W", pct: 1.20 },
      { period: "1M", pct: 3.40 },
      { period: "3M", pct: -0.40 },
      { period: "6M", pct: 6.80 },
      { period: "1Y", pct: 14.20 },
      { period: "3Y", pct: 42.10 },
      { period: "5Y", pct: 84.50 },
      { period: "10Y", pct: 198.00 }
    ],
    technicalIndicators: [
      { name: "RSI (14)", value: "58.40", signal: "NEUTRAL", desc: "RSI is in healthy territory, indicating balanced tracking of index." },
      { name: "MACD (12, 26, 9)", value: "1.20", signal: "BUY", desc: "Bullish MACD signals overall uptrend tracking." }
    ],
    bullishSignals: [
      { name: "Support Bounce", desc: "Index bounced from standard support level.", logic: "Price > MA_200", data: "Nifty Basket Close", benefit: "Safe institutional entry." }
    ],
    bearishSignals: [
      { name: "None Detected", desc: "No specific bearish divergence detected.", logic: "N/A", data: "N/A", benefit: "N/A" }
    ],
    fundamentals: [
      {
        category: "Valuation",
        metrics: [
          { name: "AUM", value: "₹18,420 Cr", formula: "Asset value held in fund", meaning: "Total Assets Under Management.", goodValue: "> ₹1,000 Cr", badValue: "< ₹50 Cr", explanation: "Total capital other investors have put in this Nifty fund." },
          { name: "NAV", value: "₹228.40", formula: "Net Assets / Shares outstanding", meaning: "Net Asset Value per share.", goodValue: "N/A", badValue: "N/A", explanation: "The real actual price of a single share of the underlying stock basket." },
          { name: "Expense Ratio", value: "0.04%", formula: "Annual fees / Total assets", meaning: "Management fee deducted annually.", goodValue: "< 0.15%", badValue: "> 0.50%", explanation: "How much the fund manager charges you. 0.04% is extremely cheap!" },
          { name: "Tracking Error", value: "0.03%", formula: "Std Dev of ETF returns minus Index returns", meaning: "Difference in performance vs the Nifty 50 index.", goodValue: "< 0.05%", badValue: "> 0.20%", explanation: "Shows how closely the ETF mimics Nifty. Lower is better. 0.03% is exceptional." }
        ]
      }
    ],
    financials: {
      quarterly: [],
      yearly: []
    },
    shareholding: {
      pattern: [
        { name: "Public Retail", pct: 64.5, qoq: "+1.2%", color: "#3B82F6" },
        { name: "DII (Corporates)", pct: 25.2, qoq: "-0.4%", color: "#22C55E" },
        { name: "FIIs", pct: 10.3, qoq: "+0.8%", color: "#A855F7" }
      ],
      pledgeInfo: "ETF units do not support promoter pledge risk features.",
      pledgeRisk: "Low",
      deals: []
    },
    actionsAndEvents: [],
    news: [
      { headline: "Nifty ETFs witness record inflow volumes in May 2026", sentiment: 8, impact: "High", summary: "Retail traders are shifting capital from active mutual funds to passive low-cost ETFs." }
    ],
    risk: {
      beta: 1.00,
      volatility: "12.40% annual",
      drawdown: "-15.2% peak-to-trough",
      varVal: "₹4.50 per share (99% 1D)",
      riskScore: 10
    },
    peers: [
      { symbol: "NIFTYBEES", mcap: "₹18,420 Cr", pe: "22.5", roe: "N/A", growth: "+14.2%", returns1y: "+14.2%" },
      { symbol: "SETFNIF50", mcap: "₹12,400 Cr", pe: "22.5", roe: "N/A", growth: "+14.1%", returns1y: "+14.1%" }
    ],
    etfDetails: {
      nav: 228.40,
      aum: "₹18,420 Cr",
      expenseRatio: "0.04%",
      trackingError: "0.03%",
      holdings: [
        { name: "Reliance Industries Ltd", pct: 9.80 },
        { name: "HDFC Bank Ltd", pct: 8.20 },
        { name: "TCS Ltd", pct: 6.50 },
        { name: "ICICI Bank Ltd", pct: 6.10 },
        { name: "Infosys Ltd", pct: 5.40 }
      ]
    },
    aiOpportunityScore: {
      technical: 70,
      fundamental: 85,
      sentiment: 75,
      risk: 92,
      overall: 81
    }
  },
  NHAI_BOND: {
    sector: "Fixed Income",
    industry: "Sovereign/Infrastructure Bond",
    lowerCircuit: 980.00,
    upperCircuit: 1020.00,
    allTimeHigh: 1045.00,
    allTimeLow: 950.00,
    liveVolume: 245000,
    avgVolume: 180000,
    returns: [
      { period: "1D", pct: 0.05 },
      { period: "1W", pct: 0.15 },
      { period: "1M", pct: 0.65 },
      { period: "3M", pct: 1.95 },
      { period: "6M", pct: 3.90 },
      { period: "1Y", pct: 7.90 },
      { period: "3Y", pct: 24.80 },
      { period: "5Y", pct: 43.50 },
      { period: "10Y", pct: 94.00 }
    ],
    technicalIndicators: [
      { name: "Price vs Par Value", value: "₹1,005.40", signal: "NEUTRAL", desc: "Bond trades at a small premium to ₹1,000 face value." }
    ],
    bullishSignals: [],
    bearishSignals: [],
    fundamentals: [
      {
        category: "Bond Specifics",
        metrics: [
          { name: "Coupon Rate", value: "7.90%", formula: "Annual Interest / Face Value", meaning: "Annual interest payout paid to the bond holder.", goodValue: "> 7.50%", badValue: "< 5.00%", explanation: "The yearly cash interest you earn. At 7.90%, it yields higher than bank FDs." },
          { name: "Yield to Maturity (YTM)", value: "7.45%", formula: "Computed internal rate of return until maturity", meaning: "True annualized yield if held until the end.", goodValue: "> 7.20%", badValue: "< 4.80%", explanation: "Your absolute true annualized return, factoring in the purchase premium." },
          { name: "Credit Rating", value: "AAA (Stable)", formula: "Assigned by CARE / CRISIL ratings agency", meaning: "Creditworthiness and default risk rating.", goodValue: "AAA / AA+", badValue: "< BBB", explanation: "Default risk. AAA is the highest possible safety grade, showing negligible default risk." },
          { name: "Duration", value: "5.4 Years", formula: "Weighted avg time to receive cash flows", meaning: "Interest rate price sensitivity duration.", goodValue: "N/A", badValue: "N/A", explanation: "How sensitive the bond's price is to changes in RBI interest rates." }
        ]
      }
    ],
    financials: {
      quarterly: [],
      yearly: []
    },
    shareholding: {
      pattern: [
        { name: "Government Corp", pct: 51.0, qoq: "+0.0%", color: "#A855F7" },
        { name: "DII (Mutual Funds)", pct: 32.4, qoq: "+1.4%", color: "#22C55E" },
        { name: "Public Retail", pct: 16.6, qoq: "-1.4%", color: "#3B82F6" }
      ],
      pledgeInfo: "Sovereign-backed bonds carry zero promoter pledge default risks.",
      pledgeRisk: "Low",
      deals: []
    },
    actionsAndEvents: [
      { type: "Interest Payout", date: "Ex-Date: 15 Oct 2026", details: "Semi-annual interest payout of ₹39.50 per unit." }
    ],
    news: [
      { headline: "NHAI infra bonds trade at high premium amid safe-haven demand", sentiment: 7, impact: "Medium", summary: "Market interest rate cuts from RBI have made high-coupon AAA bonds extremely attractive." }
    ],
    risk: {
      beta: 0.12,
      volatility: "2.40% annual",
      drawdown: "-1.8% peak-to-trough",
      varVal: "₹0.80 per unit (99% 1D)",
      riskScore: 2
    },
    peers: [
      { symbol: "NHAI_BOND", mcap: "N/A", pe: "N/A", roe: "N/A", growth: "N/A", returns1y: "+7.9%" },
      { symbol: "PFC_BOND", mcap: "N/A", pe: "N/A", roe: "N/A", growth: "N/A", returns1y: "+7.7%" }
    ],
    bondDetails: {
      couponRate: "7.90% (Semi-Annual)",
      ytm: "7.45%",
      rating: "CRISIL AAA (Stable)",
      duration: "5.4 Years",
      maturity: "15 Dec 2032"
    },
    aiOpportunityScore: {
      technical: 50,
      fundamental: 98,
      sentiment: 60,
      risk: 99,
      overall: 77
    }
  }
};

// Fallback dynamic generator for other symbols
function getExtendedData(symbol: string): ExtendedMockData {
  const existing = extendedDatabase[symbol];
  if (existing) return existing;

  return {
    sector: "Diversified",
    industry: "Conglomerate",
    lowerCircuit: 468.20,
    upperCircuit: 572.40,
    allTimeHigh: 580.00,
    allTimeLow: 14.50,
    liveVolume: 2450000,
    avgVolume: 1800000,
    returns: [
      { period: "1D", pct: 2.42 },
      { period: "1W", pct: 3.50 },
      { period: "1M", pct: 5.10 },
      { period: "3M", pct: -2.40 },
      { period: "6M", pct: 12.00 },
      { period: "1Y", pct: 18.50 },
      { period: "3Y", pct: 45.00 },
      { period: "5Y", pct: 98.00 },
      { period: "10Y", pct: 184.00 }
    ],
    technicalIndicators: [
      { name: "RSI (14)", value: "56.40", signal: "NEUTRAL", desc: "RSI is in safe territory, indicating sustainable building momentum." },
      { name: "MACD (12, 26, 9)", value: "2.10", signal: "BUY", desc: "MACD shows early stages of bullish divergence." },
      { name: "ADX (14)", value: "21.20", signal: "NEUTRAL", desc: "Trend strength is moderate." }
    ],
    bullishSignals: [
      { name: "MACD Bullish Cross", desc: "Technical indicators point to expanding short-term trends.", logic: "MACD > Signal", data: "Close prices", benefit: "Captures early volatility expansions." }
    ],
    bearishSignals: [
      { name: "None Detected", desc: "No immediate structural failure patterns.", logic: "Support lines holding", data: "Close", benefit: "Low stop-loss risk." }
    ],
    fundamentals: [
      {
        category: "Valuation",
        metrics: [
          { name: "Market Cap", value: "₹1.2L Cr", formula: "Shares × Price", meaning: "Total cost of equity.", goodValue: "N/A", badValue: "N/A", explanation: "Enterprise size scale." }
        ]
      }
    ],
    financials: {
      quarterly: [
        { period: "Q1 FY26", revenue: 12400, ebitda: 2800, netProfit: 1400 },
        { period: "Q2 FY26", revenue: 13100, ebitda: 2950, netProfit: 1520 },
        { period: "Q3 FY26", revenue: 13800, ebitda: 3100, netProfit: 1650 },
        { period: "Q4 FY26", revenue: 14600, ebitda: 3400, netProfit: 1850 }
      ],
      yearly: [
        { period: "FY23", revenue: 42000, ebitda: 9200, netProfit: 4200, assets: 84000, liabilities: 42000 },
        { period: "FY24", revenue: 48000, ebitda: 10400, netProfit: 4900, assets: 96000, liabilities: 48000 },
        { period: "FY25", revenue: 54000, ebitda: 12100, netProfit: 5800, assets: 112000, liabilities: 56000 }
      ]
    },
    shareholding: {
      pattern: [
        { name: "Promoters", pct: 54.1, qoq: "+0.0%", color: "#A855F7" },
        { name: "FIIs", pct: 14.8, qoq: "+0.4%", color: "#3B82F6" },
        { name: "DIIs", pct: 16.2, qoq: "+0.8%", color: "#22C55E" },
        { name: "Public", pct: 14.9, qoq: "-1.2%", color: "#F59E0B" }
      ],
      pledgeInfo: "No shares pledged. Capital structure remains clean.",
      pledgeRisk: "Low",
      deals: []
    },
    actionsAndEvents: [],
    news: [
      { headline: "Market volatility highlights defensive positioning benefits", sentiment: 4, impact: "Medium", summary: "High quality mid-cap options represent safety during broad sector swings." }
    ],
    risk: {
      beta: 1.10,
      volatility: "16.40% annual",
      drawdown: "-24.2% peak-to-trough",
      varVal: "₹24.00 per share (99% 1D)",
      riskScore: 25
    },
    optionsData: {
      oiBuildUp: "Long Buildup",
      pcr: 1.05,
      maxPain: 520,
      iv: 18.5,
      oiDistribution: [
        { strike: 480, callOi: 500000, putOi: 1200000 },
        { strike: 500, callOi: 800000, putOi: 900000 },
        { strike: 520, callOi: 1200000, putOi: 800000 },
        { strike: 540, callOi: 1500000, putOi: 400000 },
        { strike: 560, callOi: 2200000, putOi: 100000 }
      ]
    },
    aiOpportunityScore: {
      technical: 74,
      fundamental: 80,
      sentiment: 72,
      risk: 75,
      overall: 76
    }
  };
}

const MetricGlossary: Record<string, {
  name: string;
  formula: string;
  meaning: string;
  goodValue: string;
  badValue: string;
  explanation: string;
}> = {
  "Market Cap": {
    name: "Market Capitalization",
    formula: "Current Share Price × Total Outstanding Shares",
    meaning: "The total market value of a company's outstanding shares.",
    goodValue: "Large scale benchmark (> ₹50,000 Cr represents relative stability)",
    badValue: "Micro scale (< ₹500 Cr represents high potential but extreme risk)",
    explanation: "Think of Market Cap as the complete price tag to buy 100% of the company's business today on the open market."
  },
  "P/E Ratio": {
    name: "Price to Earnings (P/E) Ratio",
    formula: "Market Price per Share / Earnings per Share (EPS)",
    meaning: "Measures how much investors are willing to pay for each rupee of the company's earnings.",
    goodValue: "< 25 (Reasonable for high growth), or lower than sector average",
    badValue: "> 40 (Highly premium or overvalued, unless growth is massive)",
    explanation: "If a company has a P/E of 18, it means you are paying ₹18 today to own ₹1 of their annual net profit. A lower P/E is generally cheaper."
  },
  "P/B Ratio": {
    name: "Price to Book (P/B) Ratio",
    formula: "Market Price per Share / Book Value per Share",
    meaning: "Compares the company's market value to its net asset value (book value).",
    goodValue: "< 3.0 (Great value, especially for asset-heavy businesses like banks)",
    badValue: "> 5.0 (Expensive relative to physical tangible assets)",
    explanation: "If you sold all of the bank's assets (buildings, loans, cash) and paid off all debts, the left-over value is the Book Value. A P/B of 2.8 means you pay 2.8x what those actual assets are worth."
  },
  "PEG Ratio": {
    name: "Price/Earnings-to-Growth (PEG) Ratio",
    formula: "P/E Ratio / Annual Earnings Growth Rate",
    meaning: "Adjusts the standard P/E ratio by incorporating the company's earnings growth rate.",
    goodValue: "< 1.0 (Undervalued; the growth justifies a higher P/E)",
    badValue: "> 2.0 (Overvalued; growth rate is too low to support current price)",
    explanation: "A standard P/E ratio ignores growth. The PEG ratio adjusts P/E. A value of 1.22 means you're paying a reasonable price relative to how fast the business is expanding."
  },
  "ROE (Return on Equity)": {
    name: "Return on Equity (ROE)",
    formula: "Net Income / Shareholders' Equity",
    meaning: "Measures a corporation's profitability by revealing how much profit a company generates with the money shareholders have invested.",
    goodValue: "> 15% (Highly efficient capital compounder)",
    badValue: "< 10% (Sub-par return on shareholder funds)",
    explanation: "If shareholders have contributed ₹100 of net wealth, and the company earns ₹16.8 in net profit, the ROE is 16.8%. It's like the interest rate the company earns on your equity capital."
  },
  "ROCE (Return on Capital)": {
    name: "Return on Capital Employed (ROCE)",
    formula: "Earnings Before Interest & Tax (EBIT) / Capital Employed",
    meaning: "Measures a company's profitability and capital efficiency, accounting for both equity and debt.",
    goodValue: "> 16% (Indicates excellent operating efficiency)",
    badValue: "< 11% (Capital is under-utilised or debt drag is too high)",
    explanation: "Unlike ROE which only looks at equity, ROCE looks at ALL money working in the business, including loans. It proves whether the management is good at deploying capital overall."
  },
  "Net Profit Margin": {
    name: "Net Profit Margin (PAT %)",
    formula: "(Net Profit / Total Revenue) × 100",
    meaning: "The percentage of revenue left as net income after all expenses are subtracted.",
    goodValue: "> 15% (High pricing power and lean operations)",
    badValue: "< 8% (Paper-thin margins, vulnerable to raw material cost spikes)",
    explanation: "For every ₹100 HDFC Bank takes in from interests and transaction fees, ₹24.5 is left over as pure net profit. That's a huge profit buffer!"
  },
  "Sovereign Beta": {
    name: "Sovereign Beta (Market Sensitivity)",
    formula: "Covariance(Asset Returns, Market Returns) / Variance(Market Returns)",
    meaning: "Measures the systematic volatility of a stock relative to the benchmark index (NIFTY 50).",
    goodValue: "< 1.0 (Defensive; moves less than the index, safe in market crashes)",
    badValue: "> 1.3 (High beta; moves way more than the index, highly speculative)",
    explanation: "A Beta of 1.12 means if the NIFTY 50 index goes up by 10%, HDFC Bank is expected to go up by 11.2%. If the index falls 10%, HDFC Bank falls 11.2%."
  },
  "Volatility": {
    name: "Standard Deviation Volatility",
    formula: "Annualized Standard Deviation of Daily Log Returns",
    meaning: "Measures the historical dispersion of asset prices around their average.",
    goodValue: "< 15% (Low volatility, stable price action)",
    badValue: "> 25% (High volatility, heavy price swings)",
    explanation: "Annual volatility of 14.2% means that within a normal year, the stock price is statistically likely to fluctuate within ±14.2% of its average value."
  },
  "Maximum Drawdown": {
    name: "Maximum Peak-to-Trough Drawdown",
    formula: "(Trough Value - Peak Value) / Peak Value",
    meaning: "The maximum observed loss from a historical peak to a trough before a new peak is attained.",
    goodValue: "> -20% (Conservative, safe risk-profile)",
    badValue: "< -35% (Deep drawdown, painful to recover from)",
    explanation: "If you bought at the absolute worst peak, -18.5% is the maximum paper loss you would have experienced before the stock recovered to new highs."
  },
  "Value at Risk": {
    name: "Value at Risk (VaR 1D 99%)",
    formula: "Parametric or Historical Quantile of Daily Returns at 99% CI",
    meaning: "The maximum potential loss expected on an investment over a 1-day horizon with 99% statistical confidence.",
    goodValue: "< ₹25 per share (Reasonable intraday variance)",
    badValue: "> ₹50 per share (Extremely high downside gap risk)",
    explanation: "A VaR of ₹34.50 means there is a 99% probability that HDFC Bank will NOT lose more than ₹34.50 in a single day. Only a 1% chance of a worse drop."
  },
  "Put-Call Ratio": {
    name: "Put-Call Ratio (PCR)",
    formula: "Total Open Interest of Put Options / Total Open Interest of Call Options",
    meaning: "A derivative sentiment ratio used to gauge overall market bullishness or bearishness.",
    goodValue: "> 1.0 (Bullish sentiment - more put selling support than call resistance)",
    badValue: "< 0.7 (Bearish sentiment - heavy call writing overhead resistance)",
    explanation: "Options traders sell puts to bet on price floors and call options to bet on ceilings. A PCR of 1.18 means more puts are open, showing strong support."
  },
  "Max Pain": {
    name: "Option Max Pain Strike",
    formula: "Strike price where option buyers suffer maximum financial loss",
    meaning: "The strike price at which the total payoff of all calls and puts would be minimum at expiry.",
    goodValue: "Near current market price (Validates standard options pinning)",
    badValue: "Far from spot price (Indicates massive institutional positioning pressure)",
    explanation: "Max Pain is the price level where the maximum number of option contracts will expire worthless. Markets are historically driven toward this price at expiry."
  },
  "Implied Volatility": {
    name: "Implied Volatility (IV)",
    formula: "Black-Scholes formula solved backward for Standard Deviation σ",
    meaning: "The market's forecast of a likely movement in the security's price.",
    goodValue: "< 18% (Low fear, low premium cost for buying options)",
    badValue: "> 30% (High uncertainty, highly expensive option premiums)",
    explanation: "IV is the market's expectation of future swings. An IV of 14.2% represents a calm, low-fear environment where option prices are cheap."
  },
  "Coupon Rate": {
    name: "Bond Coupon Interest Rate",
    formula: "(Annual Interest Payment / Face Value of Bond) × 100",
    meaning: "The fixed annual interest yield paid by the bond issuer to the investor.",
    goodValue: "> 7.50% (Excellent risk-adjusted yield for government-backed bonds)",
    badValue: "< 5.00% (Sub-par yield, fails to beat standard retail inflation)",
    explanation: "If a bond has a Coupon of 7.90% and Face Value of ₹1,000, you receive ₹79.00 in cash interest every single year without fail, guaranteed by the government."
  },
  "Yield to Maturity (YTM)": {
    name: "Yield to Maturity (YTM)",
    formula: "Internal Rate of Return (IRR) of all remaining bond cash flows",
    meaning: "The total annualized return anticipated on a bond if it is held until its maturity date.",
    goodValue: "> 7.20% (Highly attractive fixed cash-flow compounding rate)",
    badValue: "< 5.00% (Poor return compared to long term inflation or alternative low risk assets)",
    explanation: "YTM is the complete actual interest rate you earn if you buy the bond today at its market premium and hold it to the very end, accounting for coupon payouts."
  },
  "Credit Rating": {
    name: "Credit Rating Safety Score",
    formula: "Assigned by rating bureaus (CRISIL, ICRA, CARE)",
    meaning: "The evaluation of credit risk, representing the probability of the bond issuer defaulting.",
    goodValue: "AAA or AA+ (Absolute maximum safety grade, virtually zero default risk)",
    badValue: "< BBB- (High default risk, classified as speculative/junk bonds)",
    explanation: "CRISIL AAA is the gold standard. It tells you the bond issuer has exceptionally strong financial capacity to pay your interest and return your capital."
  },
  "Expense Ratio": {
    name: "ETF Expense Ratio",
    formula: "Total Annual Fund Operating Expenses / Net Assets Under Management",
    meaning: "The annual management fee charged by the fund managers to run the ETF basket.",
    goodValue: "< 0.10% (Ultra low cost passive indexing)",
    badValue: "> 0.50% (Excessive fee structure eating into long term returns)",
    explanation: "An Expense Ratio of 0.04% means you only pay ₹4 per year for every ₹10,000 you invest to have professionals manage the basket of stocks for you."
  },
  "Tracking Error": {
    name: "ETF Tracking Error Deviation",
    formula: "Standard Deviation of (ETF Returns - Benchmark Index Returns)",
    meaning: "Measures how closely the ETF's performance matches its underlying index.",
    goodValue: "< 0.05% (Extremely precise replication of the benchmark)",
    badValue: "> 0.20% (Poor replication, fund manager is lagging the index)",
    explanation: "A tracking error of 0.03% means NIFTYBEES mimics the NIFTY 50 index with near perfect accuracy, so your returns will match the index exactly."
  }
};

function StockAnalysis() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const currentSymbol = search.sym || "TATAMOTORS";

  const [searchInput, setSearchInput] = useState(currentSymbol);
  const [activeTab, setActiveTab] = useState<"overview" | "technicals" | "fundamentals" | "financials" | "shareholding" | "news_actions" | "risk_peers" | "ai_sandbox">("overview");

  // Interactive Chart type and indicator overlays states
  const [chartType, setChartType] = useState<"area" | "line" | "candle" | "heikin">("area");
  const [activeIndicator, setActiveIndicator] = useState<"none" | "volume" | "ema" | "macd">("volume");

  // Interactive Learning Layer Popup state
  const [selectedLearningMetric, setSelectedLearningMetric] = useState<{
    name: string;
    formula: string;
    meaning: string;
    goodValue: string;
    badValue: string;
    explanation: string;
  } | null>(null);

  // Backtest strategy state
  const [selectedStrat, setSelectedStrat] = useState<"EMA_CROSS" | "RSI_REVERSAL" | "BREAKOUT">("EMA_CROSS");
  const [selectedTf, setSelectedTf] = useState<"3M" | "6M" | "1Y">("6M");

  // AI sandbox state
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isTypingCopilot, setIsTypingCopilot] = useState(false);
  const [beginnerGlossary, setBeginnerGlossary] = useState(false);

  const triggerLearning = (metricName: string, fallbackMetric?: any) => {
    const glossaryItem = MetricGlossary[metricName];
    if (glossaryItem) {
      setSelectedLearningMetric(glossaryItem);
    } else if (fallbackMetric) {
      setSelectedLearningMetric({
        name: fallbackMetric.name || metricName,
        formula: fallbackMetric.formula || "Calculated by quant systems",
        meaning: fallbackMetric.meaning || "Standard financial indicator",
        goodValue: fallbackMetric.goodValue || "N/A",
        badValue: fallbackMetric.badValue || "N/A",
        explanation: fallbackMetric.explanation || "No advanced analogy available."
      });
    } else {
      setSelectedLearningMetric({
        name: metricName,
        formula: "Formula unavailable",
        meaning: "Financial performance index",
        goodValue: "Refer to industry standard",
        badValue: "Refer to industry standard",
        explanation: "No beginner analogy available."
      });
    }
  };

  const { data: backtestData, refetch: runBacktest, isFetching: isBacktesting } = useQuery({
    queryKey: ["backtest", currentSymbol, selectedStrat, selectedTf],
    queryFn: () => runBacktestStrategy({
      data: {
        symbol: currentSymbol,
        strategy: selectedStrat,
        timeframe: selectedTf
      }
    }),
    enabled: true,
  });

  const backtest = backtestData?.data;

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(currentSymbol);
  }, [currentSymbol]);

  // Fetch stock analysis
  const { data: stockData, isLoading } = useQuery({
    queryKey: ["stock-analysis", currentSymbol],
    queryFn: () => getStockAnalysis({ data: { symbol: currentSymbol } }),
    refetchInterval: 5000,
  });

  const stock = stockData?.data;
  const ext = getExtendedData(currentSymbol);

  // Real-time price update flash effect state
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [flashClass, setFlashClass] = useState<string>("");

  useEffect(() => {
    if (stock?.price) {
      if (prevPrice !== null && stock.price !== prevPrice) {
        const cls = stock.price > prevPrice ? "flash-green" : "flash-red";
        setFlashClass(cls);
        const timer = setTimeout(() => setFlashClass(""), 850);
        setPrevPrice(stock.price);
        return () => clearTimeout(timer);
      }
      setPrevPrice(stock.price);
    }
  }, [stock?.price, prevPrice]);

  useEffect(() => {
    setPrevPrice(null);
    setFlashClass("");
  }, [currentSymbol]);

  // Fetch watchlist to check if currently watched
  const { data: watchlistData } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => getWatchlist(),
  });

  const watchlistItems = watchlistData?.data ?? [];
  const watchlistEntry = watchlistItems.find(w => w.symbol === currentSymbol);
  const isWatched = !!watchlistEntry;

  // Watchlist mutations
  const addWatchMut = useMutation({
    mutationFn: () => addToWatchlist({ data: { symbol: currentSymbol, name: stock?.name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`${currentSymbol} added to watchlist.`);
    },
    onError: (err) => {
      toast.error("Failed to add: " + (err as Error).message);
    }
  });

  const removeWatchMut = useMutation({
    mutationFn: (id: number) => removeFromWatchlist({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`${currentSymbol} removed from watchlist.`);
    },
    onError: (err) => {
      toast.error("Failed to remove: " + (err as Error).message);
    }
  });

  const toggleWatchlist = () => {
    if (isWatched && watchlistEntry) {
      removeWatchMut.mutate(watchlistEntry.id);
    } else {
      addWatchMut.mutate();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate({
        to: "/app/stock",
        search: { sym: searchInput.trim().toUpperCase() } as any
      });
    }
  };

  const executeCopilotSandbox = (feature: string) => {
    setIsTypingCopilot(true);
    setCopilotResponse(null);

    let answer = "";
    if (feature === "doctor") {
      answer = `💼 [AI Portfolio Doctor] - Diagnostic scan completed for active portfolio holdings:
• Concentration Alert: You hold substantial exposure in ${currentSymbol}.
• Risk Factor (Beta): Sector sensitivity stands at ${ext.risk.beta} relative to the NIFTY 50.
• Recommendation: Suggest adding Gold ETFs (e.g. NIFTYBEES) or AAA Sovereign Fixed Income bonds to bring portfolio correlation down to a safer 0.58.`;
    } else if (feature === "moving") {
      answer = `📈 [AI Why Is Stock Moving?] - Real-time market catalyst parser:
• ${currentSymbol} is trading at ₹${stock?.price?.toFixed(2)} (${stock?.changePct >= 0 ? "+" : ""}${stock?.changePct}%).
• Momentum Catalyst: Institutional buying volume is currently clocked at ${(ext.liveVolume / ext.avgVolume).toFixed(1)}x compared to trailing session baselines. 
• Headline Impact: The primary driver is market reception on recent corporate updates. Sector momentum indicates strong retail rotation.`;
    } else if (feature === "review") {
      answer = `📝 [AI Trade Review] - Diagnostic journal execution feedback:
• Position Sizing: Suggested allocation of ${stock?.positionSize} matches institutional safety levels.
• Risk-Reward Profile: Current technical entry at ₹${stock?.price?.toFixed(2)} targets a target ratio of ${stock?.riskReward} with a recommended stop-loss at ₹${stock?.stopLoss}.
• Strategy Grade: A- (Favorable entry setup aligned with general daily momentum).`;
    }

    setTimeout(() => {
      setCopilotResponse(answer);
      setIsTypingCopilot(false);
    }, 1200);
  };

  return (
    <div>
      {/* Header bar with Quick Search */}
      <div className="px-6 pt-6 flex items-center justify-between gap-4 flex-wrap border-b border-border/40 pb-4 bg-sidebar/30 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stock symbol (e.g. RELIANCE)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground uppercase"
          />
          <button type="submit" className="text-xs text-primary font-medium hover:underline cursor-pointer">Analyze</button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {["TATAMOTORS", "HDFCBANK", "RELIANCE", "NIFTYBEES", "NHAI_BOND", "TCS", "INFY"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSearchInput(s);
                navigate({ to: "/app/stock", search: { sym: s } as any });
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                currentSymbol === s
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="font-medium animate-pulse">Running advanced quant scanners & scraping balance sheets...</span>
        </div>
      ) : !stock ? (
        <div className="py-24 text-center text-sm text-muted-foreground">
          Stock details not found.
        </div>
      ) : (
        <div>
          {/* Main Title and Stock Header */}
          <PageHeader
            title={`${currentSymbol} · ${stock.name}`}
            subtitle={
              <div className="flex items-center gap-2 flex-wrap mt-0.5 text-xs">
                <span className="text-white font-medium bg-secondary/80 px-2 py-0.5 rounded border border-border/50 uppercase">{ext.sector}</span>
                <span className="text-muted-foreground">{ext.industry}</span>
                <span className="h-1.5 w-px bg-border" />
                <span className="text-muted-foreground">{stock.category.split("·")[2]}</span>
                <span className="h-1.5 w-px bg-border" />
                <div className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success glow-success">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
                  </span>
                  LIVE FEED (1S)
                </div>
              </div>
            }
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    toast.success(`Simulated order triggered: BUY ${currentSymbol} at ₹${stock.price.toFixed(2)}`);
                  }}
                  className="rounded-lg bg-success px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-success/20 cursor-pointer"
                >
                  BUY
                </button>
                <button
                  onClick={() => {
                    toast.success(`Simulated order triggered: SELL ${currentSymbol} at ₹${stock.price.toFixed(2)}`);
                  }}
                  className="rounded-lg bg-danger px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-danger/20 cursor-pointer"
                >
                  SELL
                </button>
                <button
                  onClick={toggleWatchlist}
                  disabled={addWatchMut.isPending || removeWatchMut.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-card transition-all cursor-pointer"
                >
                  {isWatched ? (
                    <>
                      <StarOff className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> Watchlist
                    </>
                  ) : (
                    <>
                      <Star className="h-3.5 w-3.5" /> Watchlist
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("risk_peers");
                    toast.success("Navigated to peer comparison panel.");
                  }}
                  className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-card transition-all cursor-pointer"
                >
                  Compare
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Analysis report link copied to clipboard!");
                  }}
                  className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-card transition-all cursor-pointer"
                >
                  Share
                </button>
                <button
                  onClick={() => toast.success(`Alert set for ${currentSymbol} price levels.`)}
                  className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-card transition-all cursor-pointer"
                >
                  Alert
                </button>
                <button
                  onClick={() => {
                    setActiveTab("ai_sandbox");
                    toast.success("Navigated to AI Layer sandbox.");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Engine
                </button>
              </div>
            }
          />

          {/* Interactive Navigation Tabs */}
          <div className="px-6 border-b border-border bg-sidebar/10 overflow-x-auto no-scrollbar scroll-smooth flex">
            {[
              { id: "overview", label: "Overview & Charts", icon: BarChart3 },
              { id: "technicals", label: "Technical Signals", icon: Activity },
              { id: "fundamentals", label: "Fundamentals", icon: Percent },
              { id: "financials", label: "Statements", icon: Layers },
              { id: "shareholding", label: "Ownership Pattern", icon: StarsIcon }, // fallbacks or Lucide
              { id: "news_actions", label: "News & Events", icon: Newspaper },
              { id: "risk_peers", label: "Risk & Peers", icon: Shield },
              { id: "ai_sandbox", label: "AI Layer Terminal", icon: Sparkles }
            ].map((tab) => {
              const TabIcon = tab.id === "shareholding" ? Layers : tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3.5 border-b-2 text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/[0.02]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                  }`}
                >
                  <TabIcon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW & CHARTS */}
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  {/* ETF Details Card overlay */}
                  {ext.etfDetails && (
                    <Card className="col-span-12 bg-primary/[0.01] border-primary/20" title="Premium ETF Index Intelligence" action={<Pill tone="info">ETF Asset Profile</Pill>}>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Net Asset Value (NAV)</span>
                          <div className="text-lg font-black text-white mt-1">₹{ext.etfDetails.nav.toFixed(2)}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Assets Under Management</span>
                          <div className="text-lg font-black text-white mt-1">{ext.etfDetails.aum}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Expense Ratio</span>
                          <div className="text-lg font-black text-white mt-1">{ext.etfDetails.expenseRatio}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Tracking Error</span>
                          <div className="text-lg font-black text-white mt-1">{ext.etfDetails.trackingError}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30 col-span-2 md:col-span-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Benchmark Tracking</span>
                          <div className="text-lg font-black text-primary mt-1 font-bold">NIFTY 50 Index</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/30">
                        <h4 className="text-xs font-semibold text-white mb-2">Basket Allocation Breakdown</h4>
                        <div className="flex flex-wrap gap-2">
                          {ext.etfDetails.holdings.map((h) => (
                            <span key={h.name} className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                              {h.name}: <strong className="text-white font-bold">{h.pct}%</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Bond Details Card overlay */}
                  {ext.bondDetails && (
                    <Card className="col-span-12 bg-warning/[0.01] border-warning/20" title="Premium Fixed Income Bond Intelligence" action={<Pill tone="warn">Government Bond Profile</Pill>}>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Coupon Yield</span>
                          <div className="text-lg font-black text-white mt-1">{ext.bondDetails.couponRate}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Yield to Maturity (YTM)</span>
                          <div className="text-lg font-black text-white mt-1">{ext.bondDetails.ytm}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Safety Credit Rating</span>
                          <div className="text-lg font-black text-success mt-1 font-bold">{ext.bondDetails.rating}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Maturity Date</span>
                          <div className="text-lg font-black text-white mt-1">{ext.bondDetails.maturity}</div>
                        </div>
                        <div className="bg-secondary/40 p-3 rounded-xl border border-border/30 col-span-2 md:col-span-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Interest Rate Duration</span>
                          <div className="text-lg font-black text-white mt-1">{ext.bondDetails.duration}</div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Left Column: Live Chart */}
                  <Card className="col-span-12 xl:col-span-9 bg-card/45">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <div className={`text-4xl font-extrabold tabular-nums tracking-tight transition-all duration-300 rounded px-2 py-0.5 -mx-2 ${
                            flashClass === "flash-green"
                              ? "bg-success/15 text-success glow-success"
                              : flashClass === "flash-red"
                              ? "bg-danger/15 text-danger glow-danger"
                              : "text-foreground"
                          }`}>
                            ₹{stock.price.toFixed(2)}
                          </div>
                          <div className={`text-sm font-bold flex items-center gap-1 ${stock.change >= 0 ? "text-success" : "text-danger"}`}>
                            {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {stock.change >= 0 ? "+" : ""}₹{stock.change.toFixed(2)} ({stock.changePct >= 0 ? "+" : ""}{stock.changePct}%)
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Today: <strong className="text-foreground">₹{stock.low.toFixed(2)}</strong> – <strong className="text-foreground">₹{stock.high.toFixed(2)}</strong></span>
                          <span>•</span>
                          <span>52W: <strong className="text-foreground">₹{stock.low52w.toFixed(2)}</strong> – <strong className="text-foreground">₹{stock.high52w.toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        {/* Timeframes */}
                        <div className="flex gap-0.5 border border-border bg-secondary/40 rounded-lg p-0.5">
                          {["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"].map((t, i) => (
                            <button key={t} className={`rounded px-2.5 py-1 font-semibold transition-all ${i === 3 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
                          ))}
                        </div>

                        {/* Chart Type Selector */}
                        <div className="flex gap-0.5 border border-border bg-secondary/40 rounded-lg p-0.5">
                          {[
                            { id: "area", label: "Area" },
                            { id: "line", label: "Line" },
                            { id: "candle", label: "Candle" },
                            { id: "heikin", label: "Heikin" }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setChartType(t.id as any);
                                toast.success(`Chart type updated to ${t.label}`);
                              }}
                              className={`rounded px-2 py-1 font-semibold transition-all ${chartType === t.id ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Technical Overlay Selector */}
                        <div className="flex gap-0.5 border border-border bg-secondary/40 rounded-lg p-0.5">
                          {[
                            { id: "none", label: "No Overlay" },
                            { id: "volume", label: "+ Vol" },
                            { id: "ema", label: "+ EMA" },
                            { id: "macd", label: "+ MACD" }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setActiveIndicator(t.id as any);
                                toast.success(`Chart overlay updated to ${t.label}`);
                              }}
                              className={`rounded px-2 py-1 font-semibold transition-all ${activeIndicator === t.id ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chart Canvas */}
                    <div className="mt-6 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stockCandles}>
                          <defs>
                            <linearGradient id="stk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={stock.change >= 0 ? "#22C55E" : "#EF4444"} stopOpacity={0.08} />
                              <stop offset="100%" stopColor={stock.change >= 0 ? "#22C55E" : "#EF4444"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="t" tick={{ fill: "#64748B", fontSize: 10 }} stroke="rgba(255,255,255,0.04)" />
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#94A3B8" }} />
                          
                          {/* Dynamic Chart Type */}
                          {chartType === "area" && (
                            <Area type="monotone" dataKey="close" stroke={stock.change >= 0 ? "#22C55E" : "#EF4444"} strokeWidth={1.5} fill="url(#stk)" />
                          )}
                          {(chartType === "line" || chartType === "heikin" || chartType === "candle") && (
                            <Area type="monotone" dataKey="close" stroke={stock.change >= 0 ? "#22C55E" : "#EF4444"} strokeWidth={1.5} fill="none" />
                          )}
                          
                          {/* Technical Overlay Line */}
                          {activeIndicator === "ema" && (
                            <Area type="monotone" dataKey="open" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="EMA (50)" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Vol Panel */}
                    <div className="mt-3 h-20 border-t border-border/30 pt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockCandles}>
                          <Bar dataKey="high" radius={1}>
                            {stockCandles.map((c, i) => (
                              <Cell key={i} fill={c.close > c.open ? "#22C55E" : "#EF4444"} fillOpacity={0.3} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Right Column: Performance Stats */}
                  <Card className="col-span-12 xl:col-span-3 bg-card/45" title="Performance Profile">
                    <dl className="grid grid-cols-2 gap-y-4 text-xs mt-2 border-b border-border/40 pb-4">
                      <div>
                        <dt className="text-muted-foreground font-medium">Open Price</dt>
                        <dd className="font-semibold text-sm mt-0.5">₹{(stock.price - stock.change).toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">Prev Close</dt>
                        <dd className="font-semibold text-sm mt-0.5">₹{(stock.price - stock.change).toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">Circuit Low</dt>
                        <dd className="font-semibold text-sm text-danger/80 mt-0.5">₹{ext.lowerCircuit.toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">Circuit High</dt>
                        <dd className="font-semibold text-sm text-success/80 mt-0.5">₹{ext.upperCircuit.toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">All Time High</dt>
                        <dd className="font-semibold text-sm mt-0.5">₹{ext.allTimeHigh.toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">All Time Low</dt>
                        <dd className="font-semibold text-sm mt-0.5">₹{ext.allTimeLow.toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">Live Session Vol</dt>
                        <dd className="font-semibold text-sm mt-0.5">{ext.liveVolume.toLocaleString("en-IN")}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-medium">Avg Volume (20D)</dt>
                        <dd className="font-semibold text-sm mt-0.5">{ext.avgVolume.toLocaleString("en-IN")}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 pt-2">
                      <h4 className="text-xs font-semibold text-white mb-2.5">Historical Cumulative Returns</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {ext.returns.slice(0, 6).map((ret) => (
                          <div key={ret.period} className="bg-secondary/40 p-2 rounded-lg text-center border border-border/40">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{ret.period}</span>
                            <div className={`text-xs font-bold mt-0.5 ${ret.pct >= 0 ? "text-success" : "text-danger"}`}>
                              {ret.pct >= 0 ? "+" : ""}{ret.pct}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* AI Synthesis Summary */}
                  <Card className="col-span-12 xl:col-span-8 border-primary/30 bg-primary/[0.01]" title="AI Synthesis & Strategy Guide" action={<Pill tone="info"><Sparkles className="h-3 w-3 animate-pulse" /> Synthesis</Pill>}>
                    <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                      {stock.aiAnalysis}
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-success/5 border border-success/20 rounded-xl p-3.5">
                        <div className="text-[10px] text-success font-semibold tracking-wider uppercase">Short-Term Target 1</div>
                        <div className="text-xl font-bold mt-1 text-white">₹{stock.target1.toFixed(2)}</div>
                      </div>
                      <div className="bg-success/5 border border-success/20 rounded-xl p-3.5">
                        <div className="text-[10px] text-success font-semibold tracking-wider uppercase">Mid-Term Target 2</div>
                        <div className="text-xl font-bold mt-1 text-white">₹{stock.target2.toFixed(2)}</div>
                      </div>
                      <div className="bg-danger/5 border border-danger/20 rounded-xl p-3.5">
                        <div className="text-[10px] text-danger font-semibold tracking-wider uppercase">Stop Loss Barrier</div>
                        <div className="text-xl font-bold mt-1 text-white">₹{stock.stopLoss.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                      <div>Optimal Risk/Reward Ratio: <span className="text-white font-bold">{stock.riskReward}</span></div>
                      <div>Suggested Capital Sizing: <span className="text-white font-bold">{stock.positionSize}</span></div>
                    </div>
                  </Card>

                  {/* Rating consensus and global score */}
                  <Card className="col-span-12 xl:col-span-4 bg-card/45" title="AI Opportunity Score" action={<Pill tone="info">TradeOS Score</Pill>}>
                    <div className="space-y-4">
                      {/* Overall score gauge */}
                      <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl border border-border/40">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Overall Opportunity</span>
                          <div className="text-xs font-semibold text-muted-foreground mt-1">Consensus: <span className="text-success font-extrabold">{stock.consensusStatus}</span></div>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent select-none">
                            {ext.aiOpportunityScore?.overall ?? stock.overallScore}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal"> /100</span>
                        </div>
                      </div>

                      {/* Sub-scores grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {[
                          { label: "Technical Score", score: ext.aiOpportunityScore?.technical ?? 82, color: "#3B82F6", detail: "Trend & Oscillators" },
                          { label: "Fundamental Score", score: ext.aiOpportunityScore?.fundamental ?? 91, color: "#22C55E", detail: "Safety & Valuation" },
                          { label: "Sentiment Score", score: ext.aiOpportunityScore?.sentiment ?? 74, color: "#A855F7", detail: "News & Institutional" },
                          { label: "Risk Score", score: ext.aiOpportunityScore?.risk ?? 65, color: "#EF4444", detail: "Drawdown & Beta" }
                        ].map((s) => (
                          <div key={s.label} className="bg-secondary/20 p-3 rounded-xl border border-border/30 flex flex-col justify-between hover:border-border/60 transition-all">
                            <div>
                              <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</div>
                              <div className="text-lg font-black text-white mt-1">{s.score}</div>
                            </div>
                            <div className="mt-2">
                              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                              </div>
                              <span className="text-[8px] text-muted-foreground mt-1 block">{s.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mini Analyst split summary */}
                      <div className="border-t border-border/30 pt-3 mt-1">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-2">
                          <span>Institutional Price Target</span>
                          <span className="text-white font-bold">{stock.consensusTarget}</span>
                        </div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-secondary">
                          {stock.consensus.map((c: any, i: number) => (
                            <div
                              key={c.label}
                              className="h-full first:rounded-l-full last:rounded-r-full"
                              style={{
                                width: `${c.value * 3.5}%`,
                                backgroundColor: c.color
                              }}
                              title={`${c.label}: ${c.value} analysts`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between mt-1 text-[8px] text-muted-foreground">
                          {stock.consensus.map((c: any) => (
                            <span key={c.label} className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                              {c.label} ({c.value})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Strategy backtest panel */}
                  <Card className="col-span-12" title="Historical Strategy Backtester Simulation" action={<Pill tone="info">Simulated Backtest</Pill>}>
                    <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-muted-foreground mb-1 font-semibold uppercase">Strategy Model</label>
                            <select
                              value={selectedStrat}
                              onChange={(e) => setSelectedStrat(e.target.value as any)}
                              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs outline-none focus:border-primary text-foreground"
                            >
                              <option value="EMA_CROSS">50-EMA Crossover</option>
                              <option value="RSI_REVERSAL">RSI Reversal (30/70)</option>
                              <option value="BREAKOUT">Volume Breakout</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-muted-foreground mb-1 font-semibold uppercase">Timeframe Period</label>
                            <select
                              value={selectedTf}
                              onChange={(e) => setSelectedTf(e.target.value as any)}
                              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs outline-none focus:border-primary text-foreground"
                            >
                              <option value="3M">3 Months</option>
                              <option value="6M">6 Months</option>
                              <option value="1Y">1 Year</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => runBacktest()}
                          disabled={isBacktesting}
                          className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isBacktesting ? "Re-running Monte Carlo models..." : "Execute Strategy Backtest"}
                        </button>

                        {backtest && (
                          <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
                            <div className="rounded-lg bg-secondary/40 p-3 text-center border border-border/30">
                              <div className="text-[9px] text-muted-foreground uppercase font-semibold">Total Trades</div>
                              <div className="mt-1 text-lg font-bold text-white">{backtest.stats.totalTrades}</div>
                            </div>
                            <div className="rounded-lg bg-secondary/40 p-3 text-center border border-border/30">
                              <div className="text-[9px] text-muted-foreground uppercase font-semibold">Win Rate</div>
                              <div className="mt-1 text-lg font-bold text-success">{backtest.stats.winRate}%</div>
                            </div>
                            <div className="rounded-lg bg-secondary/40 p-3 text-center border border-border/30">
                              <div className="text-[9px] text-muted-foreground uppercase font-semibold">Profit Factor</div>
                              <div className="mt-1 text-lg font-bold text-primary">{backtest.stats.profitFactor}</div>
                            </div>
                            <div className="rounded-lg bg-secondary/40 p-3 text-center border border-border/30">
                              <div className="text-[9px] text-muted-foreground uppercase font-semibold">Max Drawdown</div>
                              <div className="mt-1 text-lg font-bold text-danger">{backtest.stats.maxDrawdown}%</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-8">
                        <div className="h-64">
                          {backtest ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={backtest.series}>
                                <defs>
                                  <linearGradient id="stratColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                                  </linearGradient>
                                  <linearGradient id="benchColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#64748B" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#64748B" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} stroke="rgba(255,255,255,0.04)" />
                                <Tooltip
                                  contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`]}
                                />
                                <Area type="monotone" name="Benchmark (Buy & Hold)" dataKey="benchmark" stroke="#64748B" strokeDasharray="3 3" strokeWidth={1.5} fill="url(#benchColor)" />
                                <Area type="monotone" name="Strategy Equity" dataKey="strategy" stroke="#22C55E" strokeWidth={2} fill="url(#stratColor)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              Select a strategy and click Run Backtest to load results.
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-success" /> Strategy Equity</div>
                          <div className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-muted-foreground border-dashed" /> Benchmark (Buy & Hold)</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 2: TECHNICAL SIGNALS */}
              {activeTab === "technicals" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <Card className="col-span-12 xl:col-span-6 bg-card/50" title="Key Technical Oscillators & Moving Averages">
                    <div className="space-y-4">
                      {ext.technicalIndicators.map((ind) => (
                        <div key={ind.name} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/20 transition-all gap-2">
                          <div className="max-w-md">
                            <span className="text-xs font-semibold text-white">{ind.name}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{ind.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-white tracking-tight">{ind.value}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                              ind.signal === "BUY"
                                ? "bg-success/15 border-success/30 text-success"
                                : ind.signal === "SELL"
                                ? "bg-danger/15 border-danger/30 text-danger"
                                : "bg-secondary border-border text-muted-foreground"
                            }`}>
                              {ind.signal}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="col-span-12 xl:col-span-6 bg-card/50" title="AI Signal Detection Radar">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-success flex items-center gap-1 mb-3">
                          <TrendingUp className="h-4 w-4" /> Active Bullish Signals
                        </h4>
                        <div className="space-y-3">
                          {ext.bullishSignals.map((sig) => (
                            <div key={sig.name} className="bg-success/[0.02] border border-success/20 rounded-xl p-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-success">{sig.name}</span>
                                <span className="text-[9px] text-muted-foreground font-mono">Calculated from: {sig.data}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1.5">{sig.desc}</p>
                              <div className="mt-2.5 bg-secondary/50 p-2 rounded text-[10px] font-mono text-muted-foreground border border-border/30">
                                <span className="text-primary font-semibold">Algorithm: </span>{sig.logic}
                              </div>
                              <div className="mt-2 text-[10px] text-success/80">
                                <strong className="font-semibold text-white">Value for Traders: </strong>{sig.benefit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border/50 pt-4">
                        <h4 className="text-xs font-bold text-danger flex items-center gap-1 mb-3">
                          <TrendingDown className="h-4 w-4" /> Active Bearish Signals
                        </h4>
                        <div className="space-y-3">
                          {ext.bearishSignals.map((sig) => (
                            <div key={sig.name} className="bg-danger/[0.02] border border-danger/20 rounded-xl p-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-danger">{sig.name}</span>
                                <span className="text-[9px] text-muted-foreground font-mono">{sig.data}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1.5">{sig.desc}</p>
                              {sig.logic && (
                                <div className="mt-2 text-[10px] text-danger/80">
                                  <strong className="font-semibold text-white">Actionable Guard: </strong>{sig.benefit}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Derivatives Options Data Card */}
                  <Card className="col-span-12 bg-card/45" title="Derivatives & Options Intelligence" action={<Pill tone="info">F&O Analytics</Pill>}>
                    {ext.optionsData ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-1">
                        {/* Call/Put OI distribution bar chart */}
                        <div className="lg:col-span-7">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="text-xs font-bold text-white">Call vs Put Open Interest (OI) Distribution</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Strike-by-strike open interest pinning comparison.</p>
                            </div>
                            <div className="flex gap-3 text-[9px] text-muted-foreground font-semibold">
                              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-danger/70" /> Call OI (Resistance)</span>
                              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-success/70" /> Put OI (Support)</span>
                            </div>
                          </div>
                          
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={ext.optionsData.oiDistribution} margin={{ left: -10, right: 10, bottom: -5, top: 5 }}>
                                <XAxis dataKey="strike" tick={{ fill: "#64748B", fontSize: 10 }} stroke="rgba(255,255,255,0.04)" />
                                <YAxis tick={{ fill: "#64748B", fontSize: 8 }} stroke="rgba(255,255,255,0.04)" formatter={(v) => `${(Number(v) / 100000).toFixed(0)}L`} />
                                <Tooltip
                                  contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                                  formatter={(value: any) => [`${Number(value).toLocaleString("en-IN")} units`]}
                                />
                                <Bar dataKey="callOi" name="Call OI" fill="#EF4444" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="putOi" name="Put OI" fill="#22C55E" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Options stats indicators */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div
                              onClick={() => triggerLearning("Put-Call Ratio")}
                              className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Put-Call Ratio (PCR)</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xl font-black text-white mt-1.5">{ext.optionsData.pcr.toFixed(2)}</div>
                              <span className={`text-[9px] mt-1 block font-semibold ${ext.optionsData.pcr >= 1.0 ? "text-success" : "text-danger"}`}>
                                {ext.optionsData.pcr >= 1.0 ? "Bullish Floor Support" : "Bearish Overhead Resistance"}
                              </span>
                            </div>

                            <div
                              onClick={() => triggerLearning("Max Pain")}
                              className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Max Pain Strike</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xl font-black text-white mt-1.5">₹{ext.optionsData.maxPain.toLocaleString("en-IN")}</div>
                              <span className="text-[9px] text-muted-foreground mt-1 block">Expected Expiry Pin Strike</span>
                            </div>

                            <div
                              onClick={() => triggerLearning("Implied Volatility")}
                              className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Implied Volatility (IV)</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xl font-black text-white mt-1.5">{ext.optionsData.iv.toFixed(1)}%</div>
                              <span className="text-[9px] text-success font-semibold mt-1 block">Low IV (Calm Option Premiums)</span>
                            </div>

                            <div className="bg-secondary/40 p-4 rounded-xl border border-border/30">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">OI Build Up Status</span>
                              <div className="text-sm font-black text-primary mt-2 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                {ext.optionsData.oiBuildUp}
                              </div>
                              <span className="text-[8px] text-muted-foreground mt-2 block">Identifies short/long sector trends</span>
                            </div>
                          </div>

                          <div className="bg-primary/[0.02] border border-primary/20 p-3.5 rounded-xl text-[10px] text-muted-foreground leading-relaxed flex gap-2">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 animate-pulse mt-0.5" />
                            <div>
                              <strong className="text-white font-semibold block mb-0.5">AI Options Diagnostic:</strong>
                              Call options writing concentration at ₹{ext.optionsData.oiDistribution[ext.optionsData.oiDistribution.length - 1].strike} establishes a major structural resistance barrier, while massive put writing at ₹{ext.optionsData.oiDistribution[0].strike} provides a strong swing trading floor.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2.5">
                        <Info className="h-7 w-7 text-primary/40" />
                        <div>
                          <span className="text-white font-bold block mb-1">Derivatives & Options Trading Inactive</span>
                          Option chains are not active/traded for this asset class ({ext.sector} · {ext.industry}).
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* TAB 3: FUNDAMENTALS */}
              {activeTab === "fundamentals" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-xl border border-border/40">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" />
                      Hover over any metric for definitions. Tap Beginner Mode for intuitive explanations.
                    </span>
                    <button
                      onClick={() => setBeginnerGlossary(!beginnerGlossary)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                        beginnerGlossary
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground"
                      }`}
                    >
                      {beginnerGlossary ? "Beginner Mode: ON" : "Turn ON Beginner Mode"}
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-6">
                    {ext.fundamentals.map((cat) => (
                      <Card key={cat.category} className="col-span-12 xl:col-span-6 bg-card/50" title={`${cat.category} Analysis`}>
                        <div className="space-y-4">
                          {cat.metrics.map((m) => (
                            <div
                              key={m.name}
                              onClick={() => triggerLearning(m.name, m)}
                              className="p-3.5 rounded-xl bg-secondary/25 border border-border/30 hover:border-primary/25 hover:bg-secondary/45 hover:border-primary/40 transition-all cursor-pointer group/item"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white group-hover/item:text-primary transition-colors">{m.name}</span>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover/item:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm font-black text-white tabular-nums">{m.value}</span>
                              </div>

                              <p className="text-[10px] text-muted-foreground mt-1">{m.meaning}</p>

                              {beginnerGlossary ? (
                                <div className="mt-2 bg-primary/[0.04] border border-primary/20 p-2.5 rounded-lg text-[11px] text-muted-foreground flex gap-2">
                                  <Sparkles className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                                  <div>
                                    <strong className="font-semibold text-primary">Beginner Analogy: </strong>
                                    {m.explanation}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground border-t border-border/20 pt-2">
                                  <span>Good threshold: <strong className="text-success font-medium">{m.goodValue}</strong></span>
                                  <span>Overvalued threshold: <strong className="text-danger font-medium">{m.badValue}</strong></span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: FINANCIAL STATEMENTS */}
              {activeTab === "financials" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <Card className="col-span-12 xl:col-span-7 bg-card/45" title="Income Statement Overview" action={
                    <div className="flex gap-1.5 text-[10px]">
                      <Pill tone="info">INR in Crores (₹ Cr)</Pill>
                    </div>
                  }>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/60">
                            <th className="py-2.5 text-muted-foreground font-semibold">Reporting Period</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">Total Revenue</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">Operating Profit (EBITDA)</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">Net Profit (PAT)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {ext.financials.quarterly.map((q) => (
                            <tr key={q.period} className="hover:bg-secondary/10">
                              <td className="py-3 font-semibold text-white">{q.period}</td>
                              <td className="py-3 text-right tabular-nums">₹{q.revenue.toLocaleString()} Cr</td>
                              <td className="py-3 text-right tabular-nums text-primary">₹{q.ebitda.toLocaleString()} Cr</td>
                              <td className="py-3 text-right tabular-nums text-success font-semibold">₹{q.netProfit.toLocaleString()} Cr</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Chart trend */}
                    <div className="h-56 mt-6 pt-3 border-t border-border/30">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ext.financials.quarterly}>
                          <XAxis dataKey="period" tick={{ fill: "#64748B", fontSize: 10 }} stroke="rgba(255,255,255,0.04)" />
                          <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11 }} />
                          <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={1} />
                          <Bar dataKey="netProfit" name="Net Profit" fill="#22C55E" radius={1} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="col-span-12 xl:col-span-5 bg-card/45" title="Annual Balance Sheet Summary">
                    <div className="space-y-4">
                      {ext.financials.yearly.map((yr) => (
                        <div key={yr.period} className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                          <div className="flex justify-between items-center border-b border-border/30 pb-2">
                            <span className="text-xs font-extrabold text-white">{yr.period} Reporting</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Audited</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                            <div className="bg-secondary/40 p-2.5 rounded border border-border/30">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Total Assets</span>
                              <div className="text-sm font-bold text-white mt-0.5">₹{yr.assets.toLocaleString()} Cr</div>
                            </div>
                            <div className="bg-secondary/40 p-2.5 rounded border border-border/30">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Liabilities</span>
                              <div className="text-sm font-bold text-white mt-0.5">₹{yr.liabilities.toLocaleString()} Cr</div>
                            </div>
                          </div>
                          <div className="mt-2.5 text-[10px] text-muted-foreground flex justify-between">
                            <span>Computed Debt-Equity: <strong className="text-white">{(yr.liabilities / (yr.assets - yr.liabilities)).toFixed(2)}</strong></span>
                            <span>Net Worth: <strong className="text-success">₹{(yr.assets - yr.liabilities).toLocaleString()} Cr</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-primary/[0.02] border border-primary/20 p-4 rounded-xl">
                      <h4 className="text-xs font-semibold text-white flex items-center gap-1 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Balance Sheet Diagnostic AI Synthesis
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Operating cash flows are growing faster than capital expenditures, validating organic expansion without reliance on levered credit lines.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 5: SHAREHOLDING & ACTIVITY */}
              {activeTab === "shareholding" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <Card className="col-span-12 xl:col-span-6 bg-card/45" title="Ownership Structure Allocations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={ext.shareholding.pattern}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="pct"
                            >
                              {ext.shareholding.pattern.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-2">
                        {ext.shareholding.pattern.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded bg-secondary/25 border border-border/30">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-muted-foreground font-semibold">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span>{item.pct}%</span>
                              <span className={`text-[10px] ${item.qoq.startsWith("+") ? "text-success" : item.qoq.startsWith("-") ? "text-danger" : "text-muted-foreground"}`}>{item.qoq}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 bg-warning/[0.02] border border-warning/20 p-4 rounded-xl flex gap-3 items-start">
                      <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-warning uppercase">Promoter Pledges & Safety Scan</span>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {ext.shareholding.pledgeInfo} Risk Level: <strong className="text-white">{ext.shareholding.pledgeRisk}</strong>
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="col-span-12 xl:col-span-6 bg-card/45" title="Recent Bulk, Block & Insider Activity Log">
                    <div className="space-y-4">
                      {ext.shareholding.deals.length > 0 ? (
                        ext.shareholding.deals.map((deal, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-secondary/35 border border-border/30 hover:border-primary/20 transition-all text-xs">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white">{deal.party}</span>
                                <Pill tone={deal.type === "Bulk Deal" ? "info" : "default"}>{deal.type}</Pill>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-semibold">{deal.date}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-border/20">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${deal.action === "BUY" ? "bg-success/15 border-success/30 text-success" : "bg-danger/15 border-danger/30 text-danger"}`}>{deal.action}</span>
                              <span className="text-muted-foreground">Volume: <strong className="text-white">{deal.qty}</strong></span>
                              <span className="text-muted-foreground">Execution Price: <strong className="text-white">{deal.price}</strong></span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-xs text-muted-foreground">
                          No large bulk deals or insider listings flagged on this ticker inside the last 30 days.
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 6: NEWS & ACTIONS */}
              {activeTab === "news_actions" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <Card className="col-span-12 xl:col-span-7 bg-card/45" title="Premium AI Sentiment News Feed">
                    <div className="space-y-4">
                      {ext.news.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/25 transition-all">
                          <div className="flex justify-between items-center gap-4">
                            <h4 className="text-xs font-bold text-white leading-snug">{item.headline}</h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.sentiment >= 5 ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"}`}>
                                Sentiment: {item.sentiment >= 0 ? "+" : ""}{item.sentiment}/10
                              </span>
                              <Pill tone={item.impact === "High" ? "danger" : "info"}>Impact: {item.impact}</Pill>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 pl-3 border-l-2 border-primary/40">
                            {item.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="col-span-12 xl:col-span-5 bg-card/45" title="Corporate Actions & Events Timeline">
                    <div className="space-y-4">
                      {ext.actionsAndEvents.map((ev, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-secondary/25 border border-border/30 flex gap-3 items-start">
                          <div className="bg-primary/10 border border-primary/25 text-primary text-[10px] font-extrabold uppercase px-2 py-1 rounded shrink-0">
                            {ev.type}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{ev.date}</span>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{ev.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 7: RISK & PEERS */}
              {activeTab === "risk_peers" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <Card className="col-span-12 xl:col-span-4 bg-card/45" title="Quant Risk Gauges">
                     <div className="space-y-4 text-xs">
                      <div
                        onClick={() => triggerLearning("Sovereign Beta")}
                        className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div>
                          <span className="text-muted-foreground font-semibold group-hover:text-primary transition-colors">Sovereign Beta (Sensitivity)</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Compares asset swings vs NIFTY index.</p>
                        </div>
                        <span className="text-lg font-black text-white group-hover:text-primary transition-colors">{ext.risk.beta}</span>
                      </div>

                      <div
                        onClick={() => triggerLearning("Volatility")}
                        className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div>
                          <span className="text-muted-foreground font-semibold group-hover:text-primary transition-colors">Volatility Standard Deviation</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Measures variation in annual returns.</p>
                        </div>
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors">{ext.risk.volatility}</span>
                      </div>

                      <div
                        onClick={() => triggerLearning("Maximum Drawdown")}
                        className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div>
                          <span className="text-muted-foreground font-semibold group-hover:text-primary transition-colors">Maximum Historical Drawdown</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Peak-to-trough drop over last 3 years.</p>
                        </div>
                        <span className="text-sm font-black text-danger/80 group-hover:text-danger transition-colors">{ext.risk.drawdown}</span>
                      </div>

                      <div
                        onClick={() => triggerLearning("Value at Risk")}
                        className="bg-secondary/40 p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div>
                          <span className="text-muted-foreground font-semibold group-hover:text-primary transition-colors">Value at Risk (VaR 1D 99%)</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Maximum estimated loss with 99% probability.</p>
                        </div>
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors">{ext.risk.varVal}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="col-span-12 xl:col-span-8 bg-card/45" title="Competitive Sector Peer Comparison">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/60">
                            <th className="py-2.5 text-muted-foreground font-semibold">Peer Ticker</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">Market Cap</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">P/E Ratio</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">ROE %</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">Revenue Growth</th>
                            <th className="py-2.5 text-right text-muted-foreground font-semibold">1Y Return</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {[
                            { symbol: currentSymbol, mcap: stock.metrics.find(m => m.label === "Market Cap")?.value || "N/A", pe: stock.metrics.find(m => m.label === "P/E")?.value || "N/A", roe: stock.metrics.find(m => m.label === "ROE")?.value || "N/A", growth: "+15.2%", returns1y: "+12.4%" },
                            { symbol: currentSymbol === "HDFCBANK" ? "ICICIBANK" : "MARUTI", mcap: "₹8.4T", pe: "17.1", roe: "18.5%", growth: "+18.4%", returns1y: "+24.1%" },
                            { symbol: currentSymbol === "HDFCBANK" ? "AXISBANK" : "M&M", mcap: "₹3.6T", pe: "14.8", roe: "15.2%", growth: "+12.1%", returns1y: "+18.0%" }
                          ].map((peer) => (
                            <tr key={peer.symbol} className={`hover:bg-secondary/10 ${peer.symbol === currentSymbol ? "bg-primary/[0.03]" : ""}`}>
                              <td className="py-3 font-semibold text-white">{peer.symbol} {peer.symbol === currentSymbol && <span className="text-[9px] text-primary font-bold">(Active)</span>}</td>
                              <td className="py-3 text-right tabular-nums">{peer.mcap}</td>
                              <td className="py-3 text-right tabular-nums">{peer.pe}</td>
                              <td className="py-3 text-right tabular-nums">{peer.roe}</td>
                              <td className="py-3 text-right tabular-nums text-primary font-medium">{peer.growth}</td>
                              <td className="py-3 text-right tabular-nums text-success font-semibold">{peer.returns1y}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 8: AI SANDBOX TERMINAL */}
              {activeTab === "ai_sandbox" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <Card className="col-span-12 xl:col-span-5 bg-card/45" title="Interactive AI Copilot Command Panel">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select one of TradeOS AI's exclusive neural engines below to scan the active asset and generate immediate synthesis:
                    </p>
                    <div className="mt-4 space-y-3">
                      <button
                        onClick={() => executeCopilotSandbox("doctor")}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/35 border border-border/40 hover:border-primary/40 hover:bg-secondary transition-all text-xs cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse" />
                          <div>
                            <span className="font-bold text-white">Execute AI Portfolio Doctor</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Scans correlation & concentration risks.</p>
                          </div>
                        </div>
                        <Play className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>

                      <button
                        onClick={() => executeCopilotSandbox("moving")}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/35 border border-border/40 hover:border-primary/40 hover:bg-secondary transition-all text-xs cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="h-4.5 w-4.5 text-success shrink-0 animate-pulse" />
                          <div>
                            <span className="font-bold text-white">AI Why Is Stock Moving?</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Parses live charts, volumes & headlines.</p>
                          </div>
                        </div>
                        <Play className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>

                      <button
                        onClick={() => executeCopilotSandbox("review")}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/35 border border-border/40 hover:border-primary/40 hover:bg-secondary transition-all text-xs cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="h-4.5 w-4.5 text-purple-400 shrink-0 animate-pulse" />
                          <div>
                            <span className="font-bold text-white">AI Trade Review Journal</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Grades entry position size & setups.</p>
                          </div>
                        </div>
                        <Play className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    </div>
                  </Card>

                  <Card className="col-span-12 xl:col-span-7 bg-card/45 border-primary/20" title="AI Terminal Streaming Output" action={
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Neuromorphic Synth</span>
                    </div>
                  }>
                    <div className="bg-secondary/20 rounded-xl p-5 min-h-[220px] font-mono text-[11px] leading-relaxed border border-border/30 flex flex-col justify-between">
                      {isTypingCopilot ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12 text-muted-foreground">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          <span className="animate-pulse">Retrieving vector contexts from pgvector news DB...</span>
                        </div>
                      ) : copilotResponse ? (
                        <pre className="whitespace-pre-wrap text-muted-foreground flex-1 font-medium select-text">{copilotResponse}</pre>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground flex-1 flex flex-col items-center justify-center gap-2">
                          <Sparkles className="h-8 w-8 text-primary/30" />
                          <span>AI Layer outputs will stream here in real-time.</span>
                        </div>
                      )}

                      <div className="border-t border-border/30 pt-3 mt-3 flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>Model: Gemini 1.5 Pro (Fine-tuned Quant)</span>
                        <span>Tokens Injected: ~1,536 contexts</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* AI Learning Layer slide-over modal */}
      <AnimatePresence>
        {selectedLearningMetric && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLearningMetric(null)}
              className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative h-full w-full max-w-md bg-card border-l border-border/80 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-border/40 pb-4">
                  <div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 animate-pulse" /> TradeOS AI Learning Layer
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">{selectedLearningMetric.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedLearningMetric(null)}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-white hover:bg-secondary/40 transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="mt-6 space-y-6 text-xs">
                  {/* Meaning Section */}
                  <div>
                    <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Meaning & Importance</h4>
                    <p className="text-sm font-semibold text-white leading-relaxed bg-secondary/20 p-3.5 rounded-xl border border-border/30">{selectedLearningMetric.meaning}</p>
                  </div>

                  {/* Formula Section */}
                  <div>
                    <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Mathematical Formula</h4>
                    <div className="font-mono bg-secondary/45 p-3 rounded-lg border border-border/30 text-white break-all">{selectedLearningMetric.formula}</div>
                  </div>

                  {/* Good vs Bad thresholds */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-success/5 border border-success/20 p-3 rounded-xl">
                      <span className="text-[9px] text-success font-bold uppercase">Optimal Range</span>
                      <div className="text-white font-bold mt-1 leading-snug">{selectedLearningMetric.goodValue}</div>
                    </div>
                    <div className="bg-danger/5 border border-danger/20 p-3 rounded-xl">
                      <span className="text-[9px] text-danger font-bold uppercase">Critical Range</span>
                      <div className="text-white font-bold mt-1 leading-snug">{selectedLearningMetric.badValue}</div>
                    </div>
                  </div>

                  {/* Beginner Analogy Example */}
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-primary animate-pulse" /> Beginner Analogy Example
                    </span>
                    <p className="text-muted-foreground mt-2 leading-relaxed font-semibold">{selectedLearningMetric.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Quick AI Diagnostic Context */}
              <div className="border-t border-border/40 pt-4 mt-6">
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/30">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Live {currentSymbol} Diagnostic
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                    TradeOS models identify that {currentSymbol}'s current value is within safe operating ranges, indicating solid risk-adjusted holding potential.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLearningMetric(null)}
                  className="w-full mt-4 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
                >
                  Got it, close guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline Stars Icon component for tabs navigation
function StarsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
