import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { slugify, uniqueSlug, validateProduct } from '@/lib/product-form'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return false
  return true
}

// POST — yeni ürün oluşturur. Görseller ürün oluştuktan sonra
// /api/admin/urun/[id]/image üzerinden yüklenir.
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })

  const result = validateProduct(body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  const d = result.data

  const base = slugify(d.name)
  if (!base) return NextResponse.json({ error: 'Ürün adından geçerli bir adres üretilemedi' }, { status: 400 })

  // Aynı kökten türeyen slug'ları çekip sıradaki boş numarayı bul
  const benzer = await prisma.product.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  })
  const slug = uniqueSlug(base, benzer.map((p) => p.slug))

  if (d.categoryId) {
    const kategori = await prisma.category.findUnique({ where: { id: d.categoryId }, select: { id: true } })
    if (!kategori) return NextResponse.json({ error: 'Seçilen kategori bulunamadı' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug,
      shortDescription: d.shortDescription,
      description: d.description,
      brand: d.brand,
      tag: d.tag,
      price: d.price,
      salePrice: d.salePrice,
      stock: d.stock,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      ...(d.categoryId ? { categories: { create: { categoryId: d.categoryId } } } : {}),
    },
    include: { images: true, categories: { include: { category: true } } },
  })

  return NextResponse.json({ product })
}
