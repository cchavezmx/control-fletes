/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s.gravatar.com'],
  },
  i18n: {
    locales: ['es-MX', 'en-US'],
    defaultLocale: 'es-MX',
  }
}

module.exports = nextConfig
