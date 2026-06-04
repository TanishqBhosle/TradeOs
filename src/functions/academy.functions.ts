import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { academyProgress } from "../server/db/schema";
import { updateProgressSchema } from "../server/validation/schemas";
import { eq, and } from "drizzle-orm";
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

export const getAcademyProgress = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const progress = await db
      .select()
      .from(academyProgress)
      .where(eq(academyProgress.userId, user.id));
    return { success: true, data: progress };
  }
);

export const updateAcademyProgress = createServerFn({ method: "POST" })
  .inputValidator(updateProgressSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    // Upsert: update if exists, insert if not
    const existing = await db
      .select()
      .from(academyProgress)
      .where(
        and(
          eq(academyProgress.userId, user.id),
          eq(academyProgress.moduleId, data.moduleId)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(academyProgress)
        .set({
          progress: data.progress,
          moduleTitle: data.moduleTitle ?? existing[0].moduleTitle,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(academyProgress.userId, user.id),
            eq(academyProgress.moduleId, data.moduleId)
          )
        )
        .returning();
      return { success: true, data: updated };
    }

    const [created] = await db
      .insert(academyProgress)
      .values({
        userId: user.id,
        moduleId: data.moduleId,
        moduleTitle: data.moduleTitle,
        progress: data.progress,
      })
      .returning();

    return { success: true, data: created };
  });
