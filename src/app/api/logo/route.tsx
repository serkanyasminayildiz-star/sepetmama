import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          padding: 40,
        }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 70,
            background: '#1B5E4B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 180,
            boxShadow: '0 12px 30px rgba(27, 94, 75, 0.35)',
          }}
        >
          🐾
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -1,
            display: 'flex',
            gap: 14,
          }}
        >
          <span style={{ color: '#1B5E4B' }}>Leziz</span>
          <span style={{ color: '#16241D' }}>Mama</span>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
