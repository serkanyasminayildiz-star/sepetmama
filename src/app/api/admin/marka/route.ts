import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return false
  return true
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { brand } = await req.json()
  // Marka doğrudan ürün tablosunda tutuluyor, örnek ürün oluşturmak yerine sadece başarılı dön
  // Gerçek markalar ürün import edilince oluşuyor
  return NextResponse.json({ success: true, brand })
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { oldBrand, newBrand } = await req.json()
  await prisma.product.updateMany({ where: { brand: oldBrand }, data: { brand: newBrand } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { brand } = await req.json()
  await prisma.product.updateMany({ where: { brand }, data: { brand: null } })
  return NextResponse.json({ success: true })
}
