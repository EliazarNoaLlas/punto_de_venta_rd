import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚛️ React
  reactStrictMode: true,

  // 🚀 Next 16 + Turbopack
  turbopack: {},

  // 🖼️ Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '72.62.128.63',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.isiweek.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
  },

  // 🌐 Headers necesarios para PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ]
  },
}

// 🔥 PWA configurado correctamente para Next 16
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  runtimeCaching: [
    // 🖼️ Imágenes (Requested strategy: CacheFirst)
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
        }
      }
    },
    // 🔌 API (Requested strategy: NetworkFirst with 3s timeout)
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Solo cachear respuestas exitosas
              return response.status === 200 ? response : null;
            }
          }
        ]
      }
    },
    // ⚡ Assets Next.js
    {
      urlPattern: /^\/_next\/static\/.*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    // 📄 Navegación
    {
      urlPattern: /^\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
})

export default pwaConfig(nextConfig)
