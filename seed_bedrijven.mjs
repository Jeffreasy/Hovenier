#!/usr/bin/env node
/**
 * seed_bedrijven.mjs — staat bewust BUITEN de convex/ map
 * zodat Convex dit bestand niet probeert te bundelen.
 *
 * Gebruik:
 *   node seed_bedrijven.mjs
 *
 * Vereisten: draai eerst `npx convex dev` in een apart terminal venster.
 */

import { ConvexHttpClient } from 'convex/browser'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMPORT_FILE = join('C:\\Users\\jeffrey\\Desktop\\Chunk\\hoveniers_import.json')
const BATCH_SIZE = 100

async function main() {
  // Haal CONVEX_URL op uit .env.local
  const envPath = join(__dirname, '.env.local')
  const env = readFileSync(envPath, 'utf-8')
  const urlMatch = env.match(/PUBLIC_CONVEX_URL\s*=\s*(.+)/) ?? env.match(/CONVEX_URL\s*=\s*(.+)/)
  const url = urlMatch?.[1]?.trim()

  if (!url) {
    console.error('❌ CONVEX_URL of PUBLIC_CONVEX_URL niet gevonden in .env.local')
    process.exit(1)
  }

  console.log(`🔗 Convex: ${url}`)
  const client = new ConvexHttpClient(url)

  console.log(`📂 Laden van: ${IMPORT_FILE}`)
  const data = JSON.parse(readFileSync(IMPORT_FILE, 'utf-8'))
  console.log(`📊 ${data.length} bedrijven gevonden\n`)

  const batches = Math.ceil(data.length / BATCH_SIZE)
  let totaal = 0

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    const batchNr = Math.floor(i / BATCH_SIZE) + 1

    // Verwijder null-waarden — Convex vereist undefined voor optionele velden
    const schoneBatch = batch.map((b) => {
      const clean = { ...b }
      for (const key of Object.keys(clean)) {
        if (clean[key] === null) delete clean[key]
      }
      return clean
    })

    try {
      await client.mutation('bedrijven:seedBatch', { bedrijven: schoneBatch })
      totaal += batch.length
      process.stdout.write(`\r  Batch ${batchNr}/${batches} — ${totaal}/${data.length} geïmporteerd`)
    } catch (err) {
      console.error(`\n❌ Fout bij batch ${batchNr}: ${err.message}`)
      process.exit(1)
    }
  }

  console.log(`\n\n✅ Import klaar! ${totaal} bedrijven in Convex.`)
}

main().catch((err) => { console.error('❌', err); process.exit(1) })
