import { db } from './indexedDB';

export const productosService = {
    // Obtener todos los productos activos de una empresa
    async getAll(empresaId) {
        return db.productos
            .where('empresa_id')
            .equals(empresaId)
            .and((p) => p.activo === true)
            .toArray();
    },

    // Obtener producto por ID
    async getById(id) {
        return db.productos.get(id);
    },

    // Buscar por código de barras
    async findByCodigo(codigo, empresaId) {
        return db.productos
            .where('[empresa_id+codigo_barras]')
            .equals([empresaId, codigo])
            .first();
    },

    // Guardar producto offline
    async save(producto) {
        producto.sync_status = 'pending';
        producto.last_modified = new Date().toISOString();
        await db.productos.put(producto);
    },

    // Actualizar stock local
    async updateStock(productoId, cantidad, tipo) {
        const producto = await db.productos.get(productoId);
        if (!producto) return;

        switch (tipo) {
            case 'entrada':
            case 'devolucion':
                producto.stock = (producto.stock || 0) + cantidad;
                break;
            case 'salida':
            case 'merma':
                producto.stock = Math.max(0, (producto.stock || 0) - cantidad);
                break;
            case 'ajuste':
                producto.stock = cantidad;
                break;
        }

        producto.sync_status = 'pending';
        producto.last_modified = new Date().toISOString();
        await db.productos.put(producto);
    },
};
