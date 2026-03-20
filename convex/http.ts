import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { api } from './_generated/api'

const http = httpRouter()

// ── POST /submit-lead ─────────────────────────────────────────────────────────
// Aangeroepen vanuit OfferteFormulier.tsx (client-side)

http.route({
  path:   '/submit-lead',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // CORS: allow any origin (public form)
    const origin = request.headers.get('Origin') ?? '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonError('Ongeldige JSON', 400, origin)
    }

    // Basic validation
    const data = body as Record<string, unknown>
    const required = ['naam', 'email', 'telefoon', 'postcode', 'dienst', 'm2', 'budget', 'timing']
    for (const field of required) {
      if (!data[field]) return jsonError(`Veld '${field}' is verplicht`, 422, origin)
    }

    try {
      const result = await ctx.runMutation(api.leads.submitLead, {
        naam:     String(data.naam),
        email:    String(data.email),
        telefoon: String(data.telefoon),
        postcode: String(data.postcode),
        dienst:   String(data.dienst),
        m2:       Number(data.m2),
        budget:   String(data.budget),
        timing:   String(data.timing),
      })

      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    } catch (err) {
      return jsonError('Opslaan mislukt, probeer opnieuw', 500, origin)
    }
  }),
})

// ── CORS preflight ────────────────────────────────────────────────────────────
http.route({
  path:   '/submit-lead',
  method: 'OPTIONS',
  handler: httpAction(async (_ctx, request) => {
    const origin = request.headers.get('Origin') ?? '*'
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }),
})

export default http

// ── Helpers ───────────────────────────────────────────────────────────────────

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function jsonError(message: string, status: number, origin: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}
