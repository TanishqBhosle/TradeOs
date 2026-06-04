import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { journalEntries } from "../server/db/schema";
import { addJournalSchema, deleteJournalSchema } from "../server/validation/schemas";
import { eq, and, desc } from "drizzle-orm";
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

export const getJournal = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id))
      .orderBy(desc(journalEntries.createdAt));
    return { success: true, data: entries };
  }
);

export const addJournalEntry = createServerFn({ method: "POST" })
  .inputValidator(addJournalSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId: user.id,
        symbol: data.symbol,
        side: data.side,
        qty: data.qty,
        price: data.price,
        pnl: data.pnl,
        notes: data.notes,
        grade: data.grade,
        date: data.date,
      })
      .returning();

    return { success: true, data: entry };
  });

export const deleteJournalEntry = createServerFn({ method: "POST" })
  .inputValidator(deleteJournalSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    await db
      .delete(journalEntries)
      .where(
        and(eq(journalEntries.id, data.id), eq(journalEntries.userId, user.id))
      );
    return { success: true };
  });
