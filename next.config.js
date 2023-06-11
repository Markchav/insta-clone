/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // port: '',
        // pathname: '/account123/**',
      },
      {
        protocol:'https',
        hostname: 'cloudflare-ipfs.com'
      },
      {
        protocol:'https',
        hostname:'avatars.githubusercontent.com'
      }
    ],
  },

}

module.exports = nextConfig
