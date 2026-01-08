'use client';

import { syncManager } from '@/lib/sync/syncManager';
import { useSyncStatus } from '@/lib/hooks/useSyncStatus';
import { useState } from 'react';

export function SyncButton() {
    const { syncStatus, isSyncing } = useSyncStatus();
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncManager.sync();
        } catch (error) {
            console.error('Error en sincronización manual:', error);
        } finally {
            setSyncing(false);
        }
    };

    if (!syncStatus || syncStatus.total === 0) {
        return null; // No hay nada que sincronizar
    }

    return (
        <button
            onClick={handleSync}
            disabled={syncing || isSyncing}
            className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed z-40"
        >
            {(syncing || isSyncing) ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Sincronizando...</span>
                </>
            ) : (
                <>
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    <span>Sincronizar ({syncStatus.total})</span>
                </>
            )}
        </button>
    );
}
