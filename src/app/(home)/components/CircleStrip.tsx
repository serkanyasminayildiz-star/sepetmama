'use client'

const circles = [
  { type: 'trust', icon: '🚚', label: 'Ücretsiz\nKargo' },
  { type: 'trust', icon: '⚡', label: 'Hızlı\nTeslimat' },
  { type: 'trust', icon: '💳', label: 'Taksit\nİmkanı' },
  { type: 'trust', icon: '↩️', label: 'Kolay\nİade' },
  { type: 'brand', label: 'Pro\nPlan' },
  { type: 'brand', label: 'Royal\nCanin', small: true },
  { type: 'brand', label: "Hill's" },
  { type: 'brand', label: 'n&D', large: true },
  { type: 'brand', label: 'Refleks' },
  { type: 'brand', label: 'Acana' },
]

const CircleItem = ({ item }: { item: typeof circles[0] }) => (
  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
    <div className="relative w-[90px] h-[90px]">
      {/* Dönen tam parlak halka */}
      <div
        className="absolute inset-0 rounded-full animate-spin-ring"
        style={{
         background: 'conic-gradient(#c2410c, #ea580c, #fed7aa, #c2410c)',
         padding: '3px',
         borderRadius: '50%',
         filter: 'drop-shadow(0 0 5px #c2410c)',
       }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </div>

      {/* İç turuncu daire */}
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex flex-col items-center justify-center gap-0.5 shadow-inner group-hover:from-orange-500 group-hover:to-orange-700 transition-all">
        {item.type === 'trust' ? (
          <>
            <span className="text-2xl leading-none">{item.icon}</span>
            <span className="text-[8px] font-extrabold text-white text-center leading-tight whitespace-pre-line uppercase tracking-wide">
              {item.label}
            </span>
          </>
        ) : (
          <span className={`font-extrabold text-white text-center leading-tight whitespace-pre-line uppercase tracking-wide ${
            item.large ? 'text-[14px]' : item.small ? 'text-[10px]' : 'text-[11px]'
          }`}>
            {item.label}
          </span>
        )}
      </div>
    </div>
  </div>
)

export default function CircleStrip() {
  const doubled = [...circles, ...circles]
  return (
    <div className="bg-white border-b border-orange-100 overflow-hidden h-[130px] flex items-center group/strip">
      <div className="flex items-center gap-5 px-5 w-max animate-scroll-track group-hover/strip:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <CircleItem key={i} item={item} />
        ))}
      </div>
    </div>
  )
}