import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ── Hovenier profiel ophalen ──────────────────────────────────────────────────

export const getMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return ctx.db
      .query('hoveniers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .unique()
  },
})

// ── Profiel aanmaken of bijwerken ─────────────────────────────────────────────

export const upsertHovenier = mutation({
  args: {
    clerkId:       v.string(),
    naam:          v.string(),
    email:         v.string(),
    telefoon:      v.optional(v.string()),
    regio:         v.array(v.string()),         // postcode prefixen, bijv. ["10","11"]
    specialisaties: v.array(v.string()),         // ServiceType[]
    actief:        v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('hoveniers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        naam:          args.naam,
        email:         args.email,
        telefoon:      args.telefoon,
        regio:         args.regio,
        specialisaties: args.specialisaties,
        ...(args.actief !== undefined ? { actief: args.actief } : {}),
      })
      return existing._id
    }

    return ctx.db.insert('hoveniers', {
      clerkId:        args.clerkId,
      naam:           args.naam,
      email:          args.email,
      telefoon:       args.telefoon,
      regio:          args.regio,
      specialisaties: args.specialisaties,
      actief:         args.actief ?? true,
    })
  },
})
