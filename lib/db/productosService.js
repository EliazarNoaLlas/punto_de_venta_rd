import { db } from './indexedDB';

// ============================================
// SERVICIO DE PRODUCTOS - ISIWEEK POS
// ============================================

export const productosService = {
    /**
     * Obtener todos los productos de una empresa
     */
    async getAll(empresaId) {
        try {
            return await db.productos
                .where('empresa_id')
                .equals(empresaId)
                .and((p) => p.activo === true)
                .toArray();
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            return [];
        }
    },

    /**
     * Obtener producto por ID
     */
    async getById(id) {
        try {
            return await db.productos.get(id);
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            return null;
        }
    },

    /**
     * Buscar producto por código de barras
     */
    async findByCodigoBarras(codigo, empresaId) {
        try {
            return await db.productos
                .where('[empresa_id+codigo_barras]')
                .equals([empresaId, codigo])
                .first();
        } catch (error) {
            console.error('Error buscando producto:', error);
            return null;
        }
    },

    /**
     * Buscar productos por término (nombre o código)
     */
    async search(termino, empresaId) {
        try {
            const terminoLower = termino.toLowerCase();

            return await db.productos
                .where('empresa_id')
                .equals(empresaId)
                .and((p) => {
                    return (
                        p.activo === true &&
                        (p.nombre.toLowerCase().includes(terminoLower) ||
                            p.codigo_barras?.includes(termino))
                    );
                })
                .limit(20)
                .toArray();
        } catch (error) {
            console.error('Error buscando productos:', error);
            return [];
        }
    },

    /**
     * Guardar producto (crear o actualizar)
     */
    async save(producto) {
        try {
            producto.sync_status = 'pending';
            producto.last_modified = new Date().toISOString();

            await db.productos.put(producto);

            // Agregar a cola de sincronización
            await db.sync_queue.add({
                entity_type: 'producto',
                entity_id: producto.id,
                operation: 'upsert',
                data: producto,
                timestamp: new Date().toISOString(),
                status: 'pending',
            });

            console.log('✅ Producto guardado offline:', producto.id);
            return producto;
        } catch (error) {
            console.error('Error guardando producto:', error);
            throw error;
        }
    },

    /**
     * Actualizar stock de producto
     */
    async updateStock(productoId, cantidad, tipo) {
        try {
            const producto = await db.productos.get(productoId);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            const stockAnterior = producto.stock || 0;
            let nuevoStock = stockAnterior;

            switch (tipo) {
                case 'entrada':
                case 'devolucion':
                    nuevoStock = stockAnterior + cantidad;
                    break;
                case 'salida':
                case 'merma':
                    nuevoStock = Math.max(0, stockAnterior - cantidad);
                    break;
                case 'ajuste':
                    nuevoStock = cantidad;
                    break;
                default:
                    throw new Error('Tipo de movimiento no válido');
            }

            producto.stock = nuevoStock;
            producto.sync_status = 'pending';
            producto.last_modified = new Date().toISOString();

            await db.productos.put(producto);

            // Registrar movimiento
            await db.inventario.add({
                producto_id: productoId,
                tipo: tipo,
                cantidad: cantidad,
                stock_anterior: stockAnterior,
                stock_nuevo: nuevoStock,
                fecha_movimiento: new Date().toISOString(),
                sync_status: 'pending',
            });

            // Agregar a cola de sincronización
            await db.sync_queue.add({
                entity_type: 'inventario',
                entity_id: productoId,
                operation: 'update_stock',
                data: {
                    producto_id: productoId,
                    cantidad: cantidad,
                    tipo: tipo,
                    stock_nuevo: nuevoStock,
                },
                timestamp: new Date().toISOString(),
                status: 'pending',
            });

            console.log('✅ Stock actualizado offline:', productoId, nuevoStock);
            return producto;
        } catch (error) {
            console.error('Error actualizando stock:', error);
            throw error;
        }
    },

    /**
     * Sincronizar productos desde el servidor
     */
    async syncFromServer(productos) {
        try {
            for (const producto of productos) {
                producto.sync_status = 'synced';
                producto.last_modified = new Date().toISOString();
                await db.productos.put(producto);
            }

            console.log(`✅ ${productos.length} productos sincronizados desde servidor`);
        } catch (error) {
            console.error('Error sincronizando productos:', error);
        }
    },

    /**
     * Obtener productos pendientes de sincronización
     */
    async getPendingSync() {
        try {
            return await db.productos
                .where('sync_status')
                .equals('pending')
                .toArray();
        } catch (error) {
            console.error('Error obteniendo productos pendientes:', error);
            return [];
        }
    },
};
