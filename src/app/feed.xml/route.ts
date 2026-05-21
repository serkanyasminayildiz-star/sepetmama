import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1 saat

// XML/HTML special char escape
function esc(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

export async function GET() {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://www.sepetmama.com'

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      salePrice: true,
      stock: true,
      brand: true,
      images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
      categories: {
        select: { category: { select: { name: true } } },
        take: 1,
      },
    },
  })

  const items = products
    .map((p) => {
      const image = p.images[0]?.url
      if (!image) return '' // Google Shopping requires image

      const price = parseFloat(p.price.toString())
      const salePrice = p.salePrice ? parseFloat(p.salePrice.toString()) : null
      const hasSale = salePrice !== null && salePrice < price

      const title = truncate(p.name, 150)
      const description = truncate(
        p.description?.trim() || `${p.name} — SepetMama'da uygun fiyatla.`,
        5000
      )
      const link = `${siteUrl}/urun/${p.slug}`
      const availability = p.stock > 0 ? 'in stock' : 'out of stock'
      const category = p.categories[0]?.category.name || 'Pet'

      return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <title>${esc(title)}</title>
      <description>${esc(description)}</description>
      <link>${esc(link)}</link>
      <g:image_link>${esc(image)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} TRY</g:price>${
        hasSale ? `\n      <g:sale_price>${salePrice!.toFixed(2)} TRY</g:sale_price>` : ''
      }
      ${p.brand ? `<g:brand>${esc(p.brand)}</g:brand>` : '<g:brand>SepetMama</g:brand>'}
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(category)}</g:product_type>
      <g:shipping>
        <g:country>TR</g:country>
        <g:service>Standart</g:service>
        <g:price>49.90 TRY</g:price>
      </g:shipping>
    </item>`
    })
    .filter(Boolean)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>SepetMama</title>
    <link>${siteUrl}</link>
    <description>Kedi ve köpek mamaları, ödüller, aksesuarlar. Hızlı kargo, güvenli ödeme.</description>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
