import { z } from "zod";

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const addWatchlistSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().optional(),
});

export const removeWatchlistSchema = z.object({
  id: z.number().int().positive(),
});

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const addHoldingSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().optional(),
  quantity: z.number().int().positive(),
  avgPrice: z.number().positive(),
});

export const updateHoldingSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive().optional(),
  avgPrice: z.number().positive().optional(),
});

export const removeHoldingSchema = z.object({
  id: z.number().int().positive(),
});

// ─── Academy ──────────────────────────────────────────────────────────────────

export const updateProgressSchema = z.object({
  moduleId: z.string().min(1),
  moduleTitle: z.string().optional(),
  progress: z.number().int().min(0).max(100),
});

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  threadId: z.string().min(1),
  threadTitle: z.string().optional(),
  message: z.string().min(1).max(4000),
});

// ─── User Profile ─────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

// ─── Trade Journal ────────────────────────────────────────────────────────────

export const addJournalSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  side: z.enum(["BUY", "SELL"]),
  qty: z.number().int().positive(),
  price: z.number().positive(),
  pnl: z.number(),
  notes: z.string().optional(),
  grade: z.string().default("A"),
  date: z.string().default("Today"),
});

export const deleteJournalSchema = z.object({
  id: z.number().int().positive(),
});

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const addAlertSchema = z.object({
  type: z.enum(["Price", "Risk", "AI", "Stop"]),
  symbol: z.string().min(1).max(20).toUpperCase(),
  message: z.string().min(1),
  time: z.string().default("Just now"),
  severity: z.enum(["info", "warn", "success", "danger"]),
});

export const dismissAlertSchema = z.object({
  id: z.number().int().positive(),
});

