# 📤 Comandos para Subir Carpetas al VPS

## 🎯 Carpetas a Subir

Basado en la estructura del proyecto, estas son las carpetas que necesitas subir:

### Carpetas Modificadas Recientemente:
- ✅ `_Pages/superadmin/usuarios/` - Eliminación total y términos y condiciones
- ✅ `_Pages/superadmin/empresas/` - Eliminación total

### Carpetas de Admin (Completas):
- 📁 `_Pages/admin/` - Todas las carpetas del módulo admin

### Carpetas Adicionales (si no están en el VPS):
- 📁 `utils/` - Utilidades (qzTrayService.js, imageUtils.js, escpos.js)
- 📁 `services/` - Servicios (imageService.js)
- 📁 `public/` - Archivos estáticos (certificates, images/productos)
- 📁 `app/` - Rutas de Next.js
- 📁 `_Pages/` - Componentes de páginas (completo o solo las modificadas)
- 📁 `_DB/` - Configuración de base de datos (si es necesario)

### Archivos en la Raíz:
- 📄 `package.json` y `package-lock.json` - Dependencias
- 📄 Archivos de configuración (next.config.mjs, jsconfig.json, eslint.config.mjs, etc.)

---

## 🚀 Comandos SCP (Copiar y Pegar)

### Opción 1: Carpetas Modificadas (Recomendado para Actualización)

```powershell
# 1. Subir carpeta USUARIOS (superadmin)
scp -r _Pages\superadmin\usuarios root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

# 2. Subir carpeta EMPRESAS (superadmin)
scp -r _Pages\superadmin\empresas root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/
```

### Opción 1B: Carpetas de ADMIN (Completas)

```powershell
# Subir TODA la carpeta admin (incluye todas las subcarpetas)
scp -r _Pages\admin root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/
```

### Opción 2: Carpetas Adicionales (Utils, Services, Public)

```powershell
# 3. Subir carpeta UTILS
scp -r utils root@72.62.128.63:/var/www/punto_de_venta_2025/

# 4. Subir carpeta SERVICES
scp -r services root@72.62.128.63:/var/www/punto_de_venta_2025/

# 5. Subir carpeta PUBLIC
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/

# 6. Subir archivos de configuración en la raíz
scp package.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp package-lock.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp next.config.mjs root@72.62.128.63:/var/www/punto_de_venta_2025/
scp jsconfig.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp eslint.config.mjs root@72.62.128.63:/var/www/punto_de_venta_2025/
```

### Opción 3: Subir Carpeta APP Completa (Rutas de Next.js)

```powershell
# 7. Subir carpeta APP (rutas de Next.js)
scp -r app root@72.62.128.63:/var/www/punto_de_venta_2025/
```

**Contraseña cuando se solicite:** `MEDICENELAMIGO082001a@`

---

## 📋 Todos los Comandos en Orden

### Paso 1: Carpetas Modificadas

```powershell
# Carpetas modificadas recientemente (superadmin)
scp -r _Pages\superadmin\usuarios root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/
scp -r _Pages\superadmin\empresas root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

# Carpeta admin completa (opcional - si necesitas subir todo el módulo admin)
scp -r _Pages\admin root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/
```

### Paso 2: Carpetas Adicionales

```powershell
# Carpetas de utilidades y servicios
scp -r utils root@72.62.128.63:/var/www/punto_de_venta_2025/
scp -r services root@72.62.128.63:/var/www/punto_de_venta_2025/
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/
```

### Paso 3: Archivos de Configuración

```powershell
# Archivos de configuración en la raíz
scp package.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp package-lock.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp next.config.mjs root@72.62.128.63:/var/www/punto_de_venta_2025/
scp jsconfig.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp eslint.config.mjs root@72.62.128.63:/var/www/punto_de_venta_2025/
```

### Paso 4: Carpeta APP (Rutas Next.js)

```powershell
# Carpeta app (rutas de Next.js)
scp -r app root@72.62.128.63:/var/www/punto_de_venta_2025/
```

---

## 🔄 Después de Subir: Conectarse al VPS y Hacer Build

```bash
# Conectarse al VPS
ssh root@72.62.128.63
# Contraseña: MEDICENELAMIGO082001a@

# Ir al proyecto
cd /var/www/punto_de_venta_2025

# Instalar dependencias (si hay cambios en package.json)
npm install

# Hacer build
npm run build

# Ver procesos PM2 (para encontrar el nombre correcto)
pm2 list
# o
pm2 status

# Reiniciar aplicación (nombre correcto del proceso)
pm2 restart punto-venta-2025

# Ver logs
pm2 logs punto-venta-2025 --lines 20

# Si no existe el proceso, iniciarlo:
pm2 start npm --name "punto-venta-2025" -- start
pm2 save
```

---

## ✅ Verificación

Después de subir, puedes verificar en el VPS:

```bash
# Verificar carpetas subidas
ls -la utils/
ls -la services/
ls -la public/
ls -la _Pages/superadmin/usuarios/
ls -la _Pages/superadmin/empresas/
ls -la app/

# Verificar archivos de configuración
ls -la package.json
ls -la next.config.mjs
```

---

## 📝 Información del VPS

- **IP:** `72.62.128.63`
- **Usuario:** `root`
- **Contraseña:** `MEDICENELAMIGO082001a@`
- **Ruta del Proyecto:** `/var/www/punto_de_venta_2025`

---

## 🎯 Resumen Rápido

**Para una actualización rápida (solo cambios):**
```powershell
# Carpetas modificadas de superadmin
scp -r _Pages\superadmin\usuarios root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/
scp -r _Pages\superadmin\empresas root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

# Carpeta admin completa (si necesitas actualizar el módulo admin)
scp -r _Pages\admin root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/
```

**Para una actualización completa (incluye utils, services, public, etc.):**
Ejecuta todos los comandos de las secciones "Paso 2", "Paso 3" y "Paso 4" arriba.

---

## 🆘 Si hay Errores

### Error: "Permission denied"

Asegúrate de escribir la contraseña correctamente:
- Contraseña: `MEDICENELAMIGO082001a@`

### Error: "No such file or directory"

Verifica que estás en el directorio correcto:
```powershell
# Verificar que estás en la raíz del proyecto
pwd
# Debe mostrar: C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd
```

### La carpeta no se sube completamente

Si hay problemas, intenta subir archivo por archivo:
```powershell
# Ejemplo: Subir solo un archivo de utils
scp utils\qzTrayService.js root@72.62.128.63:/var/www/punto_de_venta_2025/utils/
```
