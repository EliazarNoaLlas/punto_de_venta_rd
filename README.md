# Punto de Venta RD

Sistema de punto de venta desarrollado con Next.js (App Router + Pages legacy), MySQL y PM2.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Configuración

1. Crear archivo `.env.local` con las variables de entorno necesarias
2. Configurar base de datos MySQL (ver `GUIA_DESPLIEGUE_LOCAL.md`)
3. Ejecutar migraciones SQL desde `_DB/`

## 📦 CI/CD Automatizado

Este proyecto incluye un sistema de CI/CD completo con GitHub Actions.

### ⚡ Quick Start CI/CD

Para activar el deploy automático en 15 minutos, sigue: **[QUICK_START_CICD.md](./QUICK_START_CICD.md)**

### 📚 Documentación Completa

- **[METODOLOGIA_CICD_MEJORADA.md](./METODOLOGIA_CICD_MEJORADA.md)** - Guía completa de la metodología CI/CD
- **[QUICK_START_CICD.md](./QUICK_START_CICD.md)** - Setup rápido en 15 minutos

### Características del CI/CD

- ✅ Deploy automático con `git push`
- ✅ Sistema de releases (rollback fácil)
- ✅ Migraciones versionadas (no se repiten)
- ✅ Usuario dedicado para deploy (seguridad)
- ✅ Preservación de imágenes y uploads

## 🏗️ Estructura del Proyecto

```
├── app/              # Next.js App Router
├── _Pages/           # Pages legacy (compatibilidad)
├── _DB/              # Migraciones SQL
├── public/           # Archivos estáticos
├── services/         # Servicios de negocio
├── utils/            # Utilidades
└── deploy.sh         # Script de deploy (VPS)
```

## 📖 Documentación Adicional

- `GUIA_DESPLIEGUE_LOCAL.md` - Setup local completo
- `GUIA_DESPLIEGUE_MANUAL_VPS.md` - Deploy manual (legacy)
- `METODOLOGIA_CICD_MEJORADA.md` - Metodología CI/CD completa

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16.0.10
- **Base de Datos:** MySQL
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions
- **Hosting:** VPS (Hostinger)
- **PWA:** Offline con Bluetooth (en desarrollo)

## 📱 PWA Offline con Bluetooth

El sistema incluye soporte para PWA offline con impresión Bluetooth.

### ⚡ Quick Start PWA

Para implementar PWA offline rápidamente: **[QUICK_START_PWA.md](./QUICK_START_PWA.md)**

### 📚 Documentación Completa

- **[METODOLOGIA_PWA_OFFLINE_BLUETOOTH.md](./METODOLOGIA_PWA_OFFLINE_BLUETOOTH.md)** - Metodología completa de implementación
- **[RESUMEN_IMPLEMENTACION_PWA.md](./RESUMEN_IMPLEMENTACION_PWA.md)** - Resumen ejecutivo

### Características PWA

- ✅ Instalable como app nativa
- ✅ Funcionamiento offline completo
- ✅ Impresión Bluetooth (impresoras térmicas)
- ✅ Sincronización automática
- ✅ Todas las funcionalidades offline

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

## 🔒 Seguridad

- Variables de entorno en `.env` (no versionadas)
- Usuario MySQL dedicado para deploy
- Usuario VPS dedicado (no root)
- Migraciones versionadas y controladas

---

**Última actualización:** 2025-01-05
