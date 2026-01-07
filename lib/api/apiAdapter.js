'use client';
import { db } from '../db/indexedDB';
import { ventasService } from '../db/ventasService';
import { productosService } from '../db/productosService';

export class APIAdapter {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Crear venta (online o offline)
    async createVenta(ventaData) {
        if (this.isOnline) {
            try {
                const response = await fetch('/api/ventas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ventaData),
                });

                if (response.ok) {
                    return await response.json();
                } else {
                    throw new Error('Error en servidor');
                }
            } catch (error) {
                // Si falla, guardar offline
                console.warn('Error online, guardando offline:', error);
                return await ventasService.create(ventaData);
            }
        } else {
            // Modo offline
            return await ventasService.create(ventaData);
        }
    }

    // Obtener productos
    async getProductos(empresaId) {
        if (this.isOnline) {
            try {
                const response = await fetch(`/api/productos?empresa_id=${empresaId}`);
                if (response.ok) {
                    const productos = await response.json();
                    // Actualizar IndexedDB
                    await this.updateLocalProductos(productos);
                    return productos;
                }
            } catch (error) {
                console.warn('Error online, usando cache local:', error);
            }
        }

        // Usar datos locales
        return await productosService.getAll(empresaId);
    }

    // Actualizar productos en local
    async updateLocalProductos(productos) {
        for (const producto of productos) {
            producto.sync_status = 'synced';
            await db.productos.put(producto);
        }
    }
}

export const apiAdapter = new APIAdapter();