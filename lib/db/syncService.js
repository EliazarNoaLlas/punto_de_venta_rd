import { db } from './indexedDB';

export const syncService = {
    async enqueue(entityType, entityId, operation, data) {
        await db.syncQueue.add({
            entity_type: entityType,
            entity_id: entityId,
            operation,
            data,
            timestamp: new Date().toISOString(),
        });
    },

    async getQueue() {
        return db.syncQueue.toArray();
    },

    async clearItem(id) {
        await db.syncQueue.delete(id);
    },

    async clearAll() {
        await db.syncQueue.clear();
    },
};
