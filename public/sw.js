// public/sw.js

const CACHE_VERSION = 'pos-rd-v1';
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Archivos estáticos críticos para cachear
const STATIC_ASSETS = [
    '/',
    OFFLINE_URL,
    '/manifest.json',
    '/favicon.ico',
    '/logo.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Next.js static assets
    '/_next/static/**/*',
];

// ---------------------------------------------
// Instalación del Service Worker
// ---------------------------------------------
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// ---------------------------------------------
// Activación: limpiar caches antiguas
// ---------------------------------------------
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter(
                        (name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE
                    )
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// ---------------------------------------------
// Fetch: Network First para páginas, Cache First para assets
// ---------------------------------------------
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar APIs (si manejas IndexedDB offline)
    if (url.pathname.startsWith('/api/')) return;

    // Network First para navegación
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cachear página visitada
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) =>
                            cache.put(request, responseClone)
                        );
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
                )
        );
        return;
    }

    // Cache First para otros assets (CSS, JS, imágenes)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request)
                .then((response) => {
                    // Solo cachear respuestas válidas
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => {
                    // Fallback para imágenes si estás offline
                    if (request.destination === 'image') {
                        return '/logo.png';
                    }
                })
        })
    );
});

// ---------------------------------------------
// Escuchar mensajes de la app
// ---------------------------------------------
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
