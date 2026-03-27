"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendLeadNotifications = internalAction({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery(internal.leads.getLead, { leadId });
    if (!lead) throw new Error("Lead not found prior to emailing.");

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Mail 1: Admin notificatie
    await resend.emails.send({
      from: "TuinHub <noreply@tuinhub.nl>",
      to: "info@tuinhub.nl",
      subject: `Nieuwe lead: ${lead.dienst} in ${lead.postcode}`,
      html: `
        <h2>Nieuwe offerte-aanvraag</h2>
        <p style="font-size:20px;font-weight:bold">
          <a href="tel:${lead.telefoon.replace(/\s/g, '')}">${lead.telefoon}</a>
        </p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px;font-weight:bold">Naam</td><td style="padding:6px">${lead.naam}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Email</td><td style="padding:6px">${lead.email}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Telefoon</td><td style="padding:6px"><a href="tel:${lead.telefoon.replace(/\s/g, '')}">${lead.telefoon}</a></td></tr>
          <tr><td style="padding:6px;font-weight:bold">Dienst</td><td style="padding:6px">${lead.dienst}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">m²</td><td style="padding:6px">${lead.m2}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Budget</td><td style="padding:6px">${lead.budget}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Timing</td><td style="padding:6px">${lead.timing}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Postcode</td><td style="padding:6px">${lead.postcode}</td></tr>
        </table>
      `,
    });

    // Mail 2: Bevestiging naar consument
    await resend.emails.send({
      from: "TuinHub <noreply@tuinhub.nl>",
      to: lead.email,
      subject: "Je aanvraag bij TuinHub is ontvangen",
      text: `Beste ${lead.naam},

Bedankt voor je aanvraag! We bekijken je wensen persoonlijk en nemen binnen 24 uur contact op om je te koppelen aan de juiste hoveniers in jouw buurt.

Groet,
Team TuinHub`,
    });
  },
});
