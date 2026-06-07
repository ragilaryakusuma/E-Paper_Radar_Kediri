/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      // Add your S3 bucket domain here
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
