import { db } from './indexedDB';

// ============================================
// SERVICIO DE CLIENTES - ISIWEEK POS
// ============================================

export const clientesService = {
    /**
     * Obtener todos los clientes
     */
    async getAll(empresaId) {
        try {
            return await db.clientes
                .where('empresa_id')
                .equals(empresaId)
                .toArray();
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            return [];
        }
    },

    /**
     * Buscar clientes por término
     */
    async search(termino, empresaId) {
        try {
            const terminoLower = termino.toLowerCase();

            return await db.clientes
                .where('empresa_id')
                .equals(empresaId)
                .and((c) => {
                    return (
                        c.nombre.toLowerCase().includes(terminoLower) ||
                        c.documento?.includes(termino) ||
                        c.telefono?.includes(termino)
                    );
                })
                .limit(20)
                .toArray();
        } catch (error) {
            console.error('Error buscando clientes:', error);
            return [];
        }
    },

    /**
     * Guardar cliente
     */
    async save(cliente) {
        try {
            cliente.sync_status = 'pending';
            cliente.last_modified = new Date().toISOString();

            await db.clientes.put(cliente);

            // Agregar a cola de sincronización
            await db.sync_queue.add({
                entity_type: 'cliente',
                entity_id: cliente.id,
                operation: 'upsert',
                data: cliente,
                timestamp: new Date().toISOString(),
                status: 'pending',
            });

            console.log('✅ Cliente guardado offline:', cliente.id);
            return cliente;
        } catch (error) {
            console.error('Error guardando cliente:', error);
            throw error;
        }
    },

    /**
     * Sincronizar clientes desde el servidor
     */
    async syncFromServer(clientes) {
        try {
            for (const cliente of clientes) {
                cliente.sync_status = 'synced';
                cliente.last_modified = new Date().toISOString();
                await db.clientes.put(cliente);
            }

            console.log(`✅ ${clientes.length} clientes sincronizados desde servidor`);
        } catch (error) {
            console.error('Error sincronizando clientes:', error);
        }
    },
};
