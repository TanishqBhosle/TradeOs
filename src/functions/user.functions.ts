import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../server/db";
import { users } from "../server/db/schema";
import { updateProfileSchema } from "../server/validation/schemas";
import { eq } from "drizzle-orm";
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

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user) {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as Record<string, unknown>).role ?? "user",
        plan: (session.user as Record<string, unknown>).plan ?? "free",
      },
    };
  }
);

export const getUserProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser();
    const db = getDb();
    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!profile) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.image,
        role: profile.role,
        plan: profile.plan,
        createdAt: profile.createdAt,
      },
    };
  }
);

export const updateUserProfile = createServerFn({ method: "POST" })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = getDb();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name) updates.name = data.name;
    if (data.image) updates.image = data.image;

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning();

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
      },
    };
  });
