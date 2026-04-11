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
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
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
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
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
      userId:         userId,
      naam:           args.naam,
      email:          args.email,
      telefoon:       args.telefoon,
      regio:          args.regio,
      specialisaties: args.specialisaties,
      actief:         args.actief ?? true,
      credits:        0,
      tier:           'freemium',
    })
  },
})

// ── Test & Ontwikkeling ────────────────────────────────────────────────────────

export const addMockCreditsByUserId = mutation({
  args: { userId: v.string(), amount: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error('Niet ingelogd')

    let existing = await ctx.db
      .query('hoveniers')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .unique()

    // Auto-provision profiel als het nog niet bestaat (dev/test mode)
    if (!existing) {
      const newId = await ctx.db.insert('hoveniers', {
        userId:         args.userId,
        naam:           'Hovenier',
        email:          args.userId,
        regio:          [],
        specialisaties: [],
        actief:         true,
        credits:        0,
        tier:           'freemium',
      })
      existing = await ctx.db.get(newId)
    }

    if (!existing) throw new Error('Kon profiel niet aanmaken')

    const current = existing.credits || 0
    const toAdd = args.amount || 10

    await ctx.db.patch(existing._id, { credits: current + toAdd })

    return { success: true, newBalance: current + toAdd }
  },
})
