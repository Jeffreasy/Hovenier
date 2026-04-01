"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";

/** Escape HTML entities to prevent injection in email templates */
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const sendLeadNotifications = internalAction({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery(internal.leads.getLead, { leadId });
    if (!lead) throw new Error("Lead not found prior to emailing.");

    const resend = new Resend(process.env.RESEND_API_KEY);

    const h = {
      naam:     escapeHtml(lead.naam),
      email:    escapeHtml(lead.email),
      telefoon: escapeHtml(lead.telefoon),
      dienst:   escapeHtml(lead.dienst),
      budget:   escapeHtml(lead.budget),
      timing:   escapeHtml(lead.timing),
      postcode: escapeHtml(lead.postcode),
      telClean: escapeHtml(lead.telefoon.replace(/\s/g, "")),
    };

    // Mail 1: Admin notificatie
    try {
      await resend.emails.send({
        from: "TuinHub <noreply@tuinhub.nl>",
        to: "info@tuinhub.nl",
        subject: `Nieuwe lead: ${lead.dienst} in ${lead.postcode}`,
        html: `
          <h2>Nieuwe offerte-aanvraag</h2>
          <p style="font-size:20px;font-weight:bold">
            <a href="tel:${h.telClean}">${h.telefoon}</a>
          </p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px;font-weight:bold">Naam</td><td style="padding:6px">${h.naam}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">Email</td><td style="padding:6px">${h.email}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">Telefoon</td><td style="padding:6px"><a href="tel:${h.telClean}">${h.telefoon}</a></td></tr>
            <tr><td style="padding:6px;font-weight:bold">Dienst</td><td style="padding:6px">${h.dienst}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">m²</td><td style="padding:6px">${lead.m2}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">Budget</td><td style="padding:6px">${h.budget}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">Timing</td><td style="padding:6px">${h.timing}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">Postcode</td><td style="padding:6px">${h.postcode}</td></tr>
          </table>
        `,
      });
    } catch (err) {
      console.error("Admin email failed:", err);
    }

    // Mail 2: Bevestiging naar consument (plain text = safe)
    try {
      await resend.emails.send({
        from: "TuinHub <noreply@tuinhub.nl>",
        to: lead.email,
        subject: "Je aanvraag bij TuinHub is ontvangen",
        text: `Beste ${lead.naam},

Bedankt voor je aanvraag! We bekijken je wensen persoonlijk en nemen binnen 24 uur contact op om je te koppelen aan de juiste hoveniers in jouw buurt.

Groet,
Team TuinHub`,
      });
    } catch (err) {
      console.error("Consumer confirmation email failed:", err);
    }
  },
});
