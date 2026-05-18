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
            background: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 180,
            boxShadow: '0 12px 30px rgba(249, 115, 22, 0.35)',
          }}
        >
          🐾
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -1,
            display: 'flex',
          }}
        >
          <span style={{ color: '#f97316' }}>se</span>
          <span style={{ color: '#2563eb' }}>Pet</span>
          <span style={{ color: '#f97316' }}>Mama</span>
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
