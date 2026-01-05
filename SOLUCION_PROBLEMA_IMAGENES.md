# 🔧 Solución: Problema con Imágenes de Productos (404 Error)

## 📋 Análisis del Problema

### Errores en la Consola

1. **Tracking Prevention / Preload Warnings** ⚠️
   - **No son críticos** - Son advertencias del navegador
   - No afectan la funcionalidad de la aplicación
   - Se pueden ignorar

2. **Error 404 en Imágenes** ❌
   - **Este es el problema real:**
   ```
   Failed to load resource: the server responded with a status of 404
   /images/productos/producto_199_1767501899724.jpeg
   ```

3. **Error de Extensión del Navegador** ⚠️
   - `content-all.js:1 Uncaught (in promise) Error: Could not establish connection`
   - Es de una extensión del navegador, no de tu aplicación
   - Se puede ignorar

---

## 🔍 Diagnóstico del Problema Real

### El Problema Principal

La URL `https://isiweek.com/images/productos/producto_199_1767501899724.jpeg` retorna **404**, lo que significa:

1. ✅ El código está buscando la imagen correctamente
2. ❌ El archivo físico **NO existe** en el servidor en la ruta:
   ```
   /var/www/punto_de_venta_2025/public/images/productos/producto_199_1767501899724.jpeg
   ```

### Causas Posibles

1. **La carpeta `public/images/productos` no existe en el VPS**
2. **Las imágenes locales no se subieron al VPS** (solo se sube código, no las imágenes existentes)
3. **Problemas de permisos** - El servidor no puede crear/escribir en la carpeta
4. **La carpeta `public` no se subió correctamente**

---

## ✅ Soluciones

### Solución 1: Verificar que la Carpeta Public se Subió

#### Paso 1: Verificar en el VPS

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Ir al proyecto
cd /var/www/punto_de_venta_2025

# Verificar que la carpeta public existe
ls -la public/

# Verificar que existe la carpeta de imágenes
ls -la public/images/
ls -la public/images/productos/
```

#### Paso 2: Si NO existe, crear la estructura

```bash
# Crear estructura de carpetas
mkdir -p public/images/productos
mkdir -p public/certificates

# Verificar permisos
chmod -R 755 public/
chown -R root:root public/
```

#### Paso 3: Subir la carpeta public (si no se subió)

Desde PowerShell en tu computadora:

```powershell
# Subir carpeta public completa
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/
```

---

### Solución 2: Verificar Permisos

Las imágenes se crean dinámicamente cuando se guardan productos. El servidor necesita permisos de escritura:

```bash
# En el VPS
cd /var/www/punto_de_venta_2025

# Dar permisos de lectura y escritura
chmod -R 755 public/images/productos
chown -R root:root public/images/productos

# Si PM2 corre con otro usuario, ajustar:
# chown -R www-data:www-data public/images/productos
# O el usuario que corre PM2
```

---

### Solución 3: Verificar que las Imágenes Locales se Suban

Las imágenes que ya existen localmente deben subirse manualmente:

#### Paso 1: Ver qué imágenes tienes localmente

```powershell
# Desde PowerShell (en tu computadora)
Get-ChildItem public\images\productos\
```

#### Paso 2: Subir las imágenes existentes

```powershell
# Subir carpeta de imágenes completa (incluye imágenes existentes)
scp -r public\images\productos root@72.62.128.63:/var/www/punto_de_venta_2025/public/images/
```

O subir archivo por archivo:

```powershell
# Ejemplo: Subir una imagen específica
scp public\images\productos\producto_199_1767471482127.jpeg root@72.62.128.63:/var/www/punto_de_venta_2025/public/images/productos/
```

---

### Solución 4: Verificar que el Servicio de Imágenes Funciona

El código usa `services/imageService.js` para guardar imágenes. Verificar:

#### En el VPS, verificar que el servicio existe:

```bash
# Verificar que el servicio existe
ls -la services/imageService.js

# Ver contenido (opcional)
cat services/imageService.js | head -30
```

#### Verificar logs de errores al guardar productos:

```bash
# Ver logs de PM2
pm2 logs punto-venta-2025 --err --lines 50

# Buscar errores relacionados con imágenes
pm2 logs punto-venta-2025 --err | grep -i "image\|imagen\|producto"
```

---

## 🔄 Proceso Completo de Verificación y Corrección

### Paso 1: Verificar Estructura en el VPS

```bash
ssh root@72.62.128.63
cd /var/www/punto_de_venta_2025

# Verificar estructura
ls -la public/images/productos/

# Si no existe, crear:
mkdir -p public/images/productos
chmod -R 755 public/images/productos
```

### Paso 2: Subir Carpeta Public (si faltan archivos)

```powershell
# Desde PowerShell (tu computadora)
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/
```

### Paso 3: Verificar Permisos

```bash
# En el VPS
cd /var/www/punto_de_venta_2025
chmod -R 755 public/images/productos
chown -R root:root public/images/productos
```

### Paso 4: Reiniciar Aplicación

```bash
# En el VPS
pm2 restart punto-venta-2025

# Ver logs
pm2 logs punto-venta-2025 --lines 20
```

### Paso 5: Probar Crear/Editar Producto

1. Ir a la aplicación en el navegador
2. Crear o editar un producto con imagen
3. Verificar que la imagen se guarda
4. Verificar que la imagen se muestra correctamente

---

## 📝 Verificación Final

### Verificar que las Imágenes se Pueden Crear

```bash
# En el VPS, crear un archivo de prueba
cd /var/www/punto_de_venta_2025/public/images/productos
touch test.txt
echo "test" > test.txt

# Si funciona, eliminar el archivo de prueba
rm test.txt
```

### Verificar Acceso desde el Navegador

1. Abre: `https://isiweek.com/images/productos/`
2. Deberías ver un listado de archivos (si el servidor lo permite)
3. O intenta acceder directamente: `https://isiweek.com/images/productos/producto_199_1767471482127.jpeg`

---

## 🚨 Problemas Comunes y Soluciones

### Error: "Permission denied"

```bash
# Dar permisos completos
chmod -R 777 public/images/productos
# O más seguro:
chmod -R 755 public/images/productos
chown -R www-data:www-data public/images/productos
```

### Error: "No such file or directory"

```bash
# Crear estructura completa
mkdir -p public/images/productos
mkdir -p public/certificates
```

### Las imágenes no se crean al guardar productos

1. Verificar logs: `pm2 logs punto-venta-2025 --err`
2. Verificar que `services/imageService.js` existe
3. Verificar permisos de escritura
4. Verificar que Next.js puede acceder al sistema de archivos

---

## 📊 Resumen de Comandos Rápidos

### Verificar y Corregir (Todo en Uno)

```bash
# En el VPS
cd /var/www/punto_de_venta_2025
mkdir -p public/images/productos
chmod -R 755 public/images/productos
chown -R root:root public/images/productos
pm2 restart punto-venta-2025
```

### Subir Carpeta Public (Desde PowerShell)

```powershell
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/
```

---

## ✅ Checklist de Verificación

- [ ] Carpeta `public/images/productos` existe en el VPS
- [ ] Permisos correctos (755 o 777)
- [ ] Carpeta `public` se subió al VPS
- [ ] Servicio `imageService.js` existe
- [ ] Aplicación reiniciada después de cambios
- [ ] Logs sin errores relacionados con imágenes
- [ ] Puedo crear archivos en `public/images/productos`
- [ ] Las imágenes se muestran en el navegador

---

## 📚 Información Adicional

### Cómo Funciona el Sistema de Imágenes

1. **Al crear/editar producto:**
   - La imagen se recibe como base64
   - `imageService.js` la convierte a archivo
   - Se guarda en `public/images/productos/`
   - Se retorna la ruta relativa: `/images/productos/producto_X_timestamp.ext`

2. **Al mostrar producto:**
   - Next.js sirve archivos estáticos de `public/`
   - La URL `/images/productos/archivo.jpg` se resuelve a `public/images/productos/archivo.jpg`

3. **Importante:**
   - Las imágenes NO están en Git (están en `.gitignore`)
   - Deben subirse manualmente o crearse en el servidor
   - Las imágenes nuevas se crean automáticamente al guardar productos

---

**Última actualización:** Solución problema 404 en imágenes  
**Proceso PM2:** `punto-venta-2025`

