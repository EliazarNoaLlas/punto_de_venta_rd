import { db } from '../db/indexedDB';
import { ventasService } from '../db/ventasService';
import { productosService } from '../db/productosService';

export class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.sync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Sincronizar datos pendientes
    async sync() {
        if (!this.isOnline || this.syncInProgress) {
            return;
        }

        this.syncInProgress = true;

        try {
            // Sincronizar ventas
            await this.syncVentas();

            // Sincronizar inventario
            await this.syncInventario();

            // Sincronizar productos
            await this.syncProductos();

            console.log('Sincronización completada');
        } catch (error) {
            console.error('Error en sincronización:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Sincronizar ventas
    async syncVentas() {
        const ventasPendientes = await ventasService.getPendingSync();

        for (const venta of ventasPendientes) {
            try {
                const response = await fetch('/api/ventas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(venta),
                });

                if (response.ok) {
                    const data = await response.json();
                    await ventasService.markAsSynced(venta.id, data.id);

                    // Eliminar de cola de sincronización
                    await db.syncQueue
                        .where('[entity_type+entity_id]')
                        .equals(['venta', venta.id])
                        .delete();
                }
            } catch (error) {
                console.error(`Error sincronizando venta ${venta.id}:`, error);
            }
        }
    }

    // Sincronizar inventario
    async syncInventario() {
        const movimientosPendientes = await db.inventario
            .where('sync_status')
            .equals('pending')
            .toArray();

        for (const movimiento of movimientosPendientes) {
            try {
                const response = await fetch('/api/inventario/movimientos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movimiento),
                });

                if (response.ok) {
                    movimiento.sync_status = 'synced';
                    await db.inventario.put(movimiento);
                }
            } catch (error) {
                console.error(`Error sincronizando movimiento:`, error);
            }
        }
    }

    // Sincronizar productos
    async syncProductos() {
        const productosPendientes = await db.productos
            .where('sync_status')
            .equals('pending')
            .toArray();

        for (const producto of productosPendientes) {
            try {
                const response = await fetch(`/api/productos/${producto.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(producto),
                });

                if (response.ok) {
                    producto.sync_status = 'synced';
                    await db.productos.put(producto);
                }
            } catch (error) {
                console.error(`Error sincronizando producto:`, error);
            }
        }
    }

    // Sincronización periódica
    startPeriodicSync(intervalMs = 30000) {
        setInterval(() => {
            if (this.isOnline) {
                this.sync();
            }
        }, intervalMs);
    }
}

export const syncManager = new SyncManager();
