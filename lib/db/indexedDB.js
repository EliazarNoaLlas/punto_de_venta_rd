import Dexie from 'dexie';

class POSDatabase extends Dexie {
    constructor() {
        super('POSDatabase');

        // Versiones y esquemas de IndexedDB
        this.version(1).stores({
            productos: 'id, empresa_id, nombre, codigo_barras, activo, [empresa_id+codigo_barras]',
            ventas: 'id, empresa_id, numero_interno, fecha_venta, estado, sync_status',
            detalle_ventas: 'id, venta_id, producto_id',
            clientes: 'id, empresa_id, nombre, documento',
            inventario: 'id, producto_id, tipo, fecha_movimiento',
            pedidos: 'id, empresa_id, numero_pedido, estado, sync_status',
            syncQueue: '++id, entity_type, entity_id, operation, data, timestamp',
            config: 'key',
        });

        // Tablas accesibles
        this.productos = this.table('productos');
        this.ventas = this.table('ventas');
        this.detalle_ventas = this.table('detalle_ventas');
        this.clientes = this.table('clientes');
        this.inventario = this.table('inventario');
        this.pedidos = this.table('pedidos');
        this.syncQueue = this.table('syncQueue');
        this.config = this.table('config');
    }
}

export const db = new POSDatabase();
