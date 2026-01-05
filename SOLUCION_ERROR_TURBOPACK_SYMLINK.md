# 🔥 Solución: Error Turbopack con Symlink en public/

## 🚨 Error Crítico

```
Symlink public/images/productos/producto_199_1767541526943.jpeg is invalid, 
it points out of the filesystem root

TurbopackInternalError: Failed to write app endpoint /_not-found/page
```

## 🧠 Causa del Problema

**Next.js 16 usa Turbopack en `next build`**

Turbopack tiene una regla estricta de seguridad:
- ❌ **NO permite symlinks dentro de `public/` que apunten fuera del proyecto**

El symlink actual:
```
public/images/productos -> /var/data/pdv_images/productos
```

Apunta **FUERA** de `/var/www/punto_de_venta_2025`, por lo que Turbopack aborta el build por seguridad.

---

## ✅ Solución Recomendada (Profesional)

**NO usar symlinks en `public/`**
**Servir imágenes SOLO por NGINX**

### Paso 1: Eliminar el Symlink

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Ir al directorio del proyecto
cd /var/www/punto_de_venta_2025

# Eliminar el symlink (NO borra las imágenes reales)
rm public/images/productos

# Verificar que se eliminó
ls -la public/images/
# Debe mostrar: (sin carpeta productos o productos no existe)
```

**⚠️ IMPORTANTE:** Este comando solo elimina el symlink, **NO borra las imágenes reales** en `/var/data/pdv_images/productos/`

### Paso 2: Verificar que NGINX está Configurado Correctamente

El NGINX ya está configurado correctamente en `/etc/nginx/sites-available/punto-venta-2025`:

```nginx
location /images/productos/ {
    alias /var/data/pdv_images/productos/;
    autoindex off;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    access_log off;
}
```

✅ **Esto está correcto, no necesitas cambiarlo.**

### Paso 3: Verificar imageService.js

El código debe usar URLs absolutas, NO rutas relativas a `public/`:

```javascript
// ✅ CORRECTO
export function obtenerUrlValida(imagenUrl) {
    if (!imagenUrl) return null
    
    // Si ya es una URL completa (http/https), devolverla
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
        return imagenUrl
    }
    
    // Si es una ruta relativa, convertirla a URL absoluta
    if (imagenUrl.startsWith('/images/')) {
        return `https://isiweek.com${imagenUrl}`
    }
    
    // Fallback: asumir que es un nombre de archivo
    return `https://isiweek.com/images/productos/${imagenUrl}`
}
```

**❌ NO hacer:**
```javascript
// ❌ INCORRECTO
return `/public/images/productos/${filename}`
```

### Paso 4: Re-hacer el Build

```bash
# Asegurarse de estar en el directorio correcto
cd /var/www/punto_de_venta_2025

# Limpiar build anterior (opcional pero recomendado)
rm -rf .next

# Hacer build
npm run build
```

**Resultado esperado:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### Paso 5: Reiniciar PM2

```bash
pm2 restart punto-venta-2025
pm2 logs punto-venta-2025 --lines 20
```

---

## 📋 Comandos Rápidos (Copy & Paste)

### Eliminar Symlink y Hacer Build

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Todo en uno
cd /var/www/punto_de_venta_2025 && \
rm public/images/productos && \
rm -rf .next && \
npm run build && \
pm2 restart punto-venta-2025 && \
pm2 logs punto-venta-2025 --lines 20
```

---

## ✅ Verificación Post-Solución

### 1. Verificar que el Symlink fue Eliminado

```bash
ls -la public/images/
# NO debe existir: productos -> /var/data/pdv_images/productos
```

### 2. Verificar que las Imágenes Siguen Funcionando

1. Abre el navegador
2. Ve a: `https://isiweek.com/admin/productos`
3. Verifica que las imágenes se muestran correctamente
4. Abre DevTools → Network → Filtra por "images"
5. Verifica que las URLs sean: `https://isiweek.com/images/productos/...`

### 3. Verificar el Build

```bash
# El build debe completarse sin errores
npm run build
# ✅ Debe mostrar: Compiled successfully
```

---

## 🧠 Por Qué Funciona Esta Solución

### Antes (Con Symlink)

```
public/images/productos -> /var/data/pdv_images/productos (symlink)
```

- ❌ Turbopack detecta symlink fuera del proyecto
- ❌ Aborta el build por seguridad
- ✅ Las imágenes funcionan en runtime (NGINX sirve directamente)

### Después (Sin Symlink)

```
public/images/productos -> NO EXISTE
/var/data/pdv_images/productos -> Carpeta real (fuera del proyecto)
```

- ✅ Turbopack no encuentra symlinks problemáticos
- ✅ Build se completa exitosamente
- ✅ Las imágenes funcionan en runtime (NGINX sirve directamente desde `/var/data/pdv_images/productos`)

**Flujo correcto:**
1. Next.js hace build sin problemas (no hay symlinks en `public/`)
2. NGINX sirve imágenes directamente desde `/var/data/pdv_images/productos`
3. Las URLs en el código apuntan a `https://isiweek.com/images/productos/...`
4. NGINX intercepta `/images/productos/` y sirve desde `/var/data/pdv_images/productos/`

---

## ⚠️ Notas Importantes

1. **NO elimines la carpeta real:** `/var/data/pdv_images/productos/` debe seguir existiendo
2. **NGINX ya está configurado:** No necesitas cambiar la configuración de NGINX
3. **Las imágenes siguen funcionando:** NGINX las sirve directamente, no necesitas el symlink
4. **El código debe usar URLs absolutas:** Ya debería estar así, pero verifica

---

## 🐛 Si el Problema Persiste

### Error: "Cannot find module" o errores de importación

```bash
# Limpiar y reinstalar
cd /var/www/punto_de_venta_2025
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Error: "Images not loading"

1. Verifica que NGINX está corriendo:
   ```bash
   systemctl status nginx
   ```

2. Verifica la configuración de NGINX:
   ```bash
   nginx -t
   ```

3. Recarga NGINX:
   ```bash
   systemctl reload nginx
   ```

---

## 🎯 Resumen

1. ✅ Eliminar symlink: `rm public/images/productos`
2. ✅ NGINX ya está configurado correctamente (no cambiar)
3. ✅ El código debe usar URLs absolutas (ya debería estar así)
4. ✅ Re-hacer build: `npm run build`
5. ✅ Reiniciar PM2: `pm2 restart punto-venta-2025`

**Tiempo estimado:** 2-3 minutos

---

**Última actualización:** Solución error Turbopack symlink  
**Estado:** Listo para ejecutar

