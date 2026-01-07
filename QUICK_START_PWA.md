# ⚡ Quick Start - PWA Offline con Bluetooth

Guía rápida para implementar PWA en 30 minutos.

---

## 🎯 Paso 1: Instalar Dependencias (2 min)

```bash
npm install idb dexie workbox-window
```

---

## 🎯 Paso 2: Crear Estructura Base (5 min)

### 2.1 Actualizar package.json

Agregar scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### 2.2 Crear directorios

```bash
mkdir -p lib/db lib/bluetooth lib/sync lib/api lib/hooks components
```

---

## 🎯 Paso 3: Configurar Manifest (3 min)

El archivo `public/manifest.json` ya está creado. Solo necesitas:

1. **Generar iconos PWA** (usa herramientas online como https://realfavicongenerator.net/)
2. **Colocar iconos** en `public/icons/`

---

## 🎯 Paso 4: Service Worker Básico (5 min)

Crear `public/sw.js` (ver METODOLOGIA_PWA_OFFLINE_BLUETOOTH.md FASE 2)

---

## 🎯 Paso 5: IndexedDB Setup (5 min)

Crear `lib/db/indexedDB.js` (ver METODOLOGIA_PWA_OFFLINE_BLUETOOTH.md FASE 3.1)

---

## 🎯 Paso 6: Bluetooth Service (5 min)

Crear `lib/bluetooth/printerService.js` (ver METODOLOGIA_PWA_OFFLINE_BLUETOOTH.md FASE 4.1)

---

## 🎯 Paso 7: Registrar Service Worker (3 min)

En `app/layout.js`:

```javascript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🎯 Paso 8: Probar Instalación (2 min)

1. Build: `npm run build`
2. Start: `npm start`
3. Abrir en Chrome/Edge
4. Verificar que aparece botón "Instalar"

---

## ✅ Checklist Mínimo

- [ ] Dependencias instaladas
- [ ] Manifest.json creado
- [ ] Service Worker registrado
- [ ] IndexedDB configurado
- [ ] Bluetooth service creado
- [ ] App se puede instalar
- [ ] Funciona offline básico

---

## 📚 Siguiente Paso

Revisar **METODOLOGIA_PWA_OFFLINE_BLUETOOTH.md** para implementación completa.

