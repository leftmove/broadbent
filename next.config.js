/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs'
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'js-yaml-loader',
    });
    
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        ai: {
          name: 'ai-sdk',
          test: /[\\/]node_modules[\\/](@ai-sdk|ai)[\\/]/,
          chunks: 'all',
          priority: 10
        },
        convex: {
          name: 'convex',
          test: /[\\/]node_modules[\\/](convex|@convex-dev)[\\/]/,
          chunks: 'all',
          priority: 10
        }
      }
    };
    
    return config;
  },
}

module.exports = nextConfig
