// Mock Stock & Bond Instruments Database - TradeOS SaaS

export interface Bond {
  symbol: string;
  name: string;
  yieldPct: number;
  couponPct: number;
  rating: string;
  maturity: string;
  minInvestment: number;
}

export interface ProductTool {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export interface MoverStock {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  marketCap: string;
}

export const listedBonds: Bond[] = [
  { symbol: "SGB2031VIII", name: "Sovereign Gold Bonds 2.50% Nov 2031", yieldPct: 6.84, couponPct: 2.50, rating: "Sovereign", maturity: "Nov 2031", minInvestment: 6840 },
  { symbol: "NHAI29TF", name: "NHAI Tax-Free Bonds Series I", yieldPct: 5.92, couponPct: 7.35, rating: "AAA", maturity: "Dec 2029", minInvestment: 10000 },
  { symbol: "PFC32TF", name: "Power Finance Corp Tax-Free 2032", yieldPct: 6.10, couponPct: 7.62, rating: "AAA", maturity: "Mar 2032", minInvestment: 10000 },
  { symbol: "RECL34TF", name: "REC Limited Tax-Free Bonds", yieldPct: 6.08, couponPct: 7.45, rating: "AAA", maturity: "Aug 2034", minInvestment: 10000 },
  { symbol: "GS2034_718", name: "Government of India G-Sec 7.18% 2034", yieldPct: 7.14, couponPct: 7.18, rating: "Sovereign", maturity: "Jul 2034", minInvestment: 10000 },
  { symbol: "TATACHEM28", name: "Tata Chemicals 7.85% NCD", yieldPct: 7.92, couponPct: 7.85, rating: "AA+", maturity: "Jun 2028", minInvestment: 100000 },
];

export const productsSuite: ProductTool[] = [
  { id: "screener", name: "Screener", description: "Filter 4,000+ stocks based on 150+ metrics", badge: "Core" },
  { id: "mtf", name: "MTF (Margin)", description: "4x buying leverage at industry-lowest rates", badge: "4x Leverage" },
  { id: "sip", name: "Stock SIP", description: "Automated daily, weekly, or monthly equity plans" },
  { id: "etf", name: "ETFs", description: "Low-cost index, gold, and sector trackers" },
  { id: "ipo", name: "IPO Hub", description: "One-click pre-apply and allocation probability analysis", badge: "New" },
  { id: "bonds", name: "Bonds Store", description: "High-yield corporate and sovereign gold bonds" },
  { id: "intraday", name: "IntraDay Desk", description: "Advanced heatmaps, block-deal charts, and speed-grids", badge: "Active" },
  { id: "events", name: "Events Calendar", description: "Corporate actions, earnings releases, and dividend timelines" },
  { id: "track", name: "Portfolio Tracker", description: "Consolidated multi-broker analytics tracker" },
];

export const largeCapMovers: { gainers: MoverStock[]; losers: MoverStock[] } = {
  gainers: [
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", price: 982.40, changePct: 4.21, marketCap: "₹3.58L Cr" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", price: 7240.30, changePct: 2.61, marketCap: "₹4.48L Cr" },
    { symbol: "SBIN", name: "State Bank of India", price: 812.40, changePct: 2.31, marketCap: "₹7.25L Cr" },
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2945.60, changePct: 1.42, marketCap: "₹19.92L Cr" },
  ],
  losers: [
    { symbol: "INFY", name: "Infosys Ltd.", price: 1840.70, changePct: -1.18, marketCap: "₹7.64L Cr" },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 4120.10, changePct: -0.82, marketCap: "₹14.98L Cr" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 1118.20, changePct: -0.64, marketCap: "₹7.84L Cr" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", price: 2340.50, changePct: -0.52, marketCap: "₹5.49L Cr" },
  ]
};

export const smallCapMovers: { gainers: MoverStock[]; losers: MoverStock[] } = {
  gainers: [
    { symbol: "SUDARSCHEM", name: "Sudarshan Chemical Ind.", price: 812.40, changePct: 8.45, marketCap: "₹5.6K Cr" },
    { symbol: "MAHLOG", name: "Mahindra Logistics Ltd.", price: 488.20, changePct: 6.92, marketCap: "₹3.5K Cr" },
    { symbol: "ZENSARTECH", name: "Zensar Technologies Ltd.", price: 624.50, changePct: 5.12, marketCap: "₹14.1K Cr" },
    { symbol: "EASEMYTRIP", name: "Easy Trip Planners Ltd.", price: 44.80, changePct: 4.84, marketCap: "₹7.9K Cr" },
  ],
  losers: [
    { symbol: "SHARDA-EQ", name: "Sharda Cropchem Ltd.", price: 390.40, changePct: -4.92, marketCap: "₹3.5K Cr" },
    { symbol: "MARKSANS", name: "Marksans Pharma Ltd.", price: 158.20, changePct: -3.85, marketCap: "₹7.2K Cr" },
    { symbol: "VOLTAMP", name: "Voltamp Transformers Ltd.", price: 8120.00, changePct: -3.12, marketCap: "₹8.2K Cr" },
    { symbol: "GPIL", name: "Godawari Power & Ispat", price: 742.00, changePct: -2.87, marketCap: "₹9.8K Cr" },
  ]
};

export const setupCompanies: Record<string, MoverStock[]> = {
  "Resistance Breakouts": [
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", price: 982.40, changePct: 4.21, marketCap: "₹3,58,420 Cr" },
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2945.60, changePct: 1.42, marketCap: "₹19,92,450 Cr" },
    { symbol: "SBIN", name: "State Bank of India", price: 812.40, changePct: 2.31, marketCap: "₹7,25,120 Cr" },
    { symbol: "DLF", name: "DLF Limited", price: 892.40, changePct: 3.12, marketCap: "₹2,20,540 Cr" },
  ],
  "MACD above Signal Line": [
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1672.40, changePct: 0.84, marketCap: "₹12,71,280 Cr" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", price: 7240.30, changePct: 2.61, marketCap: "₹4,48,600 Cr" },
    { symbol: "ITC", name: "ITC Limited", price: 459.20, changePct: 0.18, marketCap: "₹5,72,500 Cr" },
    { symbol: "LT", name: "Larsen & Toubro Ltd.", price: 3450.00, changePct: 0.92, marketCap: "₹4,74,100 Cr" },
  ],
  "RSI Overbought": [
    { symbol: "ADANIENT", name: "Adani Enterprises Ltd.", price: 3120.40, changePct: 3.71, marketCap: "₹3,55,400 Cr" },
    { symbol: "HAL", name: "Hindustan Aeronautics Ltd.", price: 4120.00, changePct: 4.82, marketCap: "₹2,75,400 Cr" },
    { symbol: "BHEL", name: "Bharat Heavy Electricals", price: 284.50, changePct: 5.12, marketCap: "₹99,100 Cr" },
  ],
  "RSI Oversold": [
    { symbol: "INFY", name: "Infosys Ltd.", price: 1840.70, changePct: -1.18, marketCap: "₹7,64,300 Cr" },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 4120.10, changePct: -0.82, marketCap: "₹14,98,400 Cr" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", price: 2340.50, changePct: -0.52, marketCap: "₹5,49,820 Cr" },
    { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", price: 2890.00, changePct: -1.45, marketCap: "₹2,77,200 Cr" },
  ]
};

export interface CompanyDetails {
  symbol: string;
  name: string;
  description: string;
  ceo: string;
  founded: string;
  employees: string;
  sector: string;
  fundamentals: {
    marketCap: string;
    peRatio: string;
    pbRatio: string;
    industryPe: string;
    debtToEquity: string;
  };
  financials: {
    yearly: { year: string; revenue: number; profit: number; netWorth: number }[];
    quarterly: { quarter: string; revenue: number; profit: number; netWorth: number }[];
  };
  shareholding: { name: string; value: number }[];
  similarStocks: { symbol: string; change: number; mcap: string; pe: string }[];
}

export const companyDataDict: Record<string, CompanyDetails> = {
  TATAMOTORS: {
    symbol: "TATAMOTORS",
    name: "Tata Motors Limited",
    description: "Tata Motors Limited is a leading global automobile manufacturer of cars, utility vehicles, buses, trucks, and defense vehicles. It is part of the legendary Tata Group.",
    ceo: "Girish Wagh",
    founded: "1945",
    employees: "50,800+",
    sector: "Auto - Cars & Trucks",
    fundamentals: {
      marketCap: "₹3,58,420 Cr",
      peRatio: "14.85",
      pbRatio: "4.82",
      industryPe: "21.40",
      debtToEquity: "0.62",
    },
    financials: {
      yearly: [
        { year: "FY22", revenue: 278450, profit: -11300, netWorth: 44250 },
        { year: "FY23", revenue: 345960, profit: 2410, netWorth: 48900 },
        { year: "FY24", revenue: 437920, profit: 31800, netWorth: 68500 },
      ],
      quarterly: [
        { quarter: "Q1 FY25", revenue: 108420, profit: 5560, netWorth: 74200 },
        { quarter: "Q2 FY25", revenue: 101450, profit: 3760, netWorth: 78500 },
        { quarter: "Q3 FY25", revenue: 110580, profit: 7025, netWorth: 85200 },
      ]
    },
    shareholding: [
      { name: "Promoters", value: 46.36 },
      { name: "FIIs", value: 18.24 },
      { name: "DIIs", value: 17.65 },
      { name: "Public", value: 17.75 },
    ],
    similarStocks: [
      { symbol: "MARUTI", change: 1.84, mcap: "₹3.82L Cr", pe: "26.4" },
      { symbol: "M&M", change: 2.92, mcap: "₹3.44L Cr", pe: "18.2" },
      { symbol: "ASHOKLEY", change: 0.92, mcap: "₹64K Cr", pe: "22.1" },
    ]
  },
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    description: "Reliance Industries Limited is an Indian multinational conglomerate, headquartered in Mumbai. Its diverse businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.",
    ceo: "Mukesh Ambani",
    founded: "1973",
    employees: "3,89,000+",
    sector: "Energy / Retail / Telecom",
    fundamentals: {
      marketCap: "₹19,92,450 Cr",
      peRatio: "27.42",
      pbRatio: "2.45",
      industryPe: "18.84",
      debtToEquity: "0.38",
    },
    financials: {
      yearly: [
        { year: "FY22", revenue: 765400, profit: 60700, netWorth: 780000 },
        { year: "FY23", revenue: 879500, profit: 66700, netWorth: 840000 },
        { year: "FY24", revenue: 974800, profit: 79020, netWorth: 924000 },
      ],
      quarterly: [
        { quarter: "Q1 FY25", revenue: 236400, profit: 19100, netWorth: 940000 },
        { quarter: "Q2 FY25", revenue: 242000, profit: 18900, netWorth: 960000 },
        { quarter: "Q3 FY25", revenue: 254800, profit: 20120, netWorth: 980000 },
      ]
    },
    shareholding: [
      { name: "Promoters", value: 50.39 },
      { name: "FIIs", value: 22.12 },
      { name: "DIIs", value: 16.54 },
      { name: "Public", value: 10.95 },
    ],
    similarStocks: [
      { symbol: "ONGC", change: 0.85, mcap: "₹3.42L Cr", pe: "8.4" },
      { symbol: "IOC", change: -1.24, mcap: "₹2.20L Cr", pe: "9.2" },
      { symbol: "BPCL", change: 0.42, mcap: "₹1.48L Cr", pe: "11.1" },
    ]
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    description: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets and the world's tenth-largest bank by market capitalization.",
    ceo: "Sashidhar Jagdishan",
    founded: "1994",
    employees: "1,77,000+",
    sector: "Banking - Private Sector",
    fundamentals: {
      marketCap: "₹12,71,280 Cr",
      peRatio: "18.45",
      pbRatio: "2.84",
      industryPe: "15.20",
      debtToEquity: "1.12",
    },
    financials: {
      yearly: [
        { year: "FY22", revenue: 157800, profit: 36900, netWorth: 240000 },
        { year: "FY23", revenue: 170750, profit: 44100, netWorth: 280000 },
        { year: "FY24", revenue: 228900, profit: 60800, netWorth: 432000 },
      ],
      quarterly: [
        { quarter: "Q1 FY25", revenue: 58900, profit: 16100, netWorth: 445000 },
        { quarter: "Q2 FY25", revenue: 61400, profit: 16820, netWorth: 460000 },
        { quarter: "Q3 FY25", revenue: 64120, profit: 17390, netWorth: 478000 },
      ]
    },
    shareholding: [
      { name: "Promoters", value: 0.00 }, // FII and DII heavy public shareholding bank
      { name: "FIIs", value: 47.24 },
      { name: "DIIs", value: 30.65 },
      { name: "Public", value: 22.11 },
    ],
    similarStocks: [
      { symbol: "ICICIBANK", change: -0.64, mcap: "₹7.84L Cr", pe: "16.8" },
      { symbol: "SBIN", change: 2.31, mcap: "₹7.25L Cr", pe: "10.4" },
      { symbol: "AXISBANK", change: 0.52, mcap: "₹3.20L Cr", pe: "14.2" },
    ]
  },
  BAJFINANCE: {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Limited",
    description: "Bajaj Finance Limited is an Indian non-banking financial company headquartered in Pune. It is one of the leading NBFCs in India, providing customer finance, SME loans, commercial lending, wealth management, and brokerage.",
    ceo: "Rajeev Jain",
    founded: "1987",
    employees: "40,000+",
    sector: "Financial Services / NBFC",
    fundamentals: {
      marketCap: "₹4,48,600 Cr",
      peRatio: "31.24",
      pbRatio: "7.12",
      industryPe: "24.50",
      debtToEquity: "3.42",
    },
    financials: {
      yearly: [
        { year: "FY22", revenue: 31640, profit: 7020, netWorth: 43200 },
        { year: "FY23", revenue: 41300, profit: 11500, netWorth: 54100 },
        { year: "FY24", revenue: 54120, profit: 14450, netWorth: 71200 },
      ],
      quarterly: [
        { quarter: "Q1 FY25", revenue: 14200, profit: 3910, netWorth: 74500 },
        { quarter: "Q2 FY25", revenue: 14850, profit: 3840, netWorth: 78200 },
        { quarter: "Q3 FY25", revenue: 15640, profit: 4120, netWorth: 82400 },
      ]
    },
    shareholding: [
      { name: "Promoters", value: 54.78 },
      { name: "FIIs", value: 19.82 },
      { name: "DIIs", value: 13.54 },
      { name: "Public", value: 11.86 },
    ],
    similarStocks: [
      { symbol: "CHOLAFIN", change: 1.12, mcap: "₹1.15L Cr", pe: "34.2" },
      { symbol: "MUTHOOTFIN", change: -0.42, mcap: "₹64K Cr", pe: "14.8" },
      { symbol: "SHRIRAMFIN", change: 0.95, mcap: "₹88K Cr", pe: "12.2" },
    ]
  },
};

// Fallback generator for other stocks
export function getCompanyDetails(symbol: string, defaultName?: string): CompanyDetails {
  const sym = symbol.toUpperCase();
  if (companyDataDict[sym]) {
    return companyDataDict[sym];
  }
  
  // Custom mock generator so any clicked stock works flawlessly!
  const name = defaultName || `${sym} Industries Ltd.`;
  const mcapNum = 40000 + Math.floor(Math.random() * 200000);
  const pe = (15 + Math.random() * 25).toFixed(2);
  const pb = (2 + Math.random() * 8).toFixed(2);
  
  return {
    symbol: sym,
    name,
    description: `${name} is a leading premium listed enterprise operating in key industry segments, committed to excellence and sustainable technological growth.`,
    ceo: "R. K. Sharma",
    founded: "1998",
    employees: "14,500+",
    sector: "Diversified Industrials / Technology",
    fundamentals: {
      marketCap: `₹${mcapNum.toLocaleString("en-IN")} Cr`,
      peRatio: pe,
      pbRatio: pb,
      industryPe: (18 + Math.random() * 10).toFixed(2),
      debtToEquity: (0.1 + Math.random() * 1.5).toFixed(2),
    },
    financials: {
      yearly: [
        { year: "FY22", revenue: Math.round(mcapNum * 0.2), profit: Math.round(mcapNum * 0.02), netWorth: Math.round(mcapNum * 0.4) },
        { year: "FY23", revenue: Math.round(mcapNum * 0.24), profit: Math.round(mcapNum * 0.028), netWorth: Math.round(mcapNum * 0.45) },
        { year: "FY24", revenue: Math.round(mcapNum * 0.28), profit: Math.round(mcapNum * 0.038), netWorth: Math.round(mcapNum * 0.52) },
      ],
      quarterly: [
        { quarter: "Q1 FY25", revenue: Math.round(mcapNum * 0.07), profit: Math.round(mcapNum * 0.009), netWorth: Math.round(mcapNum * 0.53) },
        { quarter: "Q2 FY25", revenue: Math.round(mcapNum * 0.075), profit: Math.round(mcapNum * 0.0095), netWorth: Math.round(mcapNum * 0.55) },
        { quarter: "Q3 FY25", revenue: Math.round(mcapNum * 0.082), profit: Math.round(mcapNum * 0.011), netWorth: Math.round(mcapNum * 0.58) },
      ]
    },
    shareholding: [
      { name: "Promoters", value: 52.40 },
      { name: "FIIs", value: 16.80 },
      { name: "DIIs", value: 18.20 },
      { name: "Public", value: 12.60 },
    ],
    similarStocks: [
      { symbol: "RELIANCE", change: 1.42, mcap: "₹19.92L Cr", pe: "27.4" },
      { symbol: "TATAMOTORS", change: 4.21, mcap: "₹3.58L Cr", pe: "14.8" },
      { symbol: "INFY", change: -1.18, mcap: "₹7.64L Cr", pe: "24.2" },
    ]
  };
}
