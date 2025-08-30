/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverActions: {},
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
    formats: ["image/webp", "image/avif"],
  },
  // Optimize for Vercel deployment
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
