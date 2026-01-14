import Dexie from 'dexie';

// ============================================
// BASE DE DATOS LOCAL - ISIWEEK POS
// ============================================

class ISIWEEKDatabase extends Dexie {
    constructor() {
        super('ISIWEEKDatabase');

        this.version(1).stores({
            // Tabla de productos
            productos: 'id, empresa_id, codigo_barras, nombre, categoria_id, activo, sync_status, last_modified, [empresa_id+codigo_barras]',

            // Tabla de ventas
            ventas: 'id, empresa_id, numero_interno, fecha_venta, estado, sync_status, created_offline, created_at, last_modified',

            // Tabla de detalle de ventas
            detalle_ventas: '++id, venta_id, producto_id, cantidad, precio_unitario',

            // Tabla de clientes
            clientes: 'id, empresa_id, nombre, documento, telefono, sync_status, last_modified',

            // Tabla de movimientos de inventario
            inventario: '++id, producto_id, tipo, cantidad, fecha_movimiento, sync_status',

            // Tabla de categorías
            categorias: 'id, empresa_id, nombre',

            // Tabla de marcas
            marcas: 'id, empresa_id, nombre',

            // Cola de sincronización
            sync_queue: '++id, entity_type, entity_id, operation, data, timestamp, status',

            // Configuración local
            config: 'key',
        });

        // Tablas accesibles
        this.productos = this.table('productos');
        this.ventas = this.table('ventas');
        this.detalle_ventas = this.table('detalle_ventas');
        this.clientes = this.table('clientes');
        this.inventario = this.table('inventario');
        this.categorias = this.table('categorias');
        this.marcas = this.table('marcas');
        this.sync_queue = this.table('sync_queue');
        this.config = this.table('config');
    }
}

// Crear instancia única de la base de datos
export const db = new ISIWEEKDatabase();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Verificar si la DB está lista
 */
export async function isDatabaseReady() {
    try {
        await db.open();
        return true;
    } catch (error) {
        console.error('Error abriendo IndexedDB:', error);
        return false;
    }
}

/**
 * Obtener estadísticas de almacenamiento
 */
export async function getStorageStats() {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
        return null;
    }

    const estimate = await navigator.storage.estimate();
    return {
        usage: estimate.usage,
        quota: estimate.quota,
        usageInMB: (estimate.usage / 1024 / 1024).toFixed(2),
        quotaInMB: (estimate.quota / 1024 / 1024).toFixed(2),
        percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2),
    };
}

/**
 * Limpiar base de datos (útil para testing)
 */
export async function clearDatabase() {
    try {
        await db.productos.clear();
        await db.ventas.clear();
        await db.detalle_ventas.clear();
        await db.clientes.clear();
        await db.inventario.clear();
        await db.categorias.clear();
        await db.marcas.clear();
        await db.sync_queue.clear();
        console.log('✅ Base de datos limpiada');
    } catch (error) {
        console.error('❌ Error limpiando base de datos:', error);
    }
}

/**
 * Exportar datos (para debugging)
 */
export async function exportDatabase() {
    const data = {
        productos: await db.productos.toArray(),
        ventas: await db.ventas.toArray(),
        detalle_ventas: await db.detalle_ventas.toArray(),
        clientes: await db.clientes.toArray(),
        inventario: await db.inventario.toArray(),
        categorias: await db.categorias.toArray(),
        marcas: await db.marcas.toArray(),
        sync_queue: await db.sync_queue.toArray(),
    };

    return data;
}

console.log('✅ LocalDB (Dexie) configurado');
