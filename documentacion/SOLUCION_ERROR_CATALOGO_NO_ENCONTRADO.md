# 🔍 Solución Error: "Catálogo no encontrado o inactivo"

## 📋 Análisis del Error

### Errores Observados

1. **Error 404 en la API:**
   ```
   Failed to load resource: the server responded with a status of 404
   /api/catalogo/barra-4-vientos/productos
   ```

2. **Mensajes en consola:**
   ```
   Error al cargar config: Catálogo no encontrado o inactivo
   Error al cargar productos: Catálogo no encontrado o inactivo
   ```

3. **Mensaje en la página:**
   ```
   Catálogo no encontrado
   El catálogo que buscas no existe o está inactivo.
   ```

### URL del Error

- **URL:** `https://isiweek.com/catalogo/barra-4-vientos`
- **Slug buscado:** `barra-4-vientos`

---

## 🎯 Causas del Problema

### Causa 1: El catálogo no existe en la base de datos ❌

La tabla `catalogo_config` no tiene un registro con `url_slug = 'barra-4-vientos'`.

### Causa 2: El catálogo está inactivo ❌

El catálogo existe pero tiene `activo = FALSE`.

### Causa 3: La empresa asociada está inactiva ❌

El catálogo está activo pero la empresa tiene `activo = FALSE` (la API también verifica esto).

### Causa 4: El slug no coincide exactamente ❌

El slug en la base de datos puede ser diferente (espacios, mayúsculas, guiones, etc.).

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar el Catálogo en la Base de Datos

Conectarse al servidor y verificar:

```bash
# Conectarse al servidor
ssh root@72.62.128.63

# Conectarse a MySQL
mysql -u root -p

# Seleccionar la base de datos (ajustar nombre)
USE punto_venta_rd;

# Verificar si el catálogo existe
SELECT 
    id,
    empresa_id,
    nombre_catalogo,
    url_slug,
    activo,
    fecha_creacion
FROM catalogo_config
WHERE url_slug LIKE '%barra%' OR url_slug LIKE '%vientos%';

# Verificar si existe exactamente con el slug
SELECT 
    id,
    empresa_id,
    nombre_catalogo,
    url_slug,
    activo,
    fecha_creacion
FROM catalogo_config
WHERE url_slug = 'barra-4-vientos';

# Ver todos los catálogos
SELECT 
    cc.id,
    cc.nombre_catalogo,
    cc.url_slug,
    cc.activo,
    e.nombre_empresa,
    e.activo as empresa_activa
FROM catalogo_config cc
LEFT JOIN empresas e ON cc.empresa_id = e.id;
```

### Paso 2: Verificar Estado de la Empresa

```sql
# Verificar empresa asociada
SELECT 
    e.id,
    e.nombre_empresa,
    e.activo,
    COUNT(cc.id) as catalogos_asociados
FROM empresas e
LEFT JOIN catalogo_config cc ON e.id = cc.empresa_id
WHERE e.nombre_empresa LIKE '%barra%' OR e.nombre_empresa LIKE '%vientos%'
GROUP BY e.id;
```

### Paso 3: Soluciones Según el Resultado

#### Solución A: El catálogo NO existe

**Crear el catálogo desde el panel de administración:**

1. Acceder a `https://isiweek.com/admin/catalogo`
2. Llenar el formulario con:
   - Nombre del catálogo
   - Descripción
   - URL Slug: `barra-4-vientos` (asegúrate que coincida exactamente)
   - Activar el catálogo (toggle "Publicar")
   - Guardar cambios

**O crear manualmente en la base de datos:**

```sql
# Primero obtener el empresa_id (ajustar según tu caso)
SELECT id, nombre_empresa FROM empresas WHERE nombre_empresa LIKE '%barra%' LIMIT 1;

# Supongamos que empresa_id = 2, crear el catálogo
INSERT INTO catalogo_config (
    empresa_id,
    nombre_catalogo,
    descripcion,
    url_slug,
    activo,
    color_primario,
    color_secundario,
    fecha_creacion,
    fecha_actualizacion
) VALUES (
    2,  -- Ajustar según el empresa_id real
    'Barra 4 vientos',
    'Catálogo online de Barra 4 vientos',
    'barra-4-vientos',
    TRUE,
    '#FF6B35',
    '#F7931E',
    NOW(),
    NOW()
);

# Verificar que se creó
SELECT * FROM catalogo_config WHERE url_slug = 'barra-4-vientos';
```

#### Solución B: El catálogo existe pero está inactivo

**Activar el catálogo:**

```sql
# Activar el catálogo
UPDATE catalogo_config 
SET activo = TRUE,
    fecha_actualizacion = NOW()
WHERE url_slug = 'barra-4-vientos';

# Verificar
SELECT url_slug, activo FROM catalogo_config WHERE url_slug = 'barra-4-vientos';
```

**O activarlo desde el panel de administración:**

1. Ir a `https://isiweek.com/admin/catalogo`
2. Buscar el catálogo "Barra 4 vientos"
3. Activar el toggle "Publicar"
4. Guardar cambios

#### Solución C: La empresa está inactiva

**Activar la empresa:**

```sql
# Verificar empresa asociada
SELECT 
    cc.id as catalogo_id,
    cc.url_slug,
    cc.activo as catalogo_activo,
    e.id as empresa_id,
    e.nombre_empresa,
    e.activo as empresa_activa
FROM catalogo_config cc
LEFT JOIN empresas e ON cc.empresa_id = e.id
WHERE cc.url_slug = 'barra-4-vientos';

# Activar la empresa si está inactiva
UPDATE empresas 
SET activo = TRUE,
    fecha_actualizacion = NOW()
WHERE id = (SELECT empresa_id FROM catalogo_config WHERE url_slug = 'barra-4-vientos');
```

#### Solución D: El slug no coincide

**Verificar slug exacto:**

```sql
# Ver todos los slugs similares
SELECT url_slug, nombre_catalogo 
FROM catalogo_config 
WHERE url_slug LIKE '%barra%' 
   OR url_slug LIKE '%vientos%'
   OR nombre_catalogo LIKE '%barra%';

# Actualizar el slug si es necesario
UPDATE catalogo_config 
SET url_slug = 'barra-4-vientos',
    fecha_actualizacion = NOW()
WHERE id = (SELECT id FROM catalogo_config WHERE nombre_catalogo LIKE '%barra%' LIMIT 1);
```

---

## 🔍 Verificación Completa (Script SQL)

Ejecuta este script completo para diagnosticar el problema:

```sql
-- 1. Verificar catálogo
SELECT 
    '=== CATALOGO ===' as seccion;

SELECT 
    cc.id,
    cc.empresa_id,
    cc.nombre_catalogo,
    cc.url_slug,
    cc.activo as catalogo_activo,
    cc.fecha_creacion,
    cc.fecha_actualizacion
FROM catalogo_config cc
WHERE cc.url_slug = 'barra-4-vientos'
   OR cc.url_slug LIKE '%barra%'
   OR cc.nombre_catalogo LIKE '%barra%';

-- 2. Verificar empresa asociada
SELECT 
    '=== EMPRESA ===' as seccion;

SELECT 
    e.id,
    e.nombre_empresa,
    e.nombre_comercial,
    e.activo as empresa_activa
FROM empresas e
WHERE e.id = (
    SELECT empresa_id 
    FROM catalogo_config 
    WHERE url_slug = 'barra-4-vientos'
    LIMIT 1
);

-- 3. Verificar productos asociados
SELECT 
    '=== PRODUCTOS EN CATALOGO ===' as seccion;

SELECT 
    COUNT(*) as total_productos,
    SUM(CASE WHEN pc.visible_catalogo = TRUE THEN 1 ELSE 0 END) as productos_visibles,
    SUM(CASE WHEN pc.visible_catalogo = TRUE AND pc.activo = TRUE THEN 1 ELSE 0 END) as productos_activos
FROM productos_catalogo pc
WHERE pc.empresa_id = (
    SELECT empresa_id 
    FROM catalogo_config 
    WHERE url_slug = 'barra-4-vientos'
    LIMIT 1
);
```

---

## 🛠️ Script de PowerShell para Verificación Remota

Copia y pega este script en PowerShell para verificar desde Windows:

```powershell
$VPS = "root@72.62.128.63"
$DB_NAME = "nombre_base_datos"  # AJUSTAR SEGÚN TU BASE DE DATOS
$DB_USER = "root"
$SLUG = "barra-4-vientos"

Write-Host "Verificando catálogo en el VPS..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Crear script SQL temporal
$sqlScript = @"
SELECT 
    cc.id,
    cc.empresa_id,
    cc.nombre_catalogo,
    cc.url_slug,
    cc.activo as catalogo_activo,
    e.nombre_empresa,
    e.activo as empresa_activa,
    CASE 
        WHEN cc.url_slug = '$SLUG' AND cc.activo = TRUE AND e.activo = TRUE THEN 'OK'
        WHEN cc.url_slug = '$SLUG' AND cc.activo = FALSE THEN 'CATALOGO_INACTIVO'
        WHEN cc.url_slug = '$SLUG' AND e.activo = FALSE THEN 'EMPRESA_INACTIVA'
        WHEN cc.url_slug = '$SLUG' THEN 'ENCONTRADO_PERO_ERROR'
        ELSE 'NO_ENCONTRADO'
    END as estado
FROM catalogo_config cc
LEFT JOIN empresas e ON cc.empresa_id = e.id
WHERE cc.url_slug = '$SLUG' 
   OR cc.url_slug LIKE '%barra%'
   OR cc.nombre_catalogo LIKE '%barra%';
"@

# Guardar script temporal
$tempFile = "temp_check_catalogo.sql"
$sqlScript | Out-File -FilePath $tempFile -Encoding UTF8

# Ejecutar en el VPS
Write-Host "Ejecutando consulta SQL..." -ForegroundColor Yellow
ssh $VPS "mysql -u $DB_USER -p $DB_NAME" < $tempFile

# Limpiar
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "========================================" -ForegroundColor Cyan
```

**Nota:** Te pedirá la contraseña de MySQL. También puedes crear un archivo `.my.cnf` con las credenciales.

---

## ✅ Solución Rápida (Si tienes acceso al panel admin)

1. **Acceder al panel de administración:**
   - URL: `https://isiweek.com/admin/catalogo`
   - Iniciar sesión como administrador

2. **Crear o editar el catálogo:**
   - Si no existe, hacer clic en "Crear Catálogo" o similar
   - Si existe, hacer clic para editarlo

3. **Verificar/Configurar:**
   - **Nombre del catálogo:** Barra 4 vientos
   - **URL Slug:** `barra-4-vientos` (debe coincidir EXACTAMENTE con la URL)
   - **Estado:** Activar el toggle "Publicar" o "Activo"
   - **Empresa:** Seleccionar "Barra 4 vientos"

4. **Guardar cambios**

5. **Verificar que funciona:**
   - Acceder a: `https://isiweek.com/catalogo/barra-4-vientos`
   - Debe cargar el catálogo correctamente

---

## 🔍 Verificar Logs de Next.js/PM2

Si después de crear/activar el catálogo sigue dando error:

```bash
# En el VPS
cd /var/www/punto_de_venta_2025

# Ver logs de errores relacionados con catálogo
pm2 logs punto-venta-2025 --lines 200 | grep -i "catalogo\|error\|404"

# Ver logs en tiempo real
pm2 logs punto-venta-2025 --lines 50
```

**Qué buscar en los logs:**
- Errores de conexión a la base de datos
- Errores de sintaxis SQL
- Errores 404 en las rutas API
- Errores de permisos

---

## 📋 Checklist de Verificación

Después de aplicar las soluciones, verifica:

- [ ] El catálogo existe en `catalogo_config` con `url_slug = 'barra-4-vientos'`
- [ ] El catálogo tiene `activo = TRUE`
- [ ] La empresa asociada tiene `activo = TRUE`
- [ ] El slug coincide EXACTAMENTE (sin espacios, mayúsculas correctas)
- [ ] La API responde correctamente: `curl https://isiweek.com/api/catalogo/barra-4-vientos/config`
- [ ] No hay errores en los logs de PM2
- [ ] Los productos están asociados al catálogo en `productos_catalogo`
- [ ] Al menos algunos productos tienen `visible_catalogo = TRUE`

---

## 🚨 Si Nada Funciona

### Verificar que las API routes estén subidas

```bash
# En el VPS
ls -la /var/www/punto_de_venta_2025/app/api/catalogo/\[slug\]/config/route.js
ls -la /var/www/punto_de_venta_2025/app/api/catalogo/\[slug\]/productos/route.js

# Si no existen, subirlos desde PowerShell:
```

```powershell
$VPS = "root@72.62.128.63"
scp 'app/api/catalogo/[slug]/config/route.js' "${VPS}:/var/www/punto_de_venta_2025/app/api/catalogo/[slug]/config/"
scp 'app/api/catalogo/[slug]/productos/route.js' "${VPS}:/var/www/punto_de_venta_2025/app/api/catalogo/[slug]/productos/"
```

### Rehacer build de Next.js

```bash
# En el VPS
cd /var/www/punto_de_venta_2025
npm run build
pm2 restart punto-venta-2025
```

### Verificar conexión a la base de datos

```sql
-- Verificar que la tabla existe
SHOW TABLES LIKE 'catalogo_config';

-- Ver estructura de la tabla
DESCRIBE catalogo_config;

-- Ver permisos
SHOW GRANTS;
```

---

## 📝 Notas Importantes

1. **El slug debe coincidir EXACTAMENTE:**
   - La URL usa: `barra-4-vientos`
   - La BD debe tener: `barra-4-vientos`
   - No debe haber diferencias en mayúsculas, espacios o caracteres especiales

2. **Tanto el catálogo como la empresa deben estar activos:**
   - La API verifica ambas condiciones
   - Si cualquiera está inactivo, dará 404

3. **Los productos también deben estar asociados:**
   - Aunque el catálogo exista, si no hay productos en `productos_catalogo`, no se mostrarán productos

4. **Revisar logs después de cambios:**
   - Siempre verificar los logs después de hacer cambios en la BD
   - Puede haber errores de caché que requieran reiniciar PM2

