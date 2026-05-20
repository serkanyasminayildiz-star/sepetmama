'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: '#E8845A',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 2px 8px rgba(232,132,90,0.3)',
      }}
    >
      🖨️ Yazdır
    </button>
  )
}
