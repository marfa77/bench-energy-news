/** @type {import('next').NextConfig} */
const nextConfig = {
  // Убрали output: 'export' для поддержки API routes (как в CIPLE)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.notion.so',
      },
      {
        protocol: 'https',
        hostname: '**.notion-static.com',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
    ],
  },
  trailingSlash: true,
  // Оптимизация сборки
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Оптимизация параллельной генерации страниц
  experimental: {
    optimizePackageImports: ['next'],
  },
}

module.exports = nextConfig
