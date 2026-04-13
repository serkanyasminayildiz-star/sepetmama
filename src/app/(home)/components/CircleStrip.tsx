'use client'

const circles = [
  { type: 'trust', icon: '🚚', label: 'Ücretsiz\nKargo' },
  { type: 'trust', icon: '↩️', label: '14 Gün\nİade' },
  { type: 'trust', icon: '🔒', label: 'Güvenli\nÖdeme' },
  { type: 'trust', icon: '⚡', label: 'Hızlı\nTeslimat' },
  { type: 'brand', label: 'Pro\nPlan' },
  { type: 'brand', label: 'Royal\nCanin', small: true },
  { type: 'brand', label: "Hill's" },
  { type: 'brand', label: 'n&D', large: true },
  { type: 'brand', label: 'Refleks' },
  { type: 'brand', label: 'Acana' },
]

const CircleItem = ({ item }: { item: typeof circles[0] }) => (
  <div className="relative w-[100px] h-[100px] flex-shrink-0 cursor-pointer group">
    <div className="absolute inset-0 animate-spin-ring">
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="rgba(255,107,26,0.15)" strokeWidth="3.5" />
        <circle cx="50" cy="50" r="46" stroke="#FF6B1A" strokeWidth="3.5" strokeDasharray="60 130" strokeLinecap="round" />
      </svg>
    </div>
    <div className="absolute inset-[8px] rounded-full bg-orange-50 flex flex-col items-center justify-center gap-1 transition-colors group-hover:bg-orange-100">
      {item.type === 'trust' ? (
        <>
          <span className="text-2xl leading-none">{item.icon}</span>
          <span className="text-[10px] font-extrabold text-orange-500 text-center leading-tight whitespace-pre-line">
            {item.label}
          </span>
        </>
      ) : (
        <span className={`font-extrabold text-orange-500 text-center leading-tight whitespace-pre-line ${
          item.large ? 'text-[15px]' : item.small ? 'text-[11px]' : 'text-[12px]'
        }`}>
          {item.label}
        </span>
      )}
    </div>
  </div>
)

export default function CircleStrip() {
  const doubled = [...circles, ...circles]
  return (
    <div className="bg-white border-b border-orange-100 overflow-hidden h-[120px] flex items-center group/strip">
      <div className="flex items-center gap-4 px-4 w-max animate-scroll-track group-hover/strip:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <CircleItem key={i} item={item} />
        ))}
      </div>
    </div>
  )
}