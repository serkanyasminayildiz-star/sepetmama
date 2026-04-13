import Link from 'next/link'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  oldPrice?: number
  emoji: string
  isNew?: boolean
  discount?: number
}

interface ProductSectionProps {
  title: string
  products: Product[]
  href: string
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="min-w-[130px] max-w-[130px] sm:min-w-[148px] sm:max-w-[148px] md:min-w-0 md:max-w-none bg-white rounded-2xl border border-orange-100 overflow-hidden flex-shrink-0 md:flex-shrink">
      <div className="relative h-[100px] sm:h-[115px] bg-orange-50 flex items-center justify-center text-4xl">
        {product.emoji}
        {product.discount && (
          <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
            %{product.discount}
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
            Yeni
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-[9px] text-gray-300 uppercase font-extrabold mb-0.5 tracking-wide">
          {product.brand}
        </p>
        <p className="text-[11px] font-bold text-gray-800 leading-tight mb-1 line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-extrabold text-orange-500">
            ₺{product.price.toLocaleString('tr-TR')}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-gray-300 line-through">
              ₺{product.oldPrice.toLocaleString('tr-TR')}
            </span>
          )}
        </div>
      </div>
      <button className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white text-[11px] font-extrabold py-1.5">
        + Sepete Ekle
      </button>
    </div>
  )
}

export default function ProductSection({ title, products, href }: ProductSectionProps) {
  return (
    <section className="px-4 py-3.5">
      <div className="flex justify-between items-center mb-2.5">
        <h2 className="text-[15px] font-extrabold text-gray-800">{title}</h2>
        <Link href={href} className="text-xs font-extrabold text-orange-500">
          Tümünü Gör →
        </Link>
      </div>
      <div className="flex md:grid md:grid-cols-6 gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}