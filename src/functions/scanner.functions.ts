import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "../server/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const scannerSchema = z.object({
  query: z.string().optional(),
  preset: z.string().optional(),
});

const allScannerResults = [
  { symbol: "TATAMOTORS", name: "Tata Motors", setup: "Breakout · 52W High", score: 92, change: 4.21, volume: "3.2x", risk: "Medium" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", setup: "Reversal · RSI Divergence", score: 88, change: 2.04, volume: "2.1x", risk: "Low" },
  { symbol: "ADANIENT", name: "Adani Enterprises", setup: "Volatility Squeeze", score: 85, change: 3.71, volume: "4.8x", risk: "High" },
  { symbol: "ICICIBANK", name: "ICICI Bank", setup: "Trend Continuation", score: 83, change: 1.12, volume: "1.6x", risk: "Low" },
  { symbol: "MARUTI", name: "Maruti Suzuki", setup: "Cup & Handle", score: 81, change: 1.84, volume: "1.9x", risk: "Medium" },
  { symbol: "LT", name: "Larsen & Toubro", setup: "Pullback Entry", score: 79, change: 0.92, volume: "1.3x", risk: "Low" },
  { symbol: "SBIN", name: "State Bank of India", setup: "Breakout · Volume Surge", score: 78, change: 2.31, volume: "2.7x", risk: "Medium" },
  { symbol: "RELIANCE", name: "Reliance Industries", setup: "Resistance Breakout", score: 84, change: 1.42, volume: "1.8x", risk: "Low" },
  { symbol: "TCS", name: "Tata Consultancy", setup: "Oversold Reversal", score: 62, change: -0.32, volume: "0.9x", risk: "Low" },
  { symbol: "HDFCBANK", name: "HDFC Bank", setup: "Pullback Entry", score: 77, change: 0.84, volume: "1.2x", risk: "Low" },
  { symbol: "INFY", name: "Infosys", setup: "Oversold Reversal", score: 48, change: -1.18, volume: "1.5x", risk: "Medium" },
  { symbol: "ITC", name: "ITC Limited", setup: "Trend Continuation", score: 75, change: 0.18, volume: "1.1x", risk: "Low" },
];

export const getScannerResults = createServerFn({ method: "POST" })
  .inputValidator(scannerSchema)
  .handler(async ({ data }) => {
    await requireUser();

    let filtered = [...allScannerResults];

    if (data.preset) {
      const presetLower = data.preset.toLowerCase();
      if (presetLower === "breakouts") {
        filtered = filtered.filter(r => r.setup.toLowerCase().includes("breakout") || r.setup.toLowerCase().includes("high"));
      } else if (presetLower === "reversals") {
        filtered = filtered.filter(r => r.setup.toLowerCase().includes("reversal") || r.setup.toLowerCase().includes("divergence"));
      } else if (presetLower === "volume surge") {
        filtered = filtered.filter(r => parseFloat(r.volume) > 2.0);
      } else if (presetLower === "52w highs") {
        filtered = filtered.filter(r => r.setup.toLowerCase().includes("52w"));
      } else if (presetLower === "oversold") {
        filtered = filtered.filter(r => r.score < 60);
      }
    }

    if (data.query) {
      const queryLower = data.query.toLowerCase();
      filtered = filtered.filter(
        r => r.symbol.toLowerCase().includes(queryLower) ||
             r.name.toLowerCase().includes(queryLower) ||
             r.setup.toLowerCase().includes(queryLower)
      );
    }

    return {
      success: true,
      data: filtered,
    };
  });
