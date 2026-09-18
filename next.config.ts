import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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