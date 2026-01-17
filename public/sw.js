// ============================================
// SERVICE WORKER OFFLINE-FIRST - ISIWEEK POS
// ✅ CORREGIDO según auditoría técnica
// ============================================

const CACHE_VERSION = 'isiweek-pos-v1.0.4';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Archivos críticos a cachear en instalación
const STATIC_FILES = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/icons/manifest-icon-192.maskable.png'
];

// Rutas críticas que NUNCA deben cachearse agresivamente
const RUTAS_CRITICAS = ['/login', '/registro', '/recuperar'];

// ===========================================
// INSTALACIÓN - Cachear archivos estáticos
// ✅ FIX: Instalación tolerante a fallos
// ===========================================
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                console.log('[SW] Cacheando archivos estáticos');

                // ✅ MEJORA: No romper instalación si un archivo falla
                return Promise.allSettled(
                    STATIC_FILES.map(file =>
                        cache.add(file).catch(err => {
                            console.warn(`[SW] No se pudo cachear ${file}:`, err);
                        })
                    )
                );
            })
            .then(() => {
                console.log('[SW] Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error en instalación:', error);
            })
    );
});

// ===========================================
// ACTIVACIÓN - Limpiar cachés antiguos
// ===========================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('isiweek-pos-') &&
                                !name.startsWith(CACHE_VERSION);
                        })
                        .map((name) => {
                            console.log('[SW] Eliminando caché antiguo:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activación completada');
                return self.clients.claim();
            })
    );
});

// ===========================================
// FETCH - Estrategia de caché
// ===========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests de chrome-extension y otros protocolos
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // ===========================================
    // 🔥 FIX #1: Login POST - Sin usar navigator.onLine
    // La única verdad es: fetch() funciona = online, fetch() falla = offline
    // ===========================================
    if (
        request.method === 'POST' &&
        (url.pathname === '/login' || url.pathname.includes('/login'))
    ) {
        event.respondWith(
            fetch(request).catch(() => {
                // ✅ CORRECCIÓN CRÍTICA: fetch falló = offline
                return new Response(
                    JSON.stringify({
                        success: false,
                        offline: true,
                        message: 'Login remoto bloqueado: Sin conexión a internet'
                    }),
                    {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
        );
        return;
    }

    // ===========================================
    // 🔥 FIX #2: REGLA DE ORO - Solo interceptar GET
    // NUNCA interceptar POST/PUT/DELETE (excepto casos explícitos arriba)
    // ===========================================
    if (request.method !== 'GET') {
        return; // Dejar que el navegador maneje directamente
    }

    // ===========================================
    // ESTRATEGIA 1: API Routes → Network First
    // ===========================================
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    return response;
                })
                .catch(() => {
                    // ✅ SIEMPRE Response válida
                    return new Response(
                        JSON.stringify({
                            offline: true,
                            error: 'Sin conexión - Acción no disponible'
                        }),
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }

    // ===========================================
    // ESTRATEGIA 2: Imágenes → Cache First
    // ===========================================
    if (request.destination === 'image') {
        event.respondWith(
            caches.open(CACHE_IMAGES)
                .then(async (cache) => {
                    const cachedResponse = await cache.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request)
                        .then((networkResponse) => {
                            if (networkResponse.ok) {
                                cache.put(request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(async () => {
                            // Fallback a ícono por defecto
                            const iconoDefault = await cache.match('/icons/manifest-icon-192.maskable.png');

                            // ✅ SIEMPRE Response válida
                            return iconoDefault || new Response('', {
                                status: 404,
                                statusText: 'Not Found',
                                headers: { 'Content-Type': 'image/png' }
                            });
                        });
                })
        );
        return;
    }

    // ===========================================
    // 🔥 FIX #3: Navegación - Excluir rutas críticas
    // Login/Registro/Recuperar NO deben cachearse agresivamente
    // ===========================================
    if (
        request.mode === 'navigate' &&
        !RUTAS_CRITICAS.some(ruta => url.pathname.startsWith(ruta))
    ) {
        event.respondWith(
            caches.open(CACHE_STATIC)
                .then(async (cache) => {
                    const cachedResponse = await cache.match(request);

                    const fetchPromise = fetch(request)
                        .then((networkResponse) => {
                            if (networkResponse.ok) {
                                cache.put(request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(async () => {
                            // Si hay cache, usarlo
                            if (cachedResponse) return cachedResponse;

                            // Si no, página offline
                            const offlinePage = await cache.match('/offline.html');

                            // ✅ SIEMPRE Response válida
                            return offlinePage || new Response(
                                `<!DOCTYPE html>
                                <html lang="es">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Sin Conexión</title>
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            height: 100vh;
                                            margin: 0;
                                            background: #f5f5f5;
                                        }
                                        .container {
                                            text-align: center;
                                            padding: 20px;
                                        }
                                        h1 { color: #ff9800; }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <h1>⚠️ Sin Conexión</h1>
                                        <p>No hay conexión a internet</p>
                                        <button onclick="location.reload()">Reintentar</button>
                                    </div>
                                </body>
                                </html>`,
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'text/html' }
                                }
                            );
                        });

                    // Cache First: Priorizar cache si existe
                    return cachedResponse || fetchPromise;
                })
        );
        return;
    }

    // ===========================================
    // ESTRATEGIA 4: Otros recursos → Stale While Revalidate
    // ===========================================
    event.respondWith(
        caches.open(CACHE_DYNAMIC)
            .then(async (cache) => {
                const cachedResponse = await cache.match(request);

                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Si hay cache, usarlo
                        if (cachedResponse) return cachedResponse;

                        // ✅ SIEMPRE Response válida, NUNCA undefined/null
                        return new Response('', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });

                // Priorizar cache si existe (velocidad)
                return cachedResponse || fetchPromise;
            })
    );
});

// ===========================================
// MENSAJES - Comunicación con la app
// ===========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => caches.delete(name))
                );
            })
        );
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// ===========================================
// SYNC - Background Sync
// ===========================================
self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-ventas') {
        event.waitUntil(syncVentas());
    }
});

async function syncVentas() {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage({
            type: 'SYNC_VENTAS',
            message: 'Sincronizando ventas pendientes...'
        });
    });
}

console.log('[SW] Service Worker cargado - Versión:', CACHE_VERSION);