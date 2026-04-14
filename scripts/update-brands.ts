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

async function main() {
  const fileContent = fs.readFileSync('./Csv.csv', 'utf-8').replace(/^\uFEFF/, '')
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })

  console.log(`Toplam ${records.length} ürün işlenecek`)

  let updated = 0

  for (const row of records) {
    const title = row['Title']?.trim()
    const brand = row['Markalar']?.trim()
    if (!title || !brand) continue

    let slug = slugify(title)
    let product = await prisma.product.findUnique({ where: { slug } })
    if (!product) {
      slug = `${slug}-${row['ID']}`
      product = await prisma.product.findUnique({ where: { slug } })
    }
    if (!product) continue

    await prisma.product.update({ where: { slug }, data: { brand } })
    updated++
    if (updated % 100 === 0) console.log(`[${updated}] güncellendi...`)
  }

  console.log(`✅ ${updated} ürün güncellendi!`)
  await prisma.$disconnect()
}

main().catch(console.error)
