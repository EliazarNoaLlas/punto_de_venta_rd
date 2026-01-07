'use client';

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

export function useServiceWorker() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            process.env.NODE_ENV === 'production'
        ) {
            const wb = new Workbox('/sw.js');

            wb.addEventListener('installed', (event) => {
                if (event.isUpdate) {
                    if (confirm('Nueva versión disponible. ¿Recargar?')) {
                        wb.messageSkipWaiting();
                    }
                }
            });

            wb.register();
        }
    }, []);
}
