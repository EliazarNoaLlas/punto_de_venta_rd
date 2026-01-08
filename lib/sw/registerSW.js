'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator
        ) {
            registerServiceWorker();
        }
    }, []);
}

async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('✅ Service Worker registrado:', registration.scope);

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker?.addEventListener('statechange', () => {
                if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                ) {
                    // Nueva versión disponible
                    if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            });
        });

        // Escuchar mensajes del SW
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_VENTAS') {
                // Trigger sincronización en la app
                window.dispatchEvent(new CustomEvent('sync-ventas'));
            }
        });

    } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
    }
}

// Solicitar Background Sync
export async function requestBackgroundSync(tag) {
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log('✅ Background sync registrado:', tag);
    } catch (error) {
        console.error('❌ Error en background sync:', error);
    }
}
