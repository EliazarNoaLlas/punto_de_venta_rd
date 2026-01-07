import { db } from './indexedDB';

export const ventasService = {
    // Crear venta offline
    async create(ventaData) {
        const venta = {
            ...ventaData,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sync_status: 'pending',
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
        };

        // Guardar venta
        await db.ventas.add(venta);

        // Guardar detalles
        if (ventaData.productos) {
            const detalles = ventaData.productos.map((p) => ({
                venta_id: venta.id,
                producto_id: p.producto_id,
                cantidad: p.cantidad,
                precio_unitario: p.precio_unitario,
                subtotal: p.subtotal,
            }));
            await db.detalle_ventas.bulkAdd(detalles);
        }

        // Agregar a cola de sincronización
        await db.syncQueue.add({
            entity_type: 'venta',
            entity_id: venta.id,
            operation: 'create',
            data: venta,
            timestamp: new Date().toISOString(),
        });

        return venta;
    },

    // Obtener ventas pendientes de sincronización
    async getPendingSync() {
        return db.ventas
            .where('sync_status')
            .equals('pending')
            .toArray();
    },

    // Marcar venta como sincronizada
    async markAsSynced(localId, serverId) {
        const venta = await db.ventas.get(localId);
        if (!venta) return;

        venta.id = serverId;
        venta.sync_status = 'synced';
        venta.last_modified = new Date().toISOString();
        await db.ventas.put(venta);
    },
};
