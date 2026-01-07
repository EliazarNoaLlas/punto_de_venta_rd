'use client';

import { useOnline } from '@/lib/hooks/useOnline';

export function OfflineIndicator() {
    const isOnline = useOnline();

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
            <span>⚠️ Modo Offline - Los datos se sincronizarán cuando vuelva la conexión</span>
        </div>
    );
}