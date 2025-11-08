/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude functions directory from webpack
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/functions/**"],
    };
    return config;
  },
};

export default nextConfig;

