import { productosService } from '../db/productosService';
import { ventasService } from '../db/ventasService';
import { clientesService } from '../db/clientesService';

// ============================================
// API ADAPTER - ISIWEEK POS
// Decide automáticamente entre API o IndexedDB
// ============================================

class APIAdapter {
    constructor() {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
        this.setupListeners();
    }

    setupListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.isOnline = true;
                console.log('🟢 Conexión restaurada');
                this.onReconnect();
            });

            window.addEventListener('offline', () => {
                this.isOnline = false;
                console.log('🔴 Sin conexión - Modo offline');
            });
        }
    }

    onReconnect() {
        // Trigger sincronización
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('network-reconnect'));
        }
    }

    // ==========================================
    // PRODUCTOS
    // ==========================================

    async getProductos(empresaId) {
        if (this.isOnline) {
            try {
                const response = await fetch(`/api/productos?empresa_id=${empresaId}`, {
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                });

                if (response.ok) {
                    const productos = await response.json();

                    // Actualizar IndexedDB en background
                    await productosService.syncFromServer(productos);

                    return {
                        data: productos,
                        source: 'server',
                        offline: false,
                    };
                }
            } catch (error) {
                console.warn('Error desde servidor, usando datos locales:', error);
            }
        }

        // Usar datos locales
        const productos = await productosService.getAll(empresaId);
        return {
            data: productos,
            source: 'local',
            offline: true,
        };
    }

    async getProductoById(id) {
        if (this.isOnline) {
            try {
                const response = await fetch(`/api/productos/${id}`);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn('Error desde servidor:', error);
            }
        }

        return await productosService.getById(id);
    }

    async searchProductos(termino, empresaId) {
        // Búsqueda siempre local (más rápido)
        return await productosService.search(termino, empresaId);
    }

    // ==========================================
    // VENTAS
    // ==========================================

    async createVenta(ventaData) {
        if (this.isOnline) {
            try {
                const response = await fetch('/api/ventas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ventaData),
                });

                if (response.ok) {
                    const result = await response.json();
                    return {
                        ...result,
                        offline: false,
                        source: 'server',
                    };
                }
            } catch (error) {
                console.warn('Error creando venta en servidor, guardando offline:', error);
            }
        }

        // Crear offline
        const result = await ventasService.create(ventaData);
        return {
            ...result,
            offline: true,
            source: 'local',
            message: 'Venta guardada offline - Se sincronizará automáticamente',
        };
    }

    async getVentas(empresaId, limit = 100) {
        if (this.isOnline) {
            try {
                const response = await fetch(
                    `/api/ventas?empresa_id=${empresaId}&limit=${limit}`
                );

                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn('Error obteniendo ventas del servidor:', error);
            }
        }

        return await ventasService.getByEmpresa(empresaId, limit);
    }

    async getVentaById(ventaId) {
        // Intentar local primero (más rápido)
        const localVenta = await ventasService.getById(ventaId);

        if (localVenta) {
            return localVenta;
        }

        // Si no está local y hay internet, intentar servidor
        if (this.isOnline) {
            try {
                const response = await fetch(`/api/ventas/${ventaId}`);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn('Error obteniendo venta del servidor:', error);
            }
        }

        return null;
    }

    // ==========================================
    // CLIENTES
    // ==========================================

    async getClientes(empresaId) {
        if (this.isOnline) {
            try {
                const response = await fetch(`/api/clientes?empresa_id=${empresaId}`);

                if (response.ok) {
                    const clientes = await response.json();
                    await clientesService.syncFromServer(clientes);
                    return clientes;
                }
            } catch (error) {
                console.warn('Error obteniendo clientes del servidor:', error);
            }
        }

        return await clientesService.getAll(empresaId);
    }

    async searchClientes(termino, empresaId) {
        return await clientesService.search(termino, empresaId);
    }

    async saveCliente(cliente) {
        if (this.isOnline) {
            try {
                const response = await fetch('/api/clientes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cliente),
                });

                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn('Error guardando cliente en servidor:', error);
            }
        }

        return await clientesService.save(cliente);
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    getConnectionStatus() {
        return {
            online: this.isOnline,
            type: this.isOnline ? 'server' : 'local',
        };
    }
}

// Exportar instancia única
export const apiAdapter = new APIAdapter();