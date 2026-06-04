// Mock data for TradeOS AI — Indian market focused

export const niftySeries = Array.from({ length: 48 }).map((_, i) => {
  const base = 22400 + Math.sin(i / 3) * 180 + i * 6;
  return {
    t: `${9 + Math.floor(i / 4)}:${(i % 4) * 15 === 0 ? "00" : (i % 4) * 15}`,
    value: Math.round(base + (Math.random() - 0.5) * 40),
  };
});

export const portfolioSeries = Array.from({ length: 30 }).map((_, i) => ({
  d: `D${i + 1}`,
  value: Math.round(840000 + i * 4200 + Math.sin(i / 2) * 9000),
  benchmark: Math.round(840000 + i * 3000 + Math.sin(i / 3) * 5000),
}));

export const watchlist = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2945.6, change: 1.42, sentiment: "Bullish" },
  { symbol: "TCS", name: "Tata Consultancy", price: 4120.1, change: -0.32, sentiment: "Neutral" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1672.4, change: 0.84, sentiment: "Bullish" },
  { symbol: "INFY", name: "Infosys", price: 1840.7, change: -1.18, sentiment: "Bearish" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 7240.3, change: 2.61, sentiment: "Bullish" },
  { symbol: "ITC", name: "ITC Limited", price: 459.2, change: 0.18, sentiment: "Neutral" },
];

export const scannerResults = [
  { symbol: "TATAMOTORS", name: "Tata Motors", setup: "Breakout · 52W High", score: 92, change: 4.21, volume: "3.2x", risk: "Medium" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", setup: "Reversal · RSI Divergence", score: 88, change: 2.04, volume: "2.1x", risk: "Low" },
  { symbol: "ADANIENT", name: "Adani Enterprises", setup: "Volatility Squeeze", score: 85, change: 3.71, volume: "4.8x", risk: "High" },
  { symbol: "ICICIBANK", name: "ICICI Bank", setup: "Trend Continuation", score: 83, change: 1.12, volume: "1.6x", risk: "Low" },
  { symbol: "MARUTI", name: "Maruti Suzuki", setup: "Cup & Handle", score: 81, change: 1.84, volume: "1.9x", risk: "Medium" },
  { symbol: "LT", name: "Larsen & Toubro", setup: "Pullback Entry", score: 79, change: 0.92, volume: "1.3x", risk: "Low" },
  { symbol: "SBIN", name: "State Bank of India", setup: "Breakout · Volume Surge", score: 78, change: 2.31, volume: "2.7x", risk: "Medium" },
];

export const opportunityFeed = [
  { time: "2m ago", title: "TATAMOTORS breaking out of 6-week consolidation", tag: "Breakout", level: "high" },
  { time: "14m ago", title: "Banking sector momentum turning positive — 4 stocks flagged", tag: "Sector", level: "medium" },
  { time: "38m ago", title: "DIVISLAB shows bullish RSI divergence on 1H chart", tag: "Reversal", level: "high" },
  { time: "1h ago", title: "FII net buying ₹1,842 Cr — sentiment shifts bullish", tag: "Flow", level: "medium" },
  { time: "2h ago", title: "INFY approaching key support — risk/reward favorable", tag: "Setup", level: "low" },
];

export const holdings = [
  { symbol: "HDFCBANK", qty: 42, avg: 1582.4, ltp: 1672.4, pnl: 3780, pnlPct: 5.69, alloc: 18 },
  { symbol: "RELIANCE", qty: 28, avg: 2810.0, ltp: 2945.6, pnl: 3796.8, pnlPct: 4.83, alloc: 22 },
  { symbol: "TCS", qty: 12, avg: 4220.5, ltp: 4120.1, pnl: -1204.8, pnlPct: -2.38, alloc: 14 },
  { symbol: "INFY", qty: 60, avg: 1720.0, ltp: 1840.7, pnl: 7242, pnlPct: 7.02, alloc: 19 },
  { symbol: "ITC", qty: 220, avg: 432.1, ltp: 459.2, pnl: 5962, pnlPct: 6.27, alloc: 17 },
  { symbol: "BAJFINANCE", qty: 4, avg: 6890.0, ltp: 7240.3, pnl: 1401.2, pnlPct: 5.08, alloc: 10 },
];

export const courses = [
  { title: "Technical Analysis Foundations", level: "Beginner", lessons: 18, progress: 72, duration: "4h 20m", color: "#3B82F6" },
  { title: "Risk Management Mastery", level: "Intermediate", lessons: 12, progress: 41, duration: "3h 10m", color: "#22C55E" },
  { title: "Options Strategy Playbook", level: "Advanced", lessons: 24, progress: 18, duration: "6h 45m", color: "#A855F7" },
  { title: "Behavioral Finance & Psychology", level: "All Levels", lessons: 14, progress: 88, duration: "3h 50m", color: "#F59E0B" },
];

export const alerts = [
  { type: "Price", symbol: "RELIANCE", message: "Crossed above ₹2,940", time: "Just now", severity: "info" },
  { type: "Risk", symbol: "PORTFOLIO", message: "Concentration in Banking >30%", time: "12m ago", severity: "warn" },
  { type: "AI", symbol: "TATAMOTORS", message: "Breakout confirmed with 3.2x volume", time: "28m ago", severity: "success" },
  { type: "Stop", symbol: "INFY", message: "Approaching stop-loss at ₹1,820", time: "1h ago", severity: "danger" },
];

export const journalEntries = [
  { date: "Today", symbol: "TATAMOTORS", side: "BUY", qty: 25, price: 982.4, pnl: 1240, notes: "Breakout entry, volume confirmed.", grade: "A" },
  { date: "Yesterday", symbol: "INFY", side: "SELL", qty: 30, price: 1845.0, pnl: -480, notes: "Exited early on weak close.", grade: "B" },
  { date: "2d ago", symbol: "BAJFINANCE", side: "BUY", qty: 4, price: 6890, pnl: 1401, notes: "Trend following swing.", grade: "A" },
  { date: "4d ago", symbol: "HDFCBANK", side: "BUY", qty: 12, price: 1582, pnl: 3780, notes: "Pullback to 50 DMA.", grade: "A+" },
];

export const sectors = [
  { name: "Banking", change: 1.42 },
  { name: "IT", change: -0.82 },
  { name: "Auto", change: 2.31 },
  { name: "Pharma", change: 0.71 },
  { name: "Energy", change: 1.04 },
  { name: "FMCG", change: 0.18 },
  { name: "Metals", change: -1.12 },
  { name: "Realty", change: 2.87 },
];

export const stockCandles = Array.from({ length: 60 }).map((_, i) => {
  const base = 940 + i * 1.2 + Math.sin(i / 4) * 12;
  const open = base + (Math.random() - 0.5) * 4;
  const close = base + (Math.random() - 0.5) * 6;
  return {
    t: i,
    open: +open.toFixed(2),
    close: +close.toFixed(2),
    high: +(Math.max(open, close) + Math.random() * 4).toFixed(2),
    low: +(Math.min(open, close) - Math.random() * 4).toFixed(2),
    value: +close.toFixed(2),
  };
});

export const testimonials = [
  { name: "Aarav Mehta", role: "Swing Trader, Mumbai", quote: "TradeOS is the first tool that actually thinks with me. The AI Coach catches mistakes before I make them.", initial: "AM" },
  { name: "Priya Iyer", role: "Long-term Investor", quote: "Portfolio Intelligence showed me hidden concentration risks across mutual funds and stocks. Eye-opening.", initial: "PI" },
  { name: "Rohan Kapoor", role: "F&O Trader, Bengaluru", quote: "The scanner found 3 setups in a week I would have missed. Pays for itself in a single trade.", initial: "RK" },
  { name: "Ananya Singh", role: "Trader & Analyst", quote: "Feels like Bloomberg Terminal designed for humans. Finally a tool I want to open every morning.", initial: "AS" },
];

export const faqs = [
  { q: "Is TradeOS AI a broker?", a: "No. TradeOS is an intelligence layer that connects to your existing broker (Zerodha, Upstox, Groww) and helps you make better decisions." },
  { q: "Does the AI give buy/sell calls?", a: "We don't give calls. We surface opportunities, explain setups, quantify risk and let you decide — like a senior analyst sitting beside you." },
  { q: "Is my data safe?", a: "Read-only broker access. Bank-grade encryption. We never place orders without your explicit confirmation." },
  { q: "Which markets are supported?", a: "NSE & BSE equities, indices, F&O, and major ETFs. International coverage is on the roadmap." },
  { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month with no lock-in." },
];
