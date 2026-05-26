import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { createClient } from '@supabase/supabase-js'

const MAX_IMAGES = 6
const MAX_SIZE_MB = 5

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return false
  return true
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST — multipart/form-data: { file: File }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await params

  // Mevcut görsel sayısı kontrol
  const existingCount = await prisma.productImage.count({ where: { productId: id } })
  if (existingCount >= MAX_IMAGES) {
    return NextResponse.json({ error: `En fazla ${MAX_IMAGES} görsel yüklenebilir` }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Dosya yok' }, { status: 400 })

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Dosya ${MAX_SIZE_MB}MB üstünde olamaz` }, { status: 400 })
  }

  const type = file.type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
    return NextResponse.json({ error: 'Sadece JPG/PNG/WEBP destekleniyor' }, { status: 400 })
  }

  const ext = type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.jpg'
  const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = getSupabase()
  const { error: upErr } = await supabase.storage
    .from('products')
    .upload(storageName, buffer, { contentType: type, upsert: false })

  if (upErr) {
    return NextResponse.json({ error: 'Yükleme hatası: ' + upErr.message }, { status: 500 })
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storageName}`

  const image = await prisma.productImage.create({
    data: { productId: id, url, order: existingCount },
  })

  return NextResponse.json({ image })
}

// DELETE — ?imageId=xxx
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await params
  const imageId = req.nextUrl.searchParams.get('imageId')
  if (!imageId) return NextResponse.json({ error: 'imageId gerekli' }, { status: 400 })

  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image || image.productId !== id) {
    return NextResponse.json({ error: 'Görsel bulunamadı' }, { status: 404 })
  }

  // Supabase storage'tan sil (URL'in son segmenti dosya adı)
  const storageName = image.url.split('/products/').pop()
  if (storageName) {
    const supabase = getSupabase()
    await supabase.storage.from('products').remove([storageName])
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  // Kalan görsellerin order'ını düzelt
  const remaining = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { order: 'asc' },
  })
  await Promise.all(
    remaining.map((img, idx) =>
      img.order !== idx
        ? prisma.productImage.update({ where: { id: img.id }, data: { order: idx } })
        : null
    )
  )

  return NextResponse.json({ success: true })
}
