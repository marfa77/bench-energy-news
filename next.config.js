/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  trailingSlash: true,
  basePath: '',
  assetPrefix: '',
  // Оптимизация сборки
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Увеличиваем таймаут для статической генерации (600 секунд = 10 минут)
  staticPageGenerationTimeout: 600,
  // Оптимизация параллельной генерации страниц
  experimental: {
    optimizePackageImports: ['next'],
  },
  // Копируем статические файлы из posts/ в out/
  async generateBuildId() {
    return 'build-' + Date.now();
  },
}

module.exports = nextConfig
