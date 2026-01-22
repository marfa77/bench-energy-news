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
  // Увеличиваем таймаут для статической генерации
  staticPageGenerationTimeout: 300,
  // Копируем статические файлы из posts/ в out/
  async generateBuildId() {
    return 'build-' + Date.now();
  },
}

module.exports = nextConfig
