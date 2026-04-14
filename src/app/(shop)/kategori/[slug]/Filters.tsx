export default function Filters({ searchParams }: { searchParams: any }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4">
      <h3 className="font-extrabold text-gray-800 mb-4">Filtreler</h3>
      <div className="mb-5">
        <p className="text-xs font-extrabold text-gray-500 uppercase mb-2">Fiyat</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.min}
            className="w-full border border-orange-100 rounded-xl px-2 py-1.5 text-sm outline-none focus:border-orange-400"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.max}
            className="w-full border border-orange-100 rounded-xl px-2 py-1.5 text-sm outline-none focus:border-orange-400"
          />
        </div>
      </div>
    </div>
  )
}