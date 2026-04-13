import Header from './components/Header'
import CircleStrip from './components/CircleStrip'
import HeroBanner from './components/HeroBanner'
import ProductSection from './components/ProductSection'
import Footer from './components/Footer'

const bestSellers = [
  { id: '1', name: 'Adult Kedi 2kg', brand: 'Royal Canin', price: 320, oldPrice: 400, emoji: '🐱', discount: 20 },
  { id: '2', name: 'Adult Köpek 3kg', brand: 'Pro Plan', price: 485, emoji: '🐕' },
  { id: '3', name: 'Pouch Yaş Mama x12', brand: 'Whiskas', price: 210, oldPrice: 247, emoji: '🥩', discount: 15 },
  { id: '4', name: 'Yetişkin Köpek 4kg', brand: 'Pedigree', price: 390, emoji: '🦴' },
  { id: '5', name: 'Kitten Yavru 1.5kg', brand: "Hill's", price: 545, emoji: '🐾', isNew: true },
  { id: '6', name: 'Indoor Cat 1.8kg', brand: 'Acana', price: 630, oldPrice: 700, emoji: '🐈', discount: 10 },
]

const catFoods = [
  { id: '1', name: 'Sterilised 4kg', brand: 'Royal Canin', price: 720, oldPrice: 960, emoji: '🐱', discount: 25 },
  { id: '2', name: 'One Adult Tavuk 3kg', brand: 'Pro Plan', price: 410, emoji: '🐈' },
  { id: '3', name: 'Quinoa Urinary 1.5kg', brand: 'n&D', price: 560, oldPrice: 685, emoji: '🥫', discount: 18 },
  { id: '4', name: 'Science Plan Senior', brand: "Hill's", price: 890, emoji: '🐱', isNew: true },
  { id: '5', name: 'Adult Somonlu 3kg', brand: 'Refleks', price: 340, emoji: '🐾' },
  { id: '6', name: 'Indoor Cat 1.8kg', brand: 'Acana', price: 680, oldPrice: 775, emoji: '🧡', discount: 12 },
]

const dogFoods = [
  { id: '1', name: 'Science Plan 6kg', brand: "Hill's", price: 750, oldPrice: 940, emoji: '🐕', discount: 20 },
  { id: '2', name: 'Adult Medium 3kg', brand: 'Pro Plan', price: 520, emoji: '🦮' },
  { id: '3', name: 'Puppy & Junior 2kg', brand: 'Acana', price: 680, emoji: '🐩', isNew: true },
  { id: '4', name: 'Maxi Adult 10kg', brand: 'Royal Canin', price: 1250, oldPrice: 1470, emoji: '🦴', discount: 15 },
  { id: '5', name: 'Ocean Somon 2.5kg', brand: 'n&D', price: 780, emoji: '🐶' },
  { id: '6', name: 'Adult Kuzu 3kg', brand: 'Refleks', price: 310, oldPrice: 345, emoji: '🥩', discount: 10 },
]

export default function HomePage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <CircleStrip />
      <HeroBanner />

      {/* Kategori sekmeleri */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide justify-center">
        {['🐱 Kedi Mamaları', '🐶 Köpek Mamaları', '🦜 Kuş Yemi', '🐠 Balık Yemi', '🧸 Aksesuarlar'].map(
          (tab, i) => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border-2 transition-all ${
                i === 0
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-orange-50 text-orange-500 border-orange-200'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <ProductSection title="🔥 Çok Satanlar" products={bestSellers} href="/urunler" />

      {/* Kampanya banner */}
      <div className="mx-4 my-1 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl px-5 py-3.5 flex justify-between items-center">
        <div>
          <p className="text-sm font-extrabold text-white">🎉 İlk Siparişe %10 İndirim!</p>
          <p className="text-[10px] text-blue-100 mt-0.5">SEPETMAMA10 kupon kodunu kullan · Min. 200₺</p>
        </div>
        <button className="bg-white text-blue-700 text-xs font-extrabold px-3.5 py-2 rounded-xl whitespace-nowrap hover:bg-blue-50 transition-colors">
          Hemen Al
        </button>
      </div>

      <ProductSection title="🐱 Kedi Mamaları" products={catFoods} href="/kategori/kedi-mamalari" />
      <ProductSection title="🐶 Köpek Mamaları" products={dogFoods} href="/kategori/kopek-mamalari" />

      <Footer />
    </main>
  )
}