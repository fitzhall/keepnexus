const isDesktop = process.env.NEXT_PUBLIC_PLATFORM === 'desktop'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Static export for desktop builds
  ...(isDesktop && { output: 'export' }),

  // Skip lint during desktop builds (web CI handles linting)
  ...(isDesktop && { eslint: { ignoreDuringBuilds: true } }),
  ...(isDesktop && { typescript: { ignoreBuildErrors: true } }),

  // Optimize images (unoptimized required for static export)
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
    ...(isDesktop && { unoptimized: true }),
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-switch',
      'framer-motion',
      'lucide-react'
    ],
  },

  // Custom webpack configuration for Three.js if needed
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })
    return config
  },
}

module.exports = nextConfig