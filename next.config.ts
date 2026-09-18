import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // iyzipay kaynaklarını fs.readdirSync + dinamik require ile yüklüyor;
  // Turbopack bunu statik çözemediği için paket sunucuda bundle dışı bırakılır.
  serverExternalPackages: ['iyzipay'],
  // Vercel'in dosya izleyicisi de aynı dinamik yüklemeyi göremiyor → lib/resources
  // deploy'a girmiyordu (ENOENT scandir). Paketin tamamı açıkça dahil edilir.
  outputFileTracingIncludes: {
    '/api/iyzico/init': ['./node_modules/iyzipay/**/*'],
    '/api/iyzico/callback': ['./node_modules/iyzipay/**/*'],
  },
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