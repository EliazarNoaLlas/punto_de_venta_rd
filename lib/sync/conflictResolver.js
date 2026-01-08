import { db } from '../db/indexedDB';

// ============================================
// CONFLICT RESOLVER - ISIWEEK POS
// Maneja conflictos de sincronización
// ============================================

export class ConflictResolver {
    /**
     * Resolver conflicto de producto
     * Estrategia: Servidor gana (Last-Write-Wins en servidor)
     */
    async resolveProductoConflict(localProducto, serverProducto) {
        console.warn('⚠️ Conflicto detectado en producto:', localProducto.id);

        // Comparar timestamps
        const localTime = new Date(localProducto.last_modified).getTime();
        const serverTime = new Date(serverProducto.last_modified).getTime();

        if (serverTime > localTime) {
            // Servidor es más reciente - usar datos del servidor
            console.log('✅ Usando datos del servidor (más reciente)');

            serverProducto.sync_status = 'synced';
            await db.productos.put(serverProducto);

            return { resolution: 'server-wins', producto: serverProducto };
        } else {
            // Local es más reciente - mantener local y forzar resincronización
            console.log('✅ Manteniendo datos locales (más reciente)');

            localProducto.sync_status = 'pending';
            await db.productos.put(localProducto);

            return { resolution: 'local-wins', producto: localProducto };
        }
    }

    /**
     * Resolver conflicto de stock
     * Estrategia: Sumar diferencias (conservador)
     */
    async resolveStockConflict(productoId, localStock, serverStock) {
        console.warn(`⚠️ Conflicto de stock en producto ${productoId}`);
        console.log(`Local: ${localStock}, Servidor: ${serverStock}`);

        // Calcular diferencia
        const diferencia = localStock - serverStock;

        if (Math.abs(diferencia) > 0) {
            // Hay diferencia - notificar para revisión manual
            await db.sync_queue.add({
                entity_type: 'stock_conflict',
                entity_id: productoId,
                operation: 'review',
                data: {
                    producto_id: productoId,
                    local_stock: localStock,
                    server_stock: serverStock,
                    diferencia: diferencia,
                },
                timestamp: new Date().toISOString(),
                status: 'pending_review',
            });

            // Usar stock del servidor (conservador)
            return {
                resolution: 'server-stock',
                stock: serverStock,
                requiresReview: true,
            };
        }

        return {
            resolution: 'no-conflict',
            stock: serverStock,
        };
    }

    /**
     * Detectar ventas duplicadas
     */
    async detectDuplicateVenta(ventaData) {
        // Buscar ventas similares en un rango de tiempo
        const ventaTime = new Date(ventaData.fecha_venta).getTime();
        const timeWindow = 60 * 1000; // 1 minuto

        const similarVentas = await db.ventas
            .where('empresa_id')
            .equals(ventaData.empresa_id)
            .and((v) => {
                const vTime = new Date(v.fecha_venta).getTime();
                return (
                    Math.abs(vTime - ventaTime) < timeWindow &&
                    Math.abs(v.total - ventaData.total) < 0.01 // Mismo total
                );
            })
            .toArray();

        if (similarVentas.length > 0) {
            console.warn('⚠️ Posible venta duplicada detectada');
            return {
                isDuplicate: true,
                similarVentas: similarVentas,
            };
        }

        return { isDuplicate: false };
    }
}

export const conflictResolver = new ConflictResolver();
