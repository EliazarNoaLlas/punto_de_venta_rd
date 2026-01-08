'use client';

import { useState, useEffect } from 'react';
import { syncManager } from '../sync/syncManager';

export function useSyncStatus() {
    const [syncStatus, setSyncStatus] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const updateSyncStatus = async () => {
            const status = await syncManager.getSyncStatus();
            setSyncStatus(status);
            setIsSyncing(status?.isSyncing || false);
        };

        updateSyncStatus();

        // Actualizar cada 10 segundos
        const interval = setInterval(updateSyncStatus, 10000);

        // Escuchar eventos de sincronización
        const handleSyncComplete = () => {
            updateSyncStatus();
        };

        window.addEventListener('sync-complete', handleSyncComplete);

        return () => {
            clearInterval(interval);
            window.removeEventListener('sync-complete', handleSyncComplete);
        };
    }, []);

    return { syncStatus, isSyncing };
}
