import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ══════════════════════════════════════════════════════════════════════════════
// Hovenier Portal (LaventeCare Auth)
// Auth is verified server-side by Astro middleware.
// User identity is passed as argument (userId) instead of Clerk OIDC.
// ══════════════════════════════════════════════════════════════════════════════

// ── Hovenier profiel ophalen ───────────────────────────────────────────────

export const getMe = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null

    return ctx.db
      .query('hoveniers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique()
  },
})

// ── Profiel aanmaken of bijwerken ─────────────────────────────────────────

export const upsertHovenier = mutation({
  args: {
    userId:         v.string(),
    naam:           v.string(),
    email:          v.string(),
    telefoon:       v.optional(v.string()),
    regio:          v.array(v.string()),
    specialisaties: v.array(v.string()),
    actief:         v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error('Niet ingelogd')

    const userId = args.userId

    const existing = await ctx.db
      .query('hoveniers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        naam:           args.naam,
        email:          args.email,
        telefoon:       args.telefoon,
        regio:          args.regio,
        specialisaties: args.specialisaties,
        ...(args.actief !== undefined ? { actief: args.actief } : {}),
      })
      return existing._id
    }

    return ctx.db.insert('hoveniers', {
      clerkId:        userId,
      naam:           args.naam,
      email:          args.email,
      telefoon:       args.telefoon,
      regio:          args.regio,
      specialisaties: args.specialisaties,
      actief:         args.actief ?? true,
    })
  },
})
