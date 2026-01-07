import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireProfile } from "./_authz";

/**
 * Vrátí můj profil (nebo null, když nejsem přihlášený).
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile ?? null;
  },
});

/**
 * Zajistí, že přihlášený uživatel má profil.
 * Pokud je to úplně první profil v DB, vytvoří i org a nastaví roli admin.
 */
export const ensureMyProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    orgName: v.optional(v.string()),
  },
  handler: async (ctx, { displayName, orgName }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHENTICATED");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing;

    const now = Date.now();

    // Je to první profil v systému?
    const anyProfile = await ctx.db.query("profiles").first();

    let orgId;
    let role: "admin" | "reception" | "tech" | "viewer";

    if (!anyProfile) {
      // první uživatel = admin a vytvoří se org
      orgId = await ctx.db.insert("orgs", {
        name: orgName ?? "Moje firma",
        createdAt: now,
      });
      role = "admin";
    } else {
      // další uživatel zatím nemá org — tohle v kroku 2 dotáhneme (invite flow)
      // pro teď ho dáme do stejného orgu jako první profil
      const first = await ctx.db.query("profiles").first();
      orgId = first!.orgId;
      role = "viewer";
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      orgId,
      role,
      displayName,
      isActive: true,
      createdAt: now,
    });

    return await ctx.db.get(profileId);
  },
});

/**
 * Ukázka ochrany: vrátí org info jen přihlášenému uživateli.
 */
export const myOrg = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireProfile(ctx);
    return await ctx.db.get(profile.orgId);
  },
});
