import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // iyzipay kaynaklarını fs.readdirSync + dinamik require ile yüklüyor;
  // Turbopack bunu statik çözemediği için paket sunucuda bundle dışı bırakılır.
  serverExternalPackages: ['iyzipay'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jjdzeowqxhghzyhjyqwe.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lezizmama.com',
      },
      {
        protocol: 'https',
        hostname: 'www.lezizmama.com',
      },
    ],
  },
}

export default nextConfig