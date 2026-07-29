import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { SHORT_DESC_MAX, TAG_MAX } from '@/lib/product-form'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return false
  return true
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function toText(v: unknown, max?: number): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return max ? t.slice(0, max) : t
}

// PATCH — kısmi güncelleme. Yalnızca beyaz listedeki alanlar yazılır;
// gövde doğrudan Prisma'ya geçirilmez.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await params

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })

  const mevcut = await prisma.product.findUnique({ where: { id }, select: { price: true, salePrice: true } })
  if (!mevcut) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if ('name' in body) {
    const name = toText(body.name)
    if (!name) return NextResponse.json({ error: 'Ürün adı boş olamaz' }, { status: 400 })
    if (name.length > 150) return NextResponse.json({ error: 'Ürün adı en fazla 150 karakter olabilir' }, { status: 400 })
    data.name = name
  }
  if ('description' in body) data.description = toText(body.description)
  if ('shortDescription' in body) data.shortDescription = toText(body.shortDescription, SHORT_DESC_MAX)
  if ('brand' in body) data.brand = toText(body.brand)
  if ('tag' in body) data.tag = toText(body.tag, TAG_MAX)
  if ('isActive' in body) data.isActive = body.isActive === true
  if ('isFeatured' in body) data.isFeatured = body.isFeatured === true

  if ('price' in body) {
    const price = toNumber(body.price)
    if (price === null || price <= 0) return NextResponse.json({ error: 'Fiyat sıfırdan büyük olmalı' }, { status: 400 })
    data.price = price
  }
  if ('stock' in body) {
    const stock = toNumber(body.stock)
    if (stock === null || stock < 0) return NextResponse.json({ error: 'Stok negatif olamaz' }, { status: 400 })
    data.stock = Math.trunc(stock)
  }
  if ('salePrice' in body) {
    const salePrice = toNumber(body.salePrice)
    if (salePrice !== null && salePrice <= 0) {
      return NextResponse.json({ error: 'İndirimli fiyat sıfırdan büyük olmalı' }, { status: 400 })
    }
    data.salePrice = salePrice
  }

  // İndirimli fiyat, güncelleme sonrası oluşacak normal fiyattan düşük olmalı
  const yeniPrice = (data.price as number | undefined) ?? Number(mevcut.price)
  const yeniSale =
    'salePrice' in data
      ? (data.salePrice as number | null)
      : mevcut.salePrice === null
        ? null
        : Number(mevcut.salePrice)
  if (yeniSale !== null && yeniSale >= yeniPrice) {
    return NextResponse.json({ error: 'İndirimli fiyat, normal fiyattan düşük olmalı' }, { status: 400 })
  }

  // Kategori: tek kategori modeli — önce mevcut bağları temizle, sonra yenisini kur
  if ('categoryId' in body) {
    const categoryId = toText(body.categoryId)
    if (categoryId) {
      const kategori = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } })
      if (!kategori) return NextResponse.json({ error: 'Seçilen kategori bulunamadı' }, { status: 400 })
    }
    await prisma.categoryProduct.deleteMany({ where: { productId: id } })
    if (categoryId) {
      await prisma.categoryProduct.create({ data: { productId: id, categoryId } })
    }
  }

  const product = Object.keys(data).length
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.findUnique({ where: { id } })

  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
