/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s.gravatar.com', 'https://storage.googleapis.com', 'lh3.googleusercontent.com']
  }
}

module.exports = nextConfig
