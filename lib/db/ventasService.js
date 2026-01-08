import { db } from './indexedDB';
import { productosService } from './productosService';

// ============================================
// SERVICIO DE VENTAS - ISIWEEK POS
// ============================================

export const ventasService = {
    /**
     * Crear venta offline
     */
    async create(ventaData) {
        try {
            // Generar ID temporal único
            const tempId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const venta = {
                ...ventaData,
                id: tempId,
                sync_status: 'pending',
                created_offline: true,
                created_at: new Date().toISOString(),
                last_modified: new Date().toISOString(),
            };

            // Guardar venta
            await db.ventas.add(venta);
            console.log('✅ Venta guardada offline:', tempId);

            // Guardar detalles de productos
            if (ventaData.productos && ventaData.productos.length > 0) {
                for (const producto of ventaData.productos) {
                    await db.detalle_ventas.add({
                        venta_id: tempId,
                        producto_id: producto.producto_id,
                        cantidad: producto.cantidad,
                        precio_unitario: producto.precio_unitario,
                        subtotal: producto.subtotal,
                        descuento: producto.descuento || 0,
                    });

                    // Actualizar stock del producto
                    await productosService.updateStock(
                        producto.producto_id,
                        producto.cantidad,
                        'salida'
                    );
                }
            }

            // Agregar a cola de sincronización
            await db.sync_queue.add({
                entity_type: 'venta',
                entity_id: tempId,
                operation: 'create',
                data: venta,
                timestamp: new Date().toISOString(),
                status: 'pending',
            });

            console.log('✅ Venta creada offline completa');
            return {
                success: true,
                venta: venta,
                offline: true,
            };
        } catch (error) {
            console.error('❌ Error creando venta offline:', error);
            throw error;
        }
    },

    /**
     * Obtener ventas de una empresa
     */
    async getByEmpresa(empresaId, limit = 100) {
        try {
            return await db.ventas
                .where('empresa_id')
                .equals(empresaId)
                .reverse()
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error obteniendo ventas:', error);
            return [];
        }
    },

    /**
     * Obtener venta por ID (con detalles)
     */
    async getById(ventaId) {
        try {
            const venta = await db.ventas.get(ventaId);

            if (!venta) {
                return null;
            }

            // Obtener detalles
            const detalles = await db.detalle_ventas
                .where('venta_id')
                .equals(ventaId)
                .toArray();

            // Enriquecer detalles con info de productos
            for (const detalle of detalles) {
                const producto = await productosService.getById(detalle.producto_id);
                detalle.producto_nombre = producto?.nombre || 'Desconocido';
                detalle.producto_codigo = producto?.codigo_barras || '';
            }

            return {
                ...venta,
                detalles: detalles,
            };
        } catch (error) {
            console.error('Error obteniendo venta:', error);
            return null;
        }
    },

    /**
     * Obtener ventas pendientes de sincronización
     */
    async getPendingSync() {
        try {
            return await db.ventas
                .where('sync_status')
                .equals('pending')
                .toArray();
        } catch (error) {
            console.error('Error obteniendo ventas pendientes:', error);
            return [];
        }
    },

    /**
     * Marcar venta como sincronizada
     */
    async markAsSynced(tempId, serverId) {
        try {
            const venta = await db.ventas.get(tempId);

            if (!venta) {
                console.warn('Venta no encontrada:', tempId);
                return;
            }

            // Actualizar venta
            venta.id = serverId;
            venta.sync_status = 'synced';
            venta.created_offline = false;
            venta.last_modified = new Date().toISOString();

            // Eliminar la venta temporal
            await db.ventas.delete(tempId);

            // Guardar con nuevo ID
            await db.ventas.put(venta);

            // Actualizar detalles
            const detalles = await db.detalle_ventas
                .where('venta_id')
                .equals(tempId)
                .toArray();

            for (const detalle of detalles) {
                detalle.venta_id = serverId;
                await db.detalle_ventas.put(detalle);
            }

            // Eliminar de cola de sincronización
            await db.sync_queue
                .where('entity_type')
                .equals('venta')
                .and((item) => item.entity_id === tempId)
                .delete();

            console.log('✅ Venta sincronizada:', tempId, '→', serverId);
        } catch (error) {
            console.error('Error marcando venta como sincronizada:', error);
        }
    },

    /**
     * Obtener ventas del día
     */
    async getVentasHoy(empresaId) {
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);

            return await db.ventas
                .where('empresa_id')
                .equals(empresaId)
                .and((venta) => {
                    const fecha = new Date(venta.fecha_venta);
                    return fecha >= hoy && fecha < mañana;
                })
                .toArray();
        } catch (error) {
            console.error('Error obteniendo ventas de hoy:', error);
            return [];
        }
    },
};
