import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("UNAUTHENTICATED");
  return userId;
}

export async function requireProfile(ctx: any) {
  const userId = await requireUserId(ctx);

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile || !profile.isActive) throw new ConvexError("FORBIDDEN");
  return profile;
}

export function requireRole(profile: any, roles: Array<"admin" | "reception" | "tech" | "viewer">) {
  if (!roles.includes(profile.role)) throw new ConvexError("FORBIDDEN");
}
