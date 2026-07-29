// Ürün formu (admin) için paylaşılan slug + doğrulama mantığı.
// API route'u ince tutmak ve bu kuralları testten geçirebilmek için ayrı dosyada.

export const TAG_MAX = 20
export const SHORT_DESC_MAX = 200

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Alınmış slug'lar arasında çakışma varsa -2, -3 … ekleyerek benzersizleştirir. */
export function uniqueSlug(base: string, taken: string[]): string {
  const set = new Set(taken)
  if (!set.has(base)) return base
  let n = 2
  while (set.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

export type ProductInput = {
  name: string
  shortDescription: string | null
  description: string | null
  brand: string | null
  tag: string | null
  categoryId: string | null
  price: number
  salePrice: number | null
  stock: number
  isActive: boolean
  isFeatured: boolean
}

export type ValidationResult =
  | { ok: true; data: ProductInput }
  | { ok: false; error: string }

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

/** Formdan gelen ham gövdeyi doğrular ve normalize eder. */
export function validateProduct(body: Record<string, unknown>): ValidationResult {
  const name = toText(body.name)
  if (!name) return { ok: false, error: 'Ürün adı zorunlu' }
  if (name.length > 150) return { ok: false, error: 'Ürün adı en fazla 150 karakter olabilir' }

  const price = toNumber(body.price)
  if (price === null) return { ok: false, error: 'Fiyat geçerli bir sayı olmalı' }
  if (price <= 0) return { ok: false, error: 'Fiyat sıfırdan büyük olmalı' }

  const salePrice = toNumber(body.salePrice)
  if (salePrice !== null) {
    if (salePrice <= 0) return { ok: false, error: 'İndirimli fiyat sıfırdan büyük olmalı' }
    if (salePrice >= price) return { ok: false, error: 'İndirimli fiyat, normal fiyattan düşük olmalı' }
  }

  const stockRaw = toNumber(body.stock)
  const stock = stockRaw === null ? 0 : Math.trunc(stockRaw)
  if (stock < 0) return { ok: false, error: 'Stok negatif olamaz' }

  return {
    ok: true,
    data: {
      name,
      shortDescription: toText(body.shortDescription, SHORT_DESC_MAX),
      description: toText(body.description),
      brand: toText(body.brand),
      tag: toText(body.tag, TAG_MAX),
      categoryId: toText(body.categoryId),
      price,
      salePrice,
      stock,
      isActive: body.isActive !== false,
      isFeatured: body.isFeatured === true,
    },
  }
}
