# 🚀 Metodología Profesional: PWA Offline con Bluetooth

## 📋 Resumen Ejecutivo

Esta metodología transforma tu sistema POS actual en una **Progressive Web App (PWA) completamente funcional offline** con soporte para impresoras térmicas vía Bluetooth, manteniendo todas las funcionalidades del sistema actual.

### 🎯 Objetivos

1. ✅ **PWA Instalable** - Se puede instalar como app nativa
2. ✅ **Funcionamiento Offline Completo** - Sin conexión a internet
3. ✅ **Impresión Bluetooth** - Impresoras térmicas vía Bluetooth
4. ✅ **Sincronización Automática** - Cuando vuelve la conexión
5. ✅ **Misma Funcionalidad** - Inventario, Ventas, Catálogo, todo igual

---

## 🏗️ Arquitectura de la Solución

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    PWA OFFLINE-FIRST                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Service    │    │  IndexedDB   │    │   Bluetooth  │ │
│  │   Worker     │◄───┤   (Local)    │    │   Service    │ │
│  │  (Cache +    │    │              │    │  (Impresoras) │ │
│  │   Offline)   │    │  - Productos │    │              │ │
│  └──────────────┘    │  - Ventas    │    └──────────────┘ │
│         │            │  - Inventario│           │          │
│         │            │  - Clientes   │           │          │
│         │            │  - Pedidos    │           │          │
│         ▼            └──────────────┘           ▼          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Sync Manager (Sincronización)                │  │
│  │  - Queue de operaciones pendientes                    │  │
│  │  - Sincronización bidireccional                       │  │
│  │  - Resolución de conflictos                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         API Adapter (Online/Offline)                 │  │
│  │  - Detecta conexión                                 │  │
│  │  - Enruta a IndexedDB (offline) o API (online)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Backend API (MySQL) │
              │   (Cuando hay conexión)│
              └───────────────────────┘
```

---

## 📦 FASE 1 – Configuración Base PWA

### 1.1 Instalar Dependencias

```bash
npm install idb dexie workbox-window
npm install --save-dev @types/workbox-window
```

**Dependencias:**
- `idb` - Wrapper moderno para IndexedDB
- `dexie` - ORM para IndexedDB (opcional, pero recomendado)
- `workbox-window` - Herramientas de Workbox para Service Workers

### 1.2 Crear Manifest.json

**Ubicación:** `public/manifest.json`

```json
{
  "name": "Punto de Venta RD",
  "short_name": "POS RD",
  "description": "Sistema de punto de venta offline con impresión Bluetooth",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Nueva Venta",
      "short_name": "Venta",
      "description": "Crear nueva venta",
      "url": "/admin/ventas/nuevo",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Inventario",
      "short_name": "Inventario",
      "description": "Ver inventario",
      "url": "/admin/inventario",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [],
  "related_applications": [],
  "prefer_related_applications": false
}
```

### 1.3 Actualizar next.config.mjs

```javascript
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // ... tus configuraciones existentes
    ],
    domains: ['159.198.45.202', 'localhost'],
  },
  // Agregar headers para PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 1.4 Agregar Meta Tags en Layout

**Ubicación:** `app/layout.js`

```javascript
export const metadata = {
  // ... metadata existente
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POS RD',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};
```

---

## 🔧 FASE 2 – Service Worker (Cache y Offline)

### 2.1 Crear Service Worker

**Ubicación:** `public/sw.js`

```javascript
const CACHE_NAME = 'pos-rd-v1';
const RUNTIME_CACHE = 'pos-rd-runtime-v1';
const OFFLINE_URL = '/offline';

// Archivos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  // Agregar rutas críticas de tu app
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Estrategia: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests a APIs (se manejan con IndexedDB offline)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Estrategia Network First para páginas
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuesta exitosa
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: intentar desde cache
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Si no hay cache, mostrar página offline
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Estrategia Cache First para assets estáticos
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### 2.2 Registrar Service Worker

**Ubicación:** `app/layout.js` o crear `lib/registerSW.js`

```javascript
'use client';

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

export function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const wb = new Workbox('/sw.js');

      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          // Nueva versión disponible
          if (confirm('Nueva versión disponible. ¿Recargar?')) {
            wb.messageSkipWaiting();
          }
        }
      });

      wb.register();
    }
  }, []);
}
```

---

## 💾 FASE 3 – IndexedDB (Almacenamiento Local)

### 3.1 Configurar Dexie (ORM para IndexedDB)

**Ubicación:** `lib/db/indexedDB.js`

```javascript
import Dexie from 'dexie';

class POSDatabase extends Dexie {
  constructor() {
    super('POSDatabase');
    
    // Definir esquemas
    this.version(1).stores({
      productos: 'id, empresa_id, nombre, codigo_barras, activo',
      ventas: 'id, empresa_id, numero_interno, fecha_venta, estado, sync_status',
      detalle_ventas: 'id, venta_id, producto_id',
      clientes: 'id, empresa_id, nombre, documento',
      inventario: 'id, producto_id, tipo, fecha_movimiento',
      pedidos: 'id, empresa_id, numero_pedido, estado, sync_status',
      syncQueue: '++id, entity_type, entity_id, operation, data, timestamp',
      config: 'key',
    });
  }
}

export const db = new POSDatabase();
```

### 3.2 Crear Servicios de Datos

**Ubicación:** `lib/db/productosService.js`

```javascript
import { db } from './indexedDB';

export const productosService = {
  // Obtener todos los productos
  async getAll(empresaId) {
    return await db.productos
      .where('empresa_id')
      .equals(empresaId)
      .and((p) => p.activo === true)
      .toArray();
  },

  // Obtener por ID
  async getById(id) {
    return await db.productos.get(id);
  },

  // Buscar por código de barras
  async findByCodigo(codigo, empresaId) {
    return await db.productos
      .where('[empresa_id+codigo_barras]')
      .equals([empresaId, codigo])
      .first();
  },

  // Guardar producto (offline)
  async save(producto) {
    producto.sync_status = 'pending';
    producto.last_modified = new Date().toISOString();
    await db.productos.put(producto);
  },

  // Actualizar stock local
  async updateStock(productoId, cantidad, tipo) {
    const producto = await db.productos.get(productoId);
    if (!producto) return;

    if (tipo === 'entrada' || tipo === 'devolucion') {
      producto.stock = (producto.stock || 0) + cantidad;
    } else if (tipo === 'salida' || tipo === 'merma') {
      producto.stock = Math.max(0, (producto.stock || 0) - cantidad);
    } else if (tipo === 'ajuste') {
      producto.stock = cantidad;
    }

    producto.sync_status = 'pending';
    producto.last_modified = new Date().toISOString();
    await db.productos.put(producto);
  },
};
```

**Ubicación:** `lib/db/ventasService.js`

```javascript
import { db } from './indexedDB';

export const ventasService = {
  // Crear venta offline
  async create(ventaData) {
    const venta = {
      ...ventaData,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sync_status: 'pending',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    // Guardar venta
    await db.ventas.add(venta);

    // Guardar detalles
    if (ventaData.productos) {
      for (const producto of ventaData.productos) {
        await db.detalle_ventas.add({
          venta_id: venta.id,
          producto_id: producto.producto_id,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_unitario,
          subtotal: producto.subtotal,
        });
      }
    }

    // Agregar a cola de sincronización
    await db.syncQueue.add({
      entity_type: 'venta',
      entity_id: venta.id,
      operation: 'create',
      data: venta,
      timestamp: new Date().toISOString(),
    });

    return venta;
  },

  // Obtener ventas pendientes de sincronización
  async getPendingSync() {
    return await db.ventas
      .where('sync_status')
      .equals('pending')
      .toArray();
  },

  // Marcar como sincronizada
  async markAsSynced(localId, serverId) {
    const venta = await db.ventas.get(localId);
    if (venta) {
      venta.id = serverId;
      venta.sync_status = 'synced';
      venta.last_modified = new Date().toISOString();
      await db.ventas.put(venta);
    }
  },
};
```

---

## 📡 FASE 4 – Bluetooth Service (Impresoras Térmicas)

### 4.1 Crear Servicio Bluetooth

**Ubicación:** `lib/bluetooth/printerService.js`

```javascript
export class BluetoothPrinterService {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
  }

  // Solicitar dispositivo Bluetooth
  async requestDevice() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Serial Port Profile
        ],
        optionalServices: [
          '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
        ],
      });

      this.device = device;
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.onDisconnected();
      });

      return device;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error('No se encontró impresora Bluetooth');
      } else if (error.name === 'SecurityError') {
        throw new Error('Permiso Bluetooth denegado');
      } else {
        throw new Error(`Error Bluetooth: ${error.message}`);
      }
    }
  }

  // Conectar a dispositivo
  async connect() {
    if (!this.device) {
      throw new Error('Dispositivo no seleccionado');
    }

    try {
      this.server = await this.device.gatt.connect();
      
      // Buscar servicio Serial Port
      const service = await this.server.getPrimaryService(
        '000018f0-0000-1000-8000-00805f9b34fb'
      );

      // Buscar característica de escritura
      this.characteristic = await service.getCharacteristic(
        '00002af1-0000-1000-8000-00805f9b34fb'
      );

      this.isConnected = true;
      return true;
    } catch (error) {
      throw new Error(`Error conectando: ${error.message}`);
    }
  }

  // Desconectar
  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }

  // Enviar datos ESC/POS
  async print(data) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Impresora no conectada');
    }

    try {
      // Convertir string a ArrayBuffer
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);

      // Enviar en chunks de 20 bytes (límite BLE)
      const chunkSize = 20;
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        
        // Pequeña pausa entre chunks
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error imprimiendo: ${error.message}`);
    }
  }

  // Callback de desconexión
  onDisconnected() {
    console.log('Impresora desconectada');
    // Emitir evento o notificar a la app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bluetooth-disconnected'));
    }
  }

  // Verificar soporte Bluetooth
  static isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      'bluetooth' in navigator &&
      navigator.bluetooth !== undefined
    );
  }
}
```

### 4.2 Adaptar Generador ESC/POS

**Ubicación:** `lib/bluetooth/escposBluetooth.js`

```javascript
import { generarTicketESCPOS } from '@/utils/escpos';
import { BluetoothPrinterService } from './printerService';

export class BluetoothESCPOS {
  constructor() {
    this.printer = new BluetoothPrinterService();
  }

  // Imprimir ticket de venta
  async imprimirTicket(venta, empresa, anchoLinea = 32) {
    try {
      // Conectar si no está conectado
      if (!this.printer.isConnected) {
        await this.printer.requestDevice();
        await this.printer.connect();
      }

      // Generar comando ESC/POS
      const ticketData = generarTicketESCPOS(venta, empresa, anchoLinea);

      // Imprimir
      await this.printer.print(ticketData);

      return { success: true, message: 'Ticket impreso correctamente' };
    } catch (error) {
      throw error;
    }
  }

  // Desconectar
  async desconectar() {
    await this.printer.disconnect();
  }

  // Verificar si está conectado
  isConnected() {
    return this.printer.isConnected;
  }
}
```

---

## 🔄 FASE 5 – Sincronización de Datos

### 5.1 Crear Sync Manager

**Ubicación:** `lib/sync/syncManager.js`

```javascript
import { db } from '../db/indexedDB';
import { ventasService } from '../db/ventasService';
import { productosService } from '../db/productosService';

export class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Sincronizar datos pendientes
  async sync() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Sincronizar ventas
      await this.syncVentas();

      // Sincronizar inventario
      await this.syncInventario();

      // Sincronizar productos
      await this.syncProductos();

      console.log('Sincronización completada');
    } catch (error) {
      console.error('Error en sincronización:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sincronizar ventas
  async syncVentas() {
    const ventasPendientes = await ventasService.getPendingSync();

    for (const venta of ventasPendientes) {
      try {
        const response = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venta),
        });

        if (response.ok) {
          const data = await response.json();
          await ventasService.markAsSynced(venta.id, data.id);
          
          // Eliminar de cola de sincronización
          await db.syncQueue
            .where('[entity_type+entity_id]')
            .equals(['venta', venta.id])
            .delete();
        }
      } catch (error) {
        console.error(`Error sincronizando venta ${venta.id}:`, error);
      }
    }
  }

  // Sincronizar inventario
  async syncInventario() {
    const movimientosPendientes = await db.inventario
      .where('sync_status')
      .equals('pending')
      .toArray();

    for (const movimiento of movimientosPendientes) {
      try {
        const response = await fetch('/api/inventario/movimientos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movimiento),
        });

        if (response.ok) {
          movimiento.sync_status = 'synced';
          await db.inventario.put(movimiento);
        }
      } catch (error) {
        console.error(`Error sincronizando movimiento:`, error);
      }
    }
  }

  // Sincronizar productos
  async syncProductos() {
    const productosPendientes = await db.productos
      .where('sync_status')
      .equals('pending')
      .toArray();

    for (const producto of productosPendientes) {
      try {
        const response = await fetch(`/api/productos/${producto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(producto),
        });

        if (response.ok) {
          producto.sync_status = 'synced';
          await db.productos.put(producto);
        }
      } catch (error) {
        console.error(`Error sincronizando producto:`, error);
      }
    }
  }

  // Sincronización periódica
  startPeriodicSync(intervalMs = 30000) {
    setInterval(() => {
      if (this.isOnline) {
        this.sync();
      }
    }, intervalMs);
  }
}

export const syncManager = new SyncManager();
```

### 5.2 Crear API Adapter (Online/Offline)

**Ubicación:** `lib/api/apiAdapter.js`

```javascript
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
```

---

## 🎨 FASE 6 – Adaptar Componentes Existentes

### 6.1 Hook para Detectar Conexión

**Ubicación:** `lib/hooks/useOnline.js`

```javascript
'use client';

import { useState, useEffect } from 'react';

export function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 6.2 Componente de Estado Offline

**Ubicación:** `components/OfflineIndicator.js`

```javascript
'use client';

import { useOnline } from '@/lib/hooks/useOnline';

export function OfflineIndicator() {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
      <span>⚠️ Modo Offline - Los datos se sincronizarán cuando vuelva la conexión</span>
    </div>
  );
}
```

### 6.3 Adaptar Componente de Ventas

**Ejemplo:** Modificar `_Pages/admin/ventas/nueva/servidor.js` para usar APIAdapter

```javascript
import { apiAdapter } from '@/lib/api/apiAdapter';

export async function crearVenta(datosVenta) {
  // Usar APIAdapter en lugar de llamada directa
  try {
    const resultado = await apiAdapter.createVenta(datosVenta);
    return {
      success: true,
      venta: resultado,
      mensaje: 'Venta creada correctamente',
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || 'Error al crear venta',
    };
  }
}
```

---

## 📱 FASE 7 – Instalación PWA

### 7.1 Componente de Instalación

**Ubicación:** `components/InstallPWA.js`

```javascript
'use client';

import { useState, useEffect } from 'react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="mb-2">Instala la app para usar offline</p>
      <button
        onClick={handleInstall}
        className="bg-white text-blue-600 px-4 py-2 rounded font-semibold"
      >
        Instalar
      </button>
    </div>
  );
}
```

---

## 🧪 FASE 8 – Testing y Validación

### 8.1 Checklist de Funcionalidades

- [ ] PWA se puede instalar
- [ ] Funciona completamente offline
- [ ] Datos se guardan en IndexedDB
- [ ] Sincronización automática cuando vuelve conexión
- [ ] Impresora Bluetooth se conecta
- [ ] Tickets se imprimen correctamente
- [ ] Ventas se crean offline
- [ ] Inventario se actualiza offline
- [ ] Catálogo funciona offline
- [ ] Resolución de conflictos funciona

### 8.2 Testing de Bluetooth

```javascript
// Test de conexión Bluetooth
async function testBluetooth() {
  const printer = new BluetoothPrinterService();
  
  try {
    await printer.requestDevice();
    await printer.connect();
    console.log('✅ Bluetooth conectado');
    
    await printer.print('TEST\n\n');
    console.log('✅ Impresión exitosa');
    
    await printer.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

---

## 📊 FASE 9 – Optimizaciones y Mejoras

### 9.1 Compresión de Datos

```javascript
// Comprimir datos antes de guardar en IndexedDB
import pako from 'pako';

export function compressData(data) {
  const json = JSON.stringify(data);
  const compressed = pako.deflate(json);
  return compressed;
}

export function decompressData(compressed) {
  const decompressed = pako.inflate(compressed, { to: 'string' });
  return JSON.parse(decompressed);
}
```

### 9.2 Límites de Almacenamiento

```javascript
// Verificar espacio disponible
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage;
    const quota = estimate.quota;
    const percentage = (used / quota) * 100;
    
    console.log(`Usado: ${(used / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Disponible: ${((quota - used) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Porcentaje: ${percentage.toFixed(2)}%`);
    
    if (percentage > 80) {
      console.warn('⚠️ Almacenamiento casi lleno');
    }
  }
}
```

---

## 🚀 FASE 10 – Deployment

### 10.1 Build para PWA

```bash
npm run build
```

### 10.2 Verificar Service Worker

```bash
# Verificar que sw.js se genera correctamente
ls -la .next/static/
```

### 10.3 Testing en Producción

1. Probar instalación en diferentes dispositivos
2. Probar offline completo
3. Probar sincronización
4. Probar impresión Bluetooth

---

## 📝 Resumen de Archivos a Crear

```
punto_de_venta_rd/
├── public/
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service Worker
│   └── icons/                 # Iconos PWA
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       └── ...
├── lib/
│   ├── db/
│   │   ├── indexedDB.js       # Configuración Dexie
│   │   ├── productosService.js
│   │   └── ventasService.js
│   ├── bluetooth/
│   │   ├── printerService.js  # Servicio Bluetooth
│   │   └── escposBluetooth.js
│   ├── sync/
│   │   └── syncManager.js     # Gestor de sincronización
│   ├── api/
│   │   └── apiAdapter.js      # Adapter online/offline
│   └── hooks/
│       └── useOnline.js      # Hook de conexión
└── components/
    ├── OfflineIndicator.js
    └── InstallPWA.js
```

---

## ⚠️ Consideraciones Importantes

### Limitaciones de Bluetooth Web API

1. **Solo HTTPS** - Bluetooth requiere conexión segura
2. **Solo Chrome/Edge** - No funciona en Firefox/Safari
3. **Permisos** - Requiere interacción del usuario
4. **Dispositivos** - No todos los dispositivos Bluetooth son compatibles

### Alternativas si Bluetooth no funciona

1. **WebUSB** - Para impresoras USB
2. **Web Serial API** - Para impresoras seriales
3. **QZ Tray** - Mantener como fallback (requiere software)

---

## 🎯 Próximos Pasos

1. **Implementar FASE 1-2** (Base PWA)
2. **Implementar FASE 3** (IndexedDB)
3. **Implementar FASE 4** (Bluetooth)
4. **Implementar FASE 5** (Sincronización)
5. **Adaptar componentes** (FASE 6)
6. **Testing completo** (FASE 8)
7. **Deployment** (FASE 10)

---

**Última actualización:** 2025-01-05  
**Versión:** 1.0  
**Autor:** Metodología PWA Offline Profesional

