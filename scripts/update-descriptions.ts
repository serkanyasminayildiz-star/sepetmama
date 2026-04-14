import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  const fileContent = fs.readFileSync('./Csv.csv', 'utf-8').replace(/^\uFEFF/, '')
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })

  console.log(`Toplam ${records.length} ürün işlenecek`)

  let updated = 0
  let skipped = 0

  for (let i = 0; i < records.length; i++) {
    const row = records[i]
    const title = row['Title']?.trim()
    if (!title) continue

    const shortDesc = cleanHtml(row['Short Description'] || '')
    const longDesc = cleanHtml(row['Content'] || '')

    const description = shortDesc || longDesc || null

    if (!description) { skipped++; continue }

    let slug = slugify(title)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (!existing) {
      slug = `${slug}-${row['ID']}`
    }

    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) { skipped++; continue }

    await prisma.product.update({
      where: { slug },
      data: { description },
    })

    updated++
    if (updated % 50 === 0) console.log(`[${updated}] güncellendi...`)
  }

  console.log(`✅ Tamamlandı! ${updated} güncellendi, ${skipped} atlandı.`)
  await prisma.$disconnect()
}

main().catch(console.error)
