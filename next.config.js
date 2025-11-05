/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' }
    ]
  },
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig;
