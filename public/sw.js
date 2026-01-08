// ============================================
// SERVICE WORKER OFFLINE-FIRST - ISIWEEK POS
// ============================================

const CACHE_VERSION = 'isiweek-pos-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Archivos críticos a cachear en instalación
const STATIC_FILES = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// ===========================================
// INSTALACIÓN - Cachear archivos estáticos
// ===========================================
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                console.log('[SW] Cacheando archivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Instalación completada');
                return self.skipWaiting(); // Activar inmediatamente
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
                            // Eliminar cachés que no coinciden con la versión actual
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
                return self.clients.claim(); // Tomar control de todas las páginas
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
    // ESTRATEGIA 1: API Routes → Network First
    // ===========================================
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Si la respuesta es exitosa, NO cachear APIs
                    // Las APIs se manejan con IndexedDB, no con cache
                    return response;
                })
                .catch(() => {
                    // Si falla el fetch (offline), retornar respuesta offline
                    return new Response(
                        JSON.stringify({
                            offline: true,
                            error: 'Sin conexión - Los datos se guardarán localmente'
                        }),
                        {
                            status: 503,
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
                .then((cache) => {
                    return cache.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }

                            return fetch(request)
                                .then((networkResponse) => {
                                    // Cachear la imagen
                                    cache.put(request, networkResponse.clone());
                                    return networkResponse;
                                })
                                .catch(() => {
                                    // Retornar imagen placeholder si existe
                                    return cache.match('/icons/manifest-icon-192.maskable.png');
                                });
                        });
                })
        );
        return;
    }

    // ===========================================
    // ESTRATEGIA 3: Navegación → Cache First (con revalidación)
    // ===========================================
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.open(CACHE_STATIC)
                .then((cache) => {
                    return cache.match(request)
                        .then((cachedResponse) => {
                            // Intentar fetch en background
                            const fetchPromise = fetch(request)
                                .then((networkResponse) => {
                                    // Actualizar cache con la respuesta nueva
                                    cache.put(request, networkResponse.clone());
                                    return networkResponse;
                                })
                                .catch(() => {
                                    // Si falla, usar cache
                                    return cachedResponse || cache.match('/offline');
                                });

                            // Retornar cache inmediatamente (más rápido)
                            return cachedResponse || fetchPromise;
                        });
                })
        );
        return;
    }

    // ===========================================
    // ESTRATEGIA 4: Otros recursos → Stale While Revalidate
    // ===========================================
    event.respondWith(
        caches.open(CACHE_DYNAMIC)
            .then((cache) => {
                return cache.match(request)
                    .then((cachedResponse) => {
                        const fetchPromise = fetch(request)
                            .then((networkResponse) => {
                                // Solo cachear GET exitosos
                                if (request.method === 'GET' && networkResponse.ok) {
                                    cache.put(request, networkResponse.clone());
                                }
                                return networkResponse;
                            })
                            .catch(() => cachedResponse);

                        return cachedResponse || fetchPromise;
                    });
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
// SYNC - Background Sync (cuando vuelve internet)
// ===========================================
self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-ventas') {
        event.waitUntil(syncVentas());
    }
});

async function syncVentas() {
    // Esta función se ejecuta cuando vuelve internet
    // Enviar mensaje a la app para que sincronice
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage({
            type: 'SYNC_VENTAS',
            message: 'Sincronizando ventas pendientes...'
        });
    });
}

console.log('[SW] Service Worker cargado - Versión:', CACHE_VERSION);
