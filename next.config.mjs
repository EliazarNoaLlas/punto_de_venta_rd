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
      // NO cachear chunks JS de Next.js (incluye Server Actions)
      {
        source: '/_next/static/chunks/:path*.js',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' 
          },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      // Cachear otros assets estáticos normalmente
      {
        source: '/_next/static/:path*',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' 
          },
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
    // ⚡ Chunks JS de Next.js (NetworkFirst para evitar problemas con Server Actions)
    {
      urlPattern: /^\/_next\/static\/chunks\/.*\.js$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-chunks',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 0, // No cachear por tiempo, solo para offline
        },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Solo cachear si la respuesta es exitosa y no tiene headers no-cache
              if (response.status === 200 && !response.headers.get('cache-control')?.includes('no-store')) {
                return response;
              }
              return null;
            }
          }
        ]
      },
    },
    // ⚡ Otros assets estáticos de Next.js (CSS, imágenes, etc.)
    {
      urlPattern: /^\/_next\/static\/(?!chunks\/).*$/i,
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

// Bundle Analyzer (solo cuando ANALYZE=true)
// Nota: Para usar bundle analyzer, ejecutar: ANALYZE=true npm run build
export default pwaConfig(nextConfig)
