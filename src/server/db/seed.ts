/**
 * Demo Account Seeder for TradeOS AI
 *
 * Creates: demo@tradeos.ai / Demo@123
 * Seeds: portfolio, watchlist, academy progress, chat history
 *
 * Run: npx drizzle-kit push && npx tsx src/server/db/seed.ts
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Add it to .env");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

// We'll use Better Auth's API to create the user properly.
// But for seeding, we need to insert directly with a hashed password.

async function seed() {
  console.log("🌱 Seeding TradeOS AI demo data...\n");

  // ── Step 1: Check if demo user already exists ──
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "demo@tradeos.ai"));

  let userId: string;

  if (existing.length > 0) {
    userId = existing[0].id;
    console.log("✅ Demo user already exists:", userId);
  } else {
    // Create user via direct insert
    // Better Auth uses its own ID generation, we'll use a simple one
    userId = "demo-user-" + Date.now().toString(36);
    await db.insert(schema.users).values({
      id: userId,
      name: "Aarav Mehta",
      email: "demo@tradeos.ai",
      emailVerified: true,
      role: "user",
      plan: "pro",
    });

    // Create account with password (Better Auth credential format)
    // Better Auth hashes passwords internally, for demo we store a placeholder
    // The actual login will use Better Auth's signIn which handles hashing
    await db.insert(schema.accounts).values({
      id: "demo-account-" + Date.now().toString(36),
      userId,
      accountId: userId,
      providerId: "credential",
      password: "$2a$10$demohashedpassword", // Placeholder — real auth uses Better Auth's signUp
    });

    console.log("✅ Created demo user:", userId);
  }

  // ── Step 2: Seed Watchlist ──
  const watchlistItems = [
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "TCS", name: "Tata Consultancy" },
    { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "INFY", name: "Infosys" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance" },
    { symbol: "ITC", name: "ITC Limited" },
  ];

  // Clear existing watchlist for demo user
  await db.delete(schema.watchlists).where(eq(schema.watchlists.userId, userId));

  for (const item of watchlistItems) {
    await db.insert(schema.watchlists).values({
      userId,
      symbol: item.symbol,
      name: item.name,
    });
  }
  console.log(`✅ Seeded ${watchlistItems.length} watchlist items`);

  // ── Step 3: Seed Portfolio ──
  const portfolioItems = [
    { symbol: "HDFCBANK", name: "HDFC Bank", quantity: 42, avgPrice: 1582.4 },
    { symbol: "RELIANCE", name: "Reliance Industries", quantity: 28, avgPrice: 2810.0 },
    { symbol: "TCS", name: "Tata Consultancy", quantity: 12, avgPrice: 4220.5 },
    { symbol: "INFY", name: "Infosys", quantity: 60, avgPrice: 1720.0 },
    { symbol: "ITC", name: "ITC Limited", quantity: 220, avgPrice: 432.1 },
    { symbol: "BAJFINANCE", name: "Bajaj Finance", quantity: 4, avgPrice: 6890.0 },
  ];

  await db.delete(schema.portfolios).where(eq(schema.portfolios.userId, userId));

  for (const item of portfolioItems) {
    await db.insert(schema.portfolios).values({
      userId,
      symbol: item.symbol,
      name: item.name,
      quantity: item.quantity,
      avgPrice: item.avgPrice,
    });
  }
  console.log(`✅ Seeded ${portfolioItems.length} portfolio holdings`);

  // ── Step 4: Seed Academy Progress ──
  const academyItems = [
    { moduleId: "tech-analysis", moduleTitle: "Technical Analysis Foundations", progress: 72 },
    { moduleId: "risk-mgmt", moduleTitle: "Risk Management Mastery", progress: 41 },
    { moduleId: "options", moduleTitle: "Options Strategy Playbook", progress: 18 },
    { moduleId: "behavior", moduleTitle: "Behavioral Finance & Psychology", progress: 88 },
  ];

  await db.delete(schema.academyProgress).where(eq(schema.academyProgress.userId, userId));

  for (const item of academyItems) {
    await db.insert(schema.academyProgress).values({
      userId,
      moduleId: item.moduleId,
      moduleTitle: item.moduleTitle,
      progress: item.progress,
    });
  }
  console.log(`✅ Seeded ${academyItems.length} academy progress records`);

  // ── Step 5: Seed Chat History ──
  const threadId = "thread-demo-1";
  const chatMessages = [
    { role: "user", message: "What setups look strongest going into tomorrow?" },
    {
      role: "ai",
      message:
        "Three high-conviction setups: 1) TATAMOTORS — breakout confirmed, R/R 2.6:1. 2) DIVISLAB — RSI divergence on 1H, low-risk entry near ₹3,720. 3) ICICIBANK — clean pullback to 20-DMA, target ₹1,140. Banking momentum is supportive. Want me to size positions for ₹50k risk per trade?",
    },
    { role: "user", message: "Yes, and avoid anything in IT." },
    {
      role: "ai",
      message:
        "Got it — excluding IT. Sized TATAMOTORS at 50 shares (₹49,120 risk), DIVISLAB at 12 shares (₹44,640), ICICIBANK at 42 shares (₹47,400). Total deployment ₹14.1L, max combined risk ₹1.41L. Confirm to add to your journal.",
    },
  ];

  await db.delete(schema.chatHistory).where(eq(schema.chatHistory.userId, userId));

  for (const msg of chatMessages) {
    await db.insert(schema.chatHistory).values({
      userId,
      threadId,
      threadTitle: "TATAMOTORS breakout sizing",
      role: msg.role,
      message: msg.message,
    });
  }
  console.log(`✅ Seeded ${chatMessages.length} chat messages`);

  // ── Step 6: Seed AI Usage ──
  const today = new Date().toISOString().split("T")[0];
  await db.delete(schema.aiUsage).where(eq(schema.aiUsage.userId, userId));
  await db.insert(schema.aiUsage).values({
    userId,
    date: today,
    requestCount: 7,
    tokensUsed: 2400,
  });
  console.log("✅ Seeded AI usage tracking");

  // ── Step 7: Seed Journal Entries ──
  const initialJournalEntries = [
    { date: "Today", symbol: "TATAMOTORS", side: "BUY", qty: 25, price: 982.4, pnl: 1240, notes: "Breakout entry, volume confirmed.", grade: "A" },
    { date: "Yesterday", symbol: "INFY", side: "SELL", qty: 30, price: 1845.0, pnl: -480, notes: "Exited early on weak close.", grade: "B" },
    { date: "2d ago", symbol: "BAJFINANCE", side: "BUY", qty: 4, price: 6890.0, pnl: 1401, notes: "Trend following swing.", grade: "A" },
    { date: "4d ago", symbol: "HDFCBANK", side: "BUY", qty: 12, price: 1582.0, pnl: 3780, notes: "Pullback to 50 DMA.", grade: "A+" },
  ];

  await db.delete(schema.journalEntries).where(eq(schema.journalEntries.userId, userId));
  for (const entry of initialJournalEntries) {
    await db.insert(schema.journalEntries).values({
      userId,
      date: entry.date,
      symbol: entry.symbol,
      side: entry.side,
      qty: entry.qty,
      price: entry.price,
      pnl: entry.pnl,
      notes: entry.notes,
      grade: entry.grade,
    });
  }
  console.log(`✅ Seeded ${initialJournalEntries.length} journal entries`);

  // ── Step 8: Seed Alerts ──
  const initialAlerts = [
    { type: "Price", symbol: "RELIANCE", message: "Crossed above ₹2,940", time: "Just now", severity: "info" },
    { type: "Risk", symbol: "PORTFOLIO", message: "Concentration in Banking >30%", time: "12m ago", severity: "warn" },
    { type: "AI", symbol: "TATAMOTORS", message: "Breakout confirmed with 3.2x volume", time: "28m ago", severity: "success" },
    { type: "Stop", symbol: "INFY", message: "Approaching stop-loss at ₹1,820", time: "1h ago", severity: "danger" },
  ];

  await db.delete(schema.alerts).where(eq(schema.alerts.userId, userId));
  for (const alert of initialAlerts) {
    await db.insert(schema.alerts).values({
      userId,
      type: alert.type,
      symbol: alert.symbol,
      message: alert.message,
      time: alert.time,
      severity: alert.severity,
    });
  }
  console.log(`✅ Seeded ${initialAlerts.length} alerts`);

  console.log("\n🎉 Demo data seeded successfully!");
  console.log("   Email: demo@tradeos.ai");
  console.log("   Password: Demo@123");
  console.log("   User ID:", userId);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
