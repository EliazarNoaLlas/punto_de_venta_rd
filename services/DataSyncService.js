import { syncManager } from '@/lib/sync/syncManager';
import { ventasService } from '@/lib/db/ventasService';
import { productosService } from '@/lib/db/productosService';
import { db } from '@/lib/db/localDB';

/**
 * DataSyncService
 * Servicio de alto nivel para gestión de sincronización de datos.
 * Actúa como fachada para el syncManager y los servicios de base de datos.
 */
export const DataSyncService = {
    /**
     * Iniciar sincronización manual inmediata
     * @returns {Promise<Object>} Resultado de la sincronización
     */
    async syncNow() {
        return await syncManager.sync();
    },

    /**
     * Obtener conteo de elementos pendientes de sincronización
     * @returns {Promise<Object>} { ventas, productos, inventario, total }
     */
    async getPendingCounts() {
        try {
            const ventas = (await ventasService.getPendingSync()).length;
            const productos = (await productosService.getPendingSync()).length;
            const inventario = await db.inventario.where('sync_status').equals('pending').count();

            return {
                ventas,
                productos,
                inventario,
                total: ventas + productos + inventario
            };
        } catch (error) {
            console.error('Error obteniendo pendientes:', error);
            return { ventas: 0, productos: 0, inventario: 0, total: 0 };
        }
    },

    /**
     * Iniciar sincronización automática
     * (Normalmente llamada al iniciar la app)
     */
    startAutoSync() {
        // syncManager ya maneja listeners automáticos al importarse,
        // pero podemos forzar un start explícito si quisiéramos controlar el ciclo de vida.
        // Por ahora, solo logueamos.
        console.log('🔄 DataSyncService: Auto-sync activo');
    },

    /**
     * Suscribirse a eventos de sincronización
     * @param {Function} callback 
     */
    onSyncComplete(callback) {
        if (typeof window !== 'undefined') {
            window.addEventListener('sync-complete', (e) => callback(e.detail));
        }
    },

    /**
     * Verificar estado de conexión y DB
     */
    async getStatus() {
        const dbReady = await db.isOpen();
        const online = navigator.onLine;
        const pending = await this.getPendingCounts();

        return {
            online,
            dbReady,
            pending,
            lastSync: localStorage.getItem('last_sync_time')
        };
    }
};
