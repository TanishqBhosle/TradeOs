import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { alerts } from "../server/db/schema";
import { addAlertSchema, dismissAlertSchema } from "../server/validation/schemas";
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

export const getAlerts = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const list = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, user.id))
      .orderBy(desc(alerts.createdAt));
    return { success: true, data: list };
  }
);

export const addAlert = createServerFn({ method: "POST" })
  .inputValidator(addAlertSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    const [alert] = await db
      .insert(alerts)
      .values({
        userId: user.id,
        type: data.type,
        symbol: data.symbol,
        message: data.message,
        time: data.time,
        severity: data.severity,
      })
      .returning();

    return { success: true, data: alert };
  });

export const dismissAlert = createServerFn({ method: "POST" })
  .inputValidator(dismissAlertSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();
    await db
      .delete(alerts)
      .where(
        and(eq(alerts.id, data.id), eq(alerts.userId, user.id))
      );
    return { success: true };
  });
