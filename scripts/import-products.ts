import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'
import * as https from 'https'
import * as http from 'http'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) { resolve(null); return }
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    })
    req.on('error', () => resolve(null))
    req.setTimeout(10000, () => { req.destroy(); resolve(null) })
  })
}

async function uploadToSupabase(buffer: Buffer, filename: string): Promise<string | null> {
  const ext = path.extname(filename).toLowerCase() || '.webp'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp'
  const { error } = await supabase.storage.from('products').upload(name, buffer, { contentType, upsert: true })
  if (error) { console.error('Upload error:', error.message); return null }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${name}`
}

async function getOrCreateCategory(fullPath: string): Promise<string> {
  const parts = fullPath.split('>').map(p => p.trim())
  let parentId: string | null = null
  for (const part of parts) {
    const slug = slugify(part)
    let cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) {
      cat = await prisma.category.create({ data: { name: part, slug, parentId } })
    }
    parentId = cat.id
  }
  return parentId!
}

async function main() {
  const fileContent = fs.readFileSync('./Csv.csv', 'utf-8').replace(/^\uFEFF/, '')
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })

  console.log(`Toplam ${records.length} ürün işlenecek`)

  const skipCategories = ['Kampanyalar', 'Haftanın Fırsatları', 'En Çok Satanlar', 'Örnek Kategori']

  for (let i = 0; i < records.length; i++) {
    const row = records[i]
    const title = row['Title']?.trim()
    if (!title) continue

    console.log(`[${i + 1}/${records.length}] ${title}`)

    // Kategoriler
    const catString = row['Ürün kategorileri'] || ''
    const catPaths = catString.split('|').map((c: string) => c.trim()).filter((c: string) => c && !skipCategories.includes(c))

    const categoryIds: string[] = []
    for (const catPath of catPaths) {
      try {
        const id = await getOrCreateCategory(catPath)
        if (!categoryIds.includes(id)) categoryIds.push(id)
      } catch {}
    }

    if (categoryIds.length === 0) {
      let defCat = await prisma.category.findUnique({ where: { slug: 'genel' } })
      if (!defCat) defCat = await prisma.category.create({ data: { name: 'Genel', slug: 'genel' } })
      categoryIds.push(defCat.id)
    }

    const price = parseFloat(row['Sale Price'] || row['Regular Price'] || '0')
    const oldPrice = row['Sale Price'] && row['Regular Price'] ? parseFloat(row['Regular Price']) : null
    const stock = row['Stock Status'] === 'instock' ? 10 : 0

    let slug = slugify(title)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${row['ID']}`

    const product = await prisma.product.create({
      data: {
        name: title,
        slug,
        description: row['Short Description']?.replace(/<[^>]*>/g, '').trim() || null,
        price,
        salePrice: oldPrice ? price : null,
        stock,
        sku: row['Sku'] || null,
        isActive: true,
        categories: {
          create: categoryIds.map(categoryId => ({ categoryId }))
        }
      }
    })

    // Görseller
    const imageUrls = (row['Image URL'] || '').split('|').filter(Boolean).slice(0, 3)
    for (let j = 0; j < imageUrls.length; j++) {
      const url = imageUrls[j].trim()
      console.log(`  Görsel indiriliyor: ${url}`)
      const buffer = await downloadImage(url)
      if (!buffer) { console.log('  ⚠ İndirilemedi'); continue }
      const filename = path.basename(url.split('?')[0])
      const newUrl = await uploadToSupabase(buffer, filename)
      if (newUrl) {
        await prisma.productImage.create({ data: { productId: product.id, url: newUrl, order: j } })
        console.log(`  ✓ Yüklendi`)
      }
    }
  }

  console.log('✅ Import tamamlandı!')
  await prisma.$disconnect()
}

main().catch(console.error)
