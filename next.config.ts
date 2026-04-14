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
        hostname: 'sepetmama.com',
      },
    ],
  },
}

export default nextConfig