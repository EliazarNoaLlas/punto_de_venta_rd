# 🔗 Configuración de Symlink para Imágenes (Producción)

## ❌ Problema Actual

Cuando subes la carpeta `public` completa, borras todas las imágenes que se guardaron dinámicamente:

```powershell
scp -r public root@server:/var/www/punto_de_venta_2025/
# ❌ Esto BORRA: public/images/productos/* (todas las imágenes dinámicas)
```

## ✅ Solución Profesional: Symlink

Usar un **symlink** para que las imágenes se guarden en una carpeta persistente fuera del proyecto.

---

## 🏗️ Arquitectura Final (Correcta)

```
/var/www/punto_de_venta_2025/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
│       └── productos  ->  /var/data/pdv_images/productos  (SYMLINK)
│
├── services/
├── utils/
├── _Pages/
└── .next/

/var/data/pdv_images/          (CARPETA PERSISTENTE)
└── productos/
    ├── producto_1_1706284800000.jpg
    ├── producto_2_1706285000000.webp
    └── ...
```

**Ventajas:**
- ✅ Next.js sirve `/images/productos/...` normalmente
- ✅ El deploy NO toca las imágenes dinámicas
- ✅ Las imágenes persisten entre deploys
- ✅ No necesitas cambiar tu código

---

## 🛠️ Configuración en el VPS (Una Sola Vez)

### Paso 1: Crear Carpeta Persistente

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Crear carpeta persistente para imágenes
mkdir -p /var/data/pdv_images/productos

# Dar permisos correctos
chmod -R 755 /var/data/pdv_images
chown -R root:root /var/data/pdv_images
```

### Paso 2: Eliminar Carpeta Actual (si existe)

```bash
cd /var/www/punto_de_venta_2025

# Eliminar carpeta actual de imágenes (si existe)
rm -rf public/images/productos
```

### Paso 3: Crear el Symlink

```bash
# Crear symlink desde public/images/productos hacia carpeta persistente
ln -s /var/data/pdv_images/productos public/images/productos
```

### Paso 4: Verificar el Symlink

```bash
# Verificar que el symlink se creó correctamente
ls -l public/images/
# Debe mostrar: productos -> /var/data/pdv_images/productos
```

---

## 📋 Comandos Completos (Copiar y Pegar)

```bash
# Configuración completa (una sola vez)
ssh root@72.62.128.63
cd /var/www/punto_de_venta_2025

# Crear carpeta persistente
mkdir -p /var/data/pdv_images/productos
chmod -R 755 /var/data/pdv_images
chown -R root:root /var/data/pdv_images

# Eliminar carpeta actual (si existe)
rm -rf public/images/productos

# Crear symlink
ln -s /var/data/pdv_images/productos public/images/productos

# Verificar
ls -l public/images/
# Debe mostrar: productos -> /var/data/pdv_images/productos
```

---

## 🔄 Cambios en el Script de Deploy

### ❌ ANTES (Incorrecto)

```powershell
# Esto BORRA las imágenes dinámicas
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/
```

### ✅ AHORA (Correcto)

**Opción A: Subir public sin images/productos (Recomendado)**

El script `SUBIR_CARPETAS_MODIFICADAS.ps1` ahora:
- ✅ Sube `public` pero **excluye** `public/images/productos`
- ✅ Crea/verifica el symlink automáticamente
- ✅ No borra imágenes dinámicas

**Opción B: Subir public y luego eliminar (Alternativa)**

```powershell
# Subir public
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/

# Eliminar images/productos (el symlink queda intacto)
ssh root@72.62.128.63 "rm -rf /var/www/punto_de_venta_2025/public/images/productos"
```

---

## 🧠 Qué Cambia en Tu Código

### ✅ NADA

Tu código sigue funcionando igual:

```javascript
// services/imageService.js
const IMAGES_DIR = path.join(process.cwd(), 'public/images/productos')
// ✅ Sigue funcionando igual
```

**Cómo funciona:**
1. Node.js escribe en `public/images/productos` (el symlink)
2. Linux redirige automáticamente a `/var/data/pdv_images/productos`
3. Next.js sirve las imágenes como siempre desde `/images/productos/...`

---

## 🧪 Validación Post-Deploy

### Paso 1: Crear un Producto con Imagen

1. Ir a la aplicación en el navegador
2. Crear o editar un producto con imagen
3. Guardar

### Paso 2: Verificar que la Imagen se Guardó

```bash
# En el VPS
ls -la /var/data/pdv_images/productos/
# Debes ver el archivo de imagen creado
```

### Paso 3: Verificar que la Imagen se Sirve

1. Abre en el navegador: `https://isiweek.com/images/productos/nombre_archivo.jpg`
2. La imagen debe cargar correctamente

### Paso 4: Hacer Deploy Nuevamente

```powershell
# Ejecutar script de deploy
.\SUBIR_CARPETAS_MODIFICADAS.ps1
```

### Paso 5: Verificar que la Imagen Sigue Existiendo

1. La imagen debe seguir accesible en el navegador
2. No debe haber error 404

Si funciona → ✅ Está correcto configurado  
Si desaparece → ❌ El deploy sigue tocando `public/images/productos`

---

## ✅ Checklist de Configuración

- [ ] Carpeta persistente creada: `/var/data/pdv_images/productos`
- [ ] Permisos correctos en carpeta persistente (755)
- [ ] Symlink creado: `public/images/productos -> /var/data/pdv_images/productos`
- [ ] Symlink verificado con `ls -l public/images/`
- [ ] Script de deploy actualizado (no sube `public/images/productos`)
- [ ] Probar crear imagen → verificar en `/var/data/pdv_images/productos`
- [ ] Probar deploy → verificar que imagen sigue existiendo
- [ ] Imagen accesible desde navegador

---

## 🚨 Solución de Problemas

### Error: "File exists" al crear symlink

```bash
# Eliminar carpeta/symlink existente primero
rm -rf public/images/productos
ln -s /var/data/pdv_images/productos public/images/productos
```

### Error: "Permission denied" al crear imágenes

```bash
# Verificar permisos de carpeta persistente
chmod -R 755 /var/data/pdv_images
chown -R root:root /var/data/pdv_images
```

### Las imágenes no se guardan

1. Verificar que el symlink existe: `ls -l public/images/`
2. Verificar que la carpeta persistente existe: `ls -la /var/data/pdv_images/productos`
3. Verificar permisos: `ls -ld /var/data/pdv_images/productos`
4. Ver logs: `pm2 logs punto-venta-2025 --err`

### El symlink no funciona

```bash
# Verificar que el symlink está correcto
ls -l public/images/productos
# Debe mostrar: productos -> /var/data/pdv_images/productos

# Si está roto, recrearlo:
rm public/images/productos
ln -s /var/data/pdv_images/productos public/images/productos
```

---

## 📊 Resumen de Comandos Rápidos

### Configuración Inicial (Una Vez)

```bash
mkdir -p /var/data/pdv_images/productos
chmod -R 755 /var/data/pdv_images
rm -rf /var/www/punto_de_venta_2025/public/images/productos
ln -s /var/data/pdv_images/productos /var/www/punto_de_venta_2025/public/images/productos
```

### Verificar Configuración

```bash
ls -l /var/www/punto_de_venta_2025/public/images/
ls -la /var/data/pdv_images/productos/
```

---

## 🎯 Conclusión

- ✅ **Tu metodología de imágenes está bien diseñada**
- ✅ **Tu imageService.js es correcto**
- ✅ **El problema NO es Next.js**
- ✅ **El problema NO es Base64**
- ✅ **El problema NO es usar /public**

- ❌ **El problema era sobrescribir datos de runtime en deploy**

**Solución:** Symlink a carpeta persistente fuera del proyecto.

---

**Última actualización:** Configuración symlink para imágenes persistentes  
**IP VPS:** `72.62.128.63`  
**Usuario:** `root`

