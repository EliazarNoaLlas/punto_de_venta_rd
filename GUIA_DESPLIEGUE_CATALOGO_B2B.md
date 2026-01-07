# 📦 Guía de Despliegue: Catálogo B2B y Cambios Relacionados

## 🎯 Objetivo
Esta guía te permitirá subir e implementar **todos los cambios relacionados con el Catálogo B2B** al VPS de Hostinger de forma segura y ordenada.

---

## 📋 Información del VPS

- **IP:** `72.62.128.63`
- **Usuario:** `root`
- **Contraseña:** `MEDICENELAMIGO082001a@`
- **Ruta del Proyecto:** `/var/www/punto_de_venta_2025`
- **Puerto SSH:** `22`

---

## 📁 Archivos y Carpetas Incluidos en Este Despliegue

### 1. **Configuración del Catálogo (Admin)**
- `_Pages/admin/catalogo/catalogo.js` - Panel de configuración mejorado
- `_Pages/admin/catalogo/catalogo.module.css` - Estilos del panel
- `_Pages/admin/catalogo/servidor.js` - Server actions de configuración
- `_Pages/admin/catalogo/productos/servidor.js` - Server actions de productos

### 2. **Gestión de Pedidos Online (Admin)**
- `_Pages/admin/catalogo/pedidos/pedidos.js` - Dashboard de pedidos mejorado
- `_Pages/admin/catalogo/pedidos/pedidos.module.css` - Estilos del dashboard
- `_Pages/admin/catalogo/pedidos/servidor.js` - Server actions de pedidos
- `_Pages/admin/catalogo/pedidos/ver/[id]/ver.js` - Vista detalle de pedido
- `_Pages/admin/catalogo/pedidos/ver/[id]/ver.module.css` - Estilos detalle

### 3. **Navegación Admin**
- `_Pages/admin/header/header.js` - Header con botón "Pedidos" agregado

### 4. **Catálogo Público (Frontend)**
- `_Pages/public/catalogo/catalogo.js` - Componente principal del catálogo público
- `_Pages/public/catalogo/catalogo.module.css` - Estilos del catálogo público
- `_Pages/public/catalogo/checkout/checkout.js` - Componente de checkout
- `_Pages/public/catalogo/checkout/checkout.module.css` - Estilos de checkout

### 5. **API Routes Públicas**
- `app/api/catalogo/[slug]/config/route.js` - API configuración pública
- `app/api/catalogo/[slug]/productos/route.js` - API productos públicos
- `app/api/catalogo/[slug]/producto/[id]/route.js` - API detalle producto
- `app/api/catalogo/[slug]/pedido/route.js` - API crear pedido

### 6. **Rutas Admin**
- `app/(admin)/admin/catalogo/page.js` - Página configuración catálogo
- `app/(admin)/admin/catalogo/pedidos/page.js` - Página listado pedidos
- `app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js` - Página detalle pedido

### 7. **Rutas Públicas**
- `app/catalogo/[slug]/page.js` - Página pública del catálogo
- `app/catalogo/[slug]/checkout/page.js` - Página checkout público

### 8. **Base de Datos**
- `_DB/migracion_catalogo_b2b.sql` - Script de migración SQL (⚠️ IMPORTANTE)

---

## 🚀 Paso 1: Usar Script Automático (Recomendado)

### Ejecutar Script PowerShell

```powershell
# Desde la raíz del proyecto
cd C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd

# Ejecutar script
.\SUBIR_CATALOGO_B2B.ps1
```

El script:
- ✅ Sube todas las carpetas y archivos necesarios
- ✅ Crea las estructuras de carpetas necesarias en el VPS
- ✅ Muestra instrucciones de los siguientes pasos

**Nota:** Te pedirá la contraseña varias veces. Ingresa: `MEDICENELAMIGO082001a@`

---

## 📤 Paso 2: Método Manual (Si Prefieres)

### Opción A: Subir Carpetas Completas

```powershell
# 1. Catálogo Admin
scp -r _Pages\admin\catalogo root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/

# 2. Header Admin
scp _Pages\admin\header\header.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/header/

# 3. Catálogo Público
scp -r _Pages\public\catalogo root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/public/

# 4. API Routes
scp -r app\api\catalogo root@72.62.128.63:/var/www/punto_de_venta_2025/app/api/

# 5. Rutas Admin
scp -r app\(admin)\admin\catalogo root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/

# 6. Rutas Públicas
scp -r app\catalogo root@72.62.128.63:/var/www/punto_de_venta_2025/app/

# 7. Migración SQL
scp _DB\migracion_catalogo_b2b.sql root@72.62.128.63:/var/www/punto_de_venta_2025/_DB/
```

### Opción B: Subir Archivos Individuales (Más Control)

```powershell
# Catálogo Admin - Configuración
scp _Pages\admin\catalogo\catalogo.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/
scp _Pages\admin\catalogo\catalogo.module.css root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/
scp _Pages\admin\catalogo\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/

# Catálogo Admin - Productos
scp _Pages\admin\catalogo\productos\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/productos/

# Catálogo Admin - Pedidos
scp _Pages\admin\catalogo\pedidos\pedidos.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/pedidos/
scp _Pages\admin\catalogo\pedidos\pedidos.module.css root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/pedidos/
scp _Pages\admin\catalogo\pedidos\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/pedidos/

# Catálogo Admin - Ver Pedido
scp _Pages\admin\catalogo\pedidos\ver\[id]\ver.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/pedidos/ver/[id]/
scp _Pages\admin\catalogo\pedidos\ver\[id]\ver.module.css root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/catalogo/pedidos/ver/[id]/

# Header Admin
scp _Pages\admin\header\header.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/header/

# Catálogo Público
scp _Pages\public\catalogo\catalogo.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/public/catalogo/
scp _Pages\public\catalogo\catalogo.module.css root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/public/catalogo/
scp _Pages\public\catalogo\checkout\checkout.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/public/catalogo/checkout/
scp _Pages\public\catalogo\checkout\checkout.module.css root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/public/catalogo/checkout/

# API Routes
scp app\api\catalogo\[slug]\config\route.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/api/catalogo/[slug]/config/
scp app\api\catalogo\[slug]\productos\route.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/api/catalogo/[slug]/productos/
scp app\api\catalogo\[slug]\producto\[id]\route.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/api/catalogo/[slug]/producto/[id]/
scp app\api\catalogo\[slug]\pedido\route.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/api/catalogo/[slug]/pedido/

# Rutas Admin
scp app\(admin)\admin\catalogo\page.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/
scp app\(admin)\admin\catalogo\pedidos\page.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/
scp app\(admin)\admin\catalogo\pedidos\ver\[id]\page.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/

# Rutas Públicas
scp app\catalogo\[slug]\page.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/catalogo/[slug]/
scp app\catalogo\[slug]\checkout\page.js root@72.62.128.63:/var/www/punto_de_venta_2025/app/catalogo/[slug]/checkout/

# Migración SQL
scp _DB\migracion_catalogo_b2b.sql root@72.62.128.63:/var/www/punto_de_venta_2025/_DB/
```

---

## 🗄️ Paso 3: Ejecutar Migración SQL (⚠️ CRÍTICO - Solo Primera Vez)

### ⚠️ IMPORTANTE: Ejecutar ANTES del Build

**Esto crea las tablas necesarias en la base de datos:**

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Ir al proyecto
cd /var/www/punto_de_venta_2025

# Ejecutar migración SQL
# Reemplaza 'nombre_base_datos' con el nombre real de tu base de datos
mysql -u root -p punto_venta_rd < _DB/migracion_catalogo_b2b.sql
```

**O desde MySQL directamente:**

```bash
# Conectarse a MySQL
mysql -u root -p

# Seleccionar base de datos
USE punto_venta_rd;

# Ejecutar script
source /var/www/punto_de_venta_2025/_DB/migracion_catalogo_b2b.sql;

# Verificar que las tablas se crearon
SHOW TABLES LIKE 'catalogo%';
SHOW TABLES LIKE 'pedidos_online%';
```

**Tablas que se crearán:**
- ✅ `catalogo_config` - Configuración del catálogo por empresa
- ✅ `productos_catalogo` - Productos visibles en catálogo
- ✅ `pedidos_online` - Pedidos realizados desde catálogo público
- ✅ `pedidos_online_items` - Items de cada pedido

---

## 🔄 Paso 4: Verificar Archivos en el VPS

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Ir al proyecto
cd /var/www/punto_de_venta_2025

# Verificar estructura de carpetas
ls -la _Pages/admin/catalogo/
ls -la _Pages/admin/catalogo/pedidos/
ls -la _Pages/public/catalogo/
ls -la app/api/catalogo/
ls -la app/(admin)/admin/catalogo/

# Verificar archivos clave
cat _Pages/admin/catalogo/catalogo.js | head -20
cat app/api/catalogo/[slug]/config/route.js | head -20
```

---

## 🏗️ Paso 5: Instalar Dependencias y Hacer Build

```bash
# En el VPS
cd /var/www/punto_de_venta_2025

# 1. Instalar dependencias (si hay nuevas)
npm install

# 2. Hacer build de la aplicación
npm run build

# Verificar que el build fue exitoso
# Deberías ver: "✓ Compiled successfully"
# Si hay errores, revisa los mensajes de error
```

**Errores Comunes:**
- ❌ **"Module not found"** → Ejecutar `npm install` nuevamente
- ❌ **"Syntax error"** → Verificar que los archivos se subieron correctamente
- ❌ **"Database connection error"** → Verificar que la migración SQL se ejecutó

---

## 🔄 Paso 6: Reiniciar la Aplicación

```bash
# Reiniciar con PM2
pm2 restart punto-venta-2025

# Verificar estado
pm2 status

# Ver logs
pm2 logs punto-venta-2025 --lines 50

# Ver logs en tiempo real
pm2 logs punto-venta-2025
```

---

## ✅ Paso 7: Verificar que Todo Funciona

### 1. Verificar Estado de la Aplicación

```bash
# Ver estado de PM2
pm2 status

# Debe mostrar: "punto-venta-2025" como "online"

# Verificar puerto
netstat -tulpn | grep 3000
```

### 2. Probar Funcionalidades desde el Navegador

#### A. **Panel Admin - Configuración Catálogo**
1. Iniciar sesión como administrador
2. Ir a: `/admin/catalogo`
3. Verificar que:
   - ✅ Se ve el panel de configuración mejorado
   - ✅ Aparecen las estadísticas (Estado, Productos, Destacados)
   - ✅ Funciona el toggle de activar/desactivar catálogo
   - ✅ Se puede configurar nombre, descripción, URL
   - ✅ Funciona el botón "Guardar Cambios"
   - ✅ Funciona el botón "Vista Previa"

#### B. **Panel Admin - Pedidos Online**
1. En el header, hacer clic en "Pedidos"
2. Ir a: `/admin/catalogo/pedidos`
3. Verificar que:
   - ✅ Se muestra el dashboard de pedidos mejorado
   - ✅ Aparecen las estadísticas (Pendientes, En Proceso, Entregados)
   - ✅ Funciona la búsqueda de pedidos
   - ✅ Funcionan los filtros por estado
   - ✅ Se puede hacer clic en "Ver Detalle" de un pedido
   - ✅ Funciona el cambio de estado de pedidos

#### C. **Catálogo Público**
1. Crear/configurar un catálogo desde admin
2. Obtener la URL del catálogo (ej: `/catalogo/barra4vientos`)
3. Abrir la URL en una ventana de incógnito
4. Verificar que:
   - ✅ Se muestra el catálogo público
   - ✅ Se ven los productos visibles
   - ✅ Funciona la búsqueda
   - ✅ Funcionan los filtros por categoría
   - ✅ Se puede agregar productos al carrito
   - ✅ Funciona el checkout

#### D. **API Routes**
1. Probar API de configuración:
   ```
   GET /api/catalogo/[slug]/config
   ```
2. Probar API de productos:
   ```
   GET /api/catalogo/[slug]/productos
   ```
3. Verificar que retornan datos correctamente

---

## 🚨 Solución de Problemas

### Error: "Tabla no existe" o "Table doesn't exist"

**Causa:** No se ejecutó la migración SQL

**Solución:**
```bash
# Ejecutar migración SQL (ver Paso 3)
mysql -u root -p nombre_base_datos < _DB/migracion_catalogo_b2b.sql
```

---

### Error: "Cannot find module" o "Module not found"

**Causa:** Faltan dependencias o archivos no se subieron correctamente

**Solución:**
```bash
cd /var/www/punto_de_venta_2025
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart punto-venta-2025
```

---

### Error: "Route not found" o 404 en rutas nuevas

**Causa:** Las carpetas de rutas no se crearon correctamente

**Solución:**
```bash
# Verificar estructura de carpetas
ls -la app/(admin)/admin/catalogo/
ls -la app/catalogo/

# Si faltan, crear manualmente:
mkdir -p app/(admin)/admin/catalogo/pedidos/ver/[id]
mkdir -p app/catalogo/[slug]/checkout

# Volver a subir los archivos
```

---

### Error: "Permission denied" al subir archivos

**Solución:**
```bash
# En el VPS, verificar permisos
cd /var/www/punto_de_venta_2025
chown -R root:root /var/www/punto_de_venta_2025
chmod -R 755 /var/www/punto_de_venta_2025
```

---

### Error: Build falla con errores de sintaxis

**Solución:**
```bash
# Limpiar y reconstruir
cd /var/www/punto_de_venta_2025
rm -rf .next
npm run build

# Si persiste, verificar logs detallados
npm run build 2>&1 | tee build.log
```

---

### Error: La aplicación no inicia después del build

**Solución:**
```bash
# Ver logs detallados
pm2 logs punto-venta-2025 --err

# Eliminar y recrear proceso PM2
pm2 delete punto-venta-2025
pm2 start npm --name "punto-venta-2025" -- start
pm2 save
```

---

## 📋 Checklist de Despliegue

Usa esta lista para asegurarte de que todo está correcto:

- [ ] **Paso 1:** Archivos subidos al VPS (usando script o manualmente)
- [ ] **Paso 2:** Estructura de carpetas verificada en el VPS
- [ ] **Paso 3:** ✅ **Migración SQL ejecutada** (⚠️ CRÍTICO)
- [ ] **Paso 4:** Archivos verificados (comandos `ls` y `cat`)
- [ ] **Paso 5:** `npm install` ejecutado
- [ ] **Paso 5:** `npm run build` ejecutado exitosamente
- [ ] **Paso 6:** PM2 reiniciado
- [ ] **Paso 7:** Panel admin de catálogo funciona
- [ ] **Paso 7:** Dashboard de pedidos funciona
- [ ] **Paso 7:** Catálogo público funciona
- [ ] **Paso 7:** API routes responden correctamente
- [ ] **Paso 7:** Logs sin errores críticos

---

## 🔄 Proceso Rápido (Resumen)

### Desde PowerShell

```powershell
# Ejecutar script
.\SUBIR_CATALOGO_B2B.ps1
```

### En el VPS (SSH)

```bash
ssh root@72.62.128.63
cd /var/www/punto_de_venta_2025

# ⚠️ IMPORTANTE: Ejecutar migración SQL (solo primera vez)
mysql -u root -p nombre_base_datos < _DB/migracion_catalogo_b2b.sql

# Build y reinicio
npm install
npm run build
pm2 restart punto-venta-2025
pm2 logs punto-venta-2025 --lines 50
```

---

## 📊 Comandos Útiles de Verificación

```bash
# Verificar tablas creadas
mysql -u root -p -e "USE nombre_base_datos; SHOW TABLES LIKE 'catalogo%';"
mysql -u root -p -e "USE nombre_base_datos; SHOW TABLES LIKE 'pedidos_online%';"

# Verificar estructura de API routes
ls -R app/api/catalogo/

# Verificar rutas admin
ls -R app/(admin)/admin/catalogo/

# Verificar componentes
ls -R _Pages/admin/catalogo/
ls -R _Pages/public/catalogo/

# Ver logs de errores
pm2 logs punto-venta-2025 --err --lines 100

# Verificar que la app está corriendo
curl http://localhost:3000/api/health  # Si existe endpoint
```

---

## 📚 Archivos de Referencia

- **Script Automático:** `SUBIR_CATALOGO_B2B.ps1` (este despliegue)
- **Guía General:** `GUIA_DESPLIEGUE_MANUAL_VPS.md` (despliegue general)
- **Script General:** `SUBIR_CARPETAS_MODIFICADAS.ps1` (otros cambios)
- **Estado Implementación:** `IMPLEMENTACION_CATALOGO_B2B.md`

---

## 🎯 Resumen de Comandos Esenciales

### Subir Archivos (PowerShell)

```powershell
.\SUBIR_CATALOGO_B2B.ps1
```

### En el VPS (Bash)

```bash
# 1. Migración SQL (CRÍTICO - solo primera vez)
mysql -u root -p nombre_base_datos < _DB/migracion_catalogo_b2b.sql

# 2. Build y reinicio
cd /var/www/punto_de_venta_2025
npm install
npm run build
pm2 restart punto-venta-2025
pm2 logs punto-venta-2025
```

---

**Última actualización:** Despliegue completo del Catálogo B2B  
**Proceso PM2:** `punto-venta-2025`  
**Contraseña VPS:** `MEDICENELAMIGO082001a@`  
**IP VPS:** `72.62.128.63`

---

## ⚠️ NOTAS IMPORTANTES

1. **Migración SQL es CRÍTICA:** Sin ejecutar la migración, la aplicación fallará al intentar acceder a las nuevas tablas.

2. **Primera vez:** Si es la primera vez que despliegas el catálogo, ejecuta la migración SQL antes del build.

3. **Subsecuentes despliegues:** En despliegues futuros donde solo cambies código, NO necesitas ejecutar la migración SQL nuevamente.

4. **Backup:** Siempre es recomendable hacer backup de la base de datos antes de ejecutar migraciones:
   ```bash
   mysqldump -u root -p nombre_base_datos > backup_antes_catalogo_$(date +%Y%m%d_%H%M%S).sql
   ```

5. **Symlink de imágenes:** Si subes `public`, NO subas `public/images/productos` completo (usa symlink persistente - ver `GUIA_DESPLIEGUE_MANUAL_VPS.md`).

