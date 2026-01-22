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
  // Копируем статические файлы из posts/ в out/
  async generateBuildId() {
    return 'build-' + Date.now();
  },
}

module.exports = nextConfig
