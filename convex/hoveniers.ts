import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ── Hovenier profiel ophalen (server-side auth) ───────────────────────────────

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return ctx.db
      .query('hoveniers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique()
  },
})

// ── Profiel aanmaken of bijwerken (server-side auth) ─────────────────────────

export const upsertHovenier = mutation({
  args: {
    naam:           v.string(),
    email:          v.string(),
    telefoon:       v.optional(v.string()),
    regio:          v.array(v.string()),       // postcode prefixen, bijv. ["10","11"]
    specialisaties: v.array(v.string()),       // ServiceType[]
    actief:         v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Niet ingelogd')

    const clerkId = identity.subject

    const existing = await ctx.db
      .query('hoveniers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
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
      clerkId,
      naam:           args.naam,
      email:          args.email,
      telefoon:       args.telefoon,
      regio:          args.regio,
      specialisaties: args.specialisaties,
      actief:         args.actief ?? true,
    })
  },
})
