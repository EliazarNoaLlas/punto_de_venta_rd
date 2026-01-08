import { db } from '../db/indexedDB';
import { ventasService } from '../db/ventasService';
import { productosService } from '../db/productosService';

// ============================================
// SYNC MANAGER - ISIWEEK POS
// Sincroniza datos pendientes cuando vuelve internet
// ============================================

class SyncManager {
    constructor() {
        this.isSyncing = false;
        this.syncInterval = null;
        this.setupListeners();
    }

    setupListeners() {
        if (typeof window !== 'undefined') {
            // Sincronizar cuando vuelve internet
            window.addEventListener('online', () => {
                console.log('🔄 Internet restaurado - Iniciando sincronización...');
                this.sync();
            });

            // Sincronizar cuando la app se reactiva
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && navigator.onLine) {
                    this.sync();
                }
            });

            // Escuchar evento de reconexión del API Adapter
            window.addEventListener('network-reconnect', () => {
                console.log('🔄 Reconexión detectada - Sincronizando...');
                this.sync();
            });

            // Sincronización periódica cada 5 minutos
            this.startPeriodicSync(5 * 60 * 1000);
        }
    }

    /**
     * Sincronización principal
     */
    async sync() {
        if (this.isSyncing || !navigator.onLine) {
            return;
        }

        this.isSyncing = true;
        console.log('🔄 Iniciando sincronización...');

        try {
            const results = {
                ventas: 0,
                productos: 0,
                inventario: 0,
                errores: [],
            };

            // 1. Sincronizar ventas (prioridad)
            results.ventas = await this.syncVentas();

            // 2. Sincronizar productos
            results.productos = await this.syncProductos();

            // 3. Sincronizar inventario
            results.inventario = await this.syncInventario();

            // 4. Limpiar cola de sincronización exitosa
            await this.cleanSyncQueue();

            console.log('✅ Sincronización completada:', results);

            // Emitir evento de sincronización completa
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('sync-complete', { detail: results })
                );
            }

            return results;
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
            return null;
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sincronizar ventas
     */
    async syncVentas() {
        const ventasPendientes = await ventasService.getPendingSync();
        console.log(`📤 Sincronizando ${ventasPendientes.length} ventas...`);

        let sincronizadas = 0;

        for (const venta of ventasPendientes) {
            try {
                // Obtener detalles completos
                const ventaCompleta = await ventasService.getById(venta.id);

                // Enviar al servidor
                const response = await fetch('/api/ventas/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ventaCompleta),
                });

                if (response.ok) {
                    const { id: serverId } = await response.json();

                    // Marcar como sincronizada
                    await ventasService.markAsSynced(venta.id, serverId);

                    sincronizadas++;
                    console.log(`✅ Venta sincronizada: ${venta.id} → ${serverId}`);
                } else {
                    console.error(`❌ Error sincronizando venta ${venta.id}:`, response.status);
                }
            } catch (error) {
                console.error(`❌ Error sincronizando venta ${venta.id}:`, error);
            }

            // Pequeña pausa entre requests
            await this.delay(500);
        }

        return sincronizadas;
    }

    /**
     * Sincronizar productos
     */
    async syncProductos() {
        const productosPendientes = await productosService.getPendingSync();
        console.log(`📤 Sincronizando ${productosPendientes.length} productos...`);

        let sincronizados = 0;

        for (const producto of productosPendientes) {
            try {
                const response = await fetch(`/api/productos/${producto.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(producto),
                });

                if (response.ok) {
                    // Marcar como sincronizado
                    producto.sync_status = 'synced';
                    await db.productos.put(producto);

                    sincronizados++;
                    console.log(`✅ Producto sincronizado: ${producto.id}`);
                }
            } catch (error) {
                console.error(`❌ Error sincronizando producto ${producto.id}:`, error);
            }

            await this.delay(300);
        }

        return sincronizados;
    }

    /**
     * Sincronizar inventario
     */
    async syncInventario() {
        const movimientosPendientes = await db.inventario
            .where('sync_status')
            .equals('pending')
            .toArray();

        console.log(`📤 Sincronizando ${movimientosPendientes.length} movimientos de inventario...`);

        let sincronizados = 0;

        for (const movimiento of movimientosPendientes) {
            try {
                const response = await fetch('/api/inventario/movimientos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(movimiento),
                });

                if (response.ok) {
                    movimiento.sync_status = 'synced';
                    await db.inventario.put(movimiento);
                    sincronizados++;
                    console.log(`✅ Movimiento sincronizado: ${movimiento.id}`);
                }
            } catch (error) {
                console.error(`❌ Error sincronizando movimiento:`, error);
            }

            await this.delay(300);
        }

        return sincronizados;
    }

    /**
     * Limpiar cola de sincronización
     */
    async cleanSyncQueue() {
        try {
            // Eliminar items de ventas sincronizadas
            const ventasSincronizadas = await db.ventas
                .where('sync_status')
                .equals('synced')
                .toArray();

            for (const venta of ventasSincronizadas) {
                await db.sync_queue
                    .where('entity_type')
                    .equals('venta')
                    .and((item) => item.entity_id === venta.id)
                    .delete();
            }

            console.log(`🗑️ Cola de sincronización limpiada`);
        } catch (error) {
            console.error('Error limpiando cola de sincronización:', error);
        }
    }

    /**
     * Iniciar sincronización periódica
     */
    startPeriodicSync(intervalMs) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                console.log('⏰ Sincronización periódica...');
                this.sync();
            }
        }, intervalMs);
    }

    /**
     * Detener sincronización periódica
     */
    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Obtener estado de sincronización
     */
    async getSyncStatus() {
        try {
            const ventasPendientes = await ventasService.getPendingSync();
            const productosPendientes = await productosService.getPendingSync();
            const queuePendiente = await db.sync_queue.count();

            return {
                ventas: ventasPendientes.length,
                productos: productosPendientes.length,
                queue: queuePendiente,
                total: ventasPendientes.length + productosPendientes.length,
                isSyncing: this.isSyncing,
            };
        } catch (error) {
            console.error('Error obteniendo estado de sincronización:', error);
            return null;
        }
    }

    /**
     * Utilidad: delay
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Exportar instancia única
export const syncManager = new SyncManager();
