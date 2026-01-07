# 📦 Documentación - Carpeta Productos

## 📋 Tabla de Contenidos

1. [Estructura de la Carpeta](#estructura-de-la-carpeta)
2. [Problema Actual con Imágenes](#problema-actual-con-imágenes)
3. [Errores del Navegador - Análisis Profesional](#errores-del-navegador---análisis-profesional)
4. [Metodología Profesional (Estilo Odoo/ERP)](#metodología-profesional-estilo-odoerp)
5. [Solución Propuesta](#solución-propuesta)
6. [Implementación](#implementación)
7. [Estructura de Archivos](#estructura-de-archivos)

---

## 📁 Estructura de la Carpeta

La carpeta `_Pages/admin/productos` contiene los siguientes archivos y subcarpetas:

```
_Pages/admin/productos/
├── productos.js              # Listado principal de productos
├── productos.module.css      # Estilos del listado
├── servidor.js              # Funciones del servidor (listado, eliminar)
├── nuevo/
│   ├── nuevo.js             # Formulario para crear productos
│   ├── nuevo.module.css     # Estilos del formulario
│   └── servidor.js          # Lógica para crear productos
├── editar/
│   ├── editar.js            # Formulario para editar productos
│   ├── editar.module.css    # Estilos del formulario
│   └── servidor.js          # Lógica para actualizar productos
└── ver/
    ├── ver.js               # Vista detallada del producto
    ├── ver.module.css       # Estilos de la vista
    └── servidor.js          # Lógica para obtener detalles
```

---

## ⚠️ Problema Actual con Imágenes

### Situación Actual

Actualmente, el sistema maneja las imágenes de productos de dos formas diferentes e inconsistentes:

#### 1. **Al Crear Productos** (`nuevo/servidor.js`)

- Las imágenes se intentan subir a un **VPS remoto** usando la función `subirImagenAVPS()`
- Se utiliza `VPS_UPLOAD_URL` y `VPS_IMAGE_BASE_URL` desde variables de entorno
- Si falla la subida al VPS, el proceso falla completamente
- **Problema**: Dependencia de servicios externos y requiere configuración de variables de entorno

```javascript
// Código actual en nuevo/servidor.js (líneas 63-98)
async function subirImagenAVPS(imagenBase64) {
    // Intenta subir a VPS remoto
    const response = await fetch(VPS_UPLOAD_URL, {
        method: 'POST',
        body: formData
    })
    return `${VPS_IMAGE_BASE_URL}/${resultado.filename}`
}
```

#### 2. **Al Editar Productos** (`editar/servidor.js`)

- Las imágenes se guardan **directamente como base64 en la base de datos**
- Se almacena la cadena base64 completa en el campo `imagen_url` de la tabla `productos`
- **Problema**: 
  - Las URLs base64 son extremadamente largas (pueden exceder el límite de VARCHAR(1000))
  - Causa errores `ERR_INVALID_URL` cuando las URLs están truncadas
  - Aumenta significativamente el tamaño de la base de datos
  - No se pueden ver las imágenes físicamente en el sistema de archivos

```javascript
// Código actual en editar/servidor.js (líneas 165-169)
let imagenFinal = datosProducto.imagen_url

if (datosProducto.imagen_base64 && !datosProducto.imagen_url) {
    imagenFinal = datosProducto.imagen_base64  // ❌ Guarda base64 directamente
}
```

### Consecuencias del Problema

1. **Inconsistencia**: Diferentes métodos de almacenamiento según la acción (crear vs editar)
2. **Dependencia Externa**: Requiere VPS para crear productos (no funciona en desarrollo local)
3. **Base de Datos Pesada**: Almacenar base64 en la BD aumenta innecesariamente el tamaño
4. **Errores en Navegador**: URLs base64 truncadas causan errores `ERR_INVALID_URL`
5. **Falta de Organización**: No hay estructura de archivos para gestionar imágenes
6. **Imposibilidad de Backup**: Las imágenes no están en archivos físicos, solo en BD

---

## 🔍 Errores del Navegador - Análisis Profesional

### Error 1: `Failed to load resource: net::ERR_INVALID_URL`

#### 📌 Qué significa realmente

Este error **NO es de red, ni de servidor**. Significa que el navegador intentó cargar un recurso (imagen, script, etc.) usando una URL mal formada o inválida.

#### 📌 Dónde ocurre en tu caso

La pista clave está en la consola del navegador:

```
data:image/jpeg;base64,UklGRt5UAABXRUJQVlA4INJUAADwSQGdASraARIBPplAm0g...
```

⚠️ Esa **NO es una URL válida** para uso persistente cuando:
- Está truncada
- Está mal concatenada
- Está guardada en BD con límite VARCHAR
- Está mezclada con rutas relativas
- Está inyectada como `src` sin validación

#### 📌 Qué lo dispara en tu programa

En tu código (especialmente en `editar/servidor.js`):

```javascript
// ❌ PROBLEMA ACTUAL
imagenFinal = datosProducto.imagen_base64
```

Esto provoca que en el frontend se haga algo como:

```html
<img src="data:image/jpeg;base64,UklGRt5UAABXRUJQVlA4INJUAADwSQGdA...">
```

Pero el problema es que:
- ❌ La cadena **NO llega completa** (truncada por límite VARCHAR(1000))
- ❌ El navegador intenta tratarla como URL
- ❌ La cadena se corta por límites de BD
- ❌ El resultado es una URL inválida

👉 **Resultado final**: `ERR_INVALID_URL`

#### 📌 Por qué ocurre intermitentemente

A veces funciona y a veces no porque:

| Tamaño imagen | Resultado |
|--------------|-----------|
| Pequeña (< 500KB) | Puede renderizar (si cabe en VARCHAR) |
| Mediana (500KB - 1MB) | Se corta, URL inválida |
| Grande (> 1MB) | Error inmediato |

Esto **nunca es confiable** en producción.

#### ✅ Solución profesional (la correcta)

- ✔️ Nunca renderizar base64 desde BD
- ✔️ Nunca guardar base64 en BD
- ✔️ Usar solo:

```html
<img src="/images/productos/producto_123_1706.jpg">
```

Esto elimina el error al **100%**.

---

### Error 2: `data:image/jpeg;base64: Failed to load resource: net::ERR_INVALID_URL`

Este es el mismo error, pero reportado directamente por el loader de imágenes del navegador.

#### 📌 Traducción técnica

El atributo `src` contiene una URL que **no cumple el estándar RFC de URLs**.

#### Causas concretas en tu sistema

1. **Base64 incompleto**: `data:image/jpeg;base64,` sin datos válidos
2. **Cadena truncada en BD**: Uso de `VARCHAR(1000)` (muy común)
3. **Mezcla de imagen_url y imagen_base64**: Lógica inconsistente

#### ⚠️ Punto importante

Aunque parezca una URL, `data:image/...`:

- ❌ No es persistente
- ❌ No es cacheable
- ❌ No es indexable
- ❌ No es debugeable
- ❌ No es mantenible

**Por eso Odoo nunca hace esto en producción.**

---

### Error 3: `Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.`

#### 📌 Este error NO es de tu backend

Este error viene de:

```
content-all.js
```

Eso **NO es tu código**.

#### 📌 Qué lo causa realmente

Este error lo generan:

- Extensiones del navegador (Edge / Chrome)
- Copilot
- AdBlock
- Extensiones de devtools
- Plugins que inyectan scripts

#### 📌 El mensaje exacto

Se intentó enviar un mensaje a una extensión, pero no hay receptor activo.

#### 🔍 Cómo confirmarlo

- ✔️ Abre tu app en modo incógnito
- ✔️ O desactiva extensiones
- ✔️ El error desaparece

👉 **No afecta a tu aplicación**

#### ✅ Conclusión de este error

| Error | ¿Debes preocuparte? |
|-------|---------------------|
| `content-all.js` | ❌ No |
| `Receiving end does not exist` | ❌ No |
| Promise no capturada | ❌ No |

👉 **Ignorar completamente.**

---

### 🧠 Relación Directa con tu Diseño de Imágenes

| Problema | Causa |
|----------|-------|
| `ERR_INVALID_URL` | Base64 en BD |
| Imágenes no cargan | URLs truncadas |
| Errores aleatorios | Tamaño variable |
| BD pesada | Almacenar binarios |
| Difícil debug | Data URLs |

**Tu diagnóstico arquitectónico previo es correcto.**

---

### ✅ Cómo queda el Flujo CORRECTO (sin errores)

```
Frontend
 └── <img src="/images/productos/producto_123.jpg">

Backend
 └── Guarda archivo físico

BD
 └── Guarda solo "/images/productos/producto_123.jpg"
```

🔒 Sin base64 en runtime  
🔒 Sin URLs inválidas  
🔒 Sin errores de navegador

---

### 🧪 Checklist Rápido para Verificar que Ya No Ocurrirá

- [ ] `imagen_url` NO contiene `data:image`
- [ ] El campo es `VARCHAR(255)`
- [ ] Todas las imágenes existen en `public/images/productos`
- [ ] Frontend solo renderiza rutas relativas
- [ ] No hay lógica de imágenes en UI
- [ ] `imageService` centralizado

---

### 🏁 Conclusión Final

**Tus errores NO son bugs aislados**  
**Son síntomas claros de un antipatrón arquitectónico (base64 persistente).**

**Tu nueva metodología elimina la causa raíz, no solo el error.**

---

## 🧠 Metodología Profesional (Estilo Odoo/ERP)

### 🏗️ Cómo manejan las imágenes los sistemas grandes (Odoo, SAP, ERP, POS enterprise)

Sistemas como Odoo NO ven las imágenes como "archivos sueltos", sino como **activos digitales (Digital Assets)** con reglas claras:

#### Principios que siguen

1. ✅ **La base de datos nunca almacena binarios grandes**
2. ✅ **La BD solo guarda referencias** (paths / IDs / hashes)
3. ✅ **El sistema de archivos o storage es el dueño real del archivo**
4. ✅ **La lógica de imágenes está centralizada**
5. ✅ **El ciclo de vida de la imagen está ligado al ciclo de vida del producto**
6. ✅ **El frontend nunca decide dónde ni cómo se guarda una imagen**

👉 Tu problema actual viola al menos **4 de estos principios**, pero tu solución propuesta ya va en la dirección correcta.

---

### 🎯 Diagnóstico Profesional de tu Situación

#### ❌ Problemas reales (bien detectados por ti)

| Problema | Impacto real en sistemas grandes |
|----------|----------------------------------|
| Base64 en BD | ❌ Antipatrón crítico (DB bloat) |
| Dependencia VPS | ❌ Rompe entornos dev/staging |
| Lógica duplicada | ❌ Inconsistencia funcional |
| URLs inválidas | ❌ Error de capa de presentación |
| No lifecycle | ❌ Imposible mantenimiento |

👉 Esto **NO escalaría ni a 5k productos**.

#### ✅ Tu solución propuesta (evaluación)

Tu idea de:

- **BD** → guarda solo `/images/productos/archivo.jpg`
- **FS** → guarda el archivo real

✅ Es correcta  
✅ Es lo que hacen Odoo / Magento / ERPNext en on-premise  
❌ Pero le falta formalización arquitectónica

**Vamos a convertirla en metodología profesional.**

---

### 🧩 NIVEL 1 – Arquitectura de Capas (como Odoo)

```
[ UI / Frontend ]
        ↓
[ Capa de Servicios de Dominio ]
        ↓
[ Servicio de Imágenes ]
        ↓
[ Sistema de Archivos / Storage ]
```

#### 📌 Regla de oro

**Ningún módulo de productos debe saber cómo se guarda una imagen, solo qué imagen usar.**

---

### 🧱 NIVEL 2 – Imagen como Activo (Asset)

En lugar de "imagen_url", conceptualmente manejas:

```
Producto
 └── tiene → ActivoImagen
               ├── path
               ├── tipo
               ├── tamaño
               ├── checksum (opcional)
               └── estado
```

En Odoo esto existe como `ir.attachment`.

Tú lo simplificas (correcto para POS):

```
productos.imagen_url  -- referencia, no contenido
```

---

### 🧩 NIVEL 3 – Servicio Centralizado de Imágenes (CLAVE)

🔴 **Aquí está el salto profesional que te faltaba**

En vez de duplicar `guardarImagenLocal()` en cada `servidor.js`:

✅ **Crear un servicio único**

```
/services
 └── imageService.js
```

#### Responsabilidades:

- Validar imagen
- Decodificar base64
- Generar nombre único
- Guardar archivo
- Eliminar archivo
- Devolver ruta relativa

#### 📌 Los módulos NO manejan fs, path ni buffers

**Ejemplo conceptual:**
```javascript
imageService.saveProductImage(base64, productoId)
imageService.deleteImage(path)
```

Esto es exactamente como lo hace Odoo internamente.

---

### 🔄 NIVEL 4 – Ciclo de Vida de la Imagen (Lifecycle Management)

#### 🟢 Crear producto

1. Guardar producto (obtener ID)
2. Guardar imagen
3. Asociar path al producto

#### 🟡 Editar producto

1. Guardar nueva imagen
2. Eliminar imagen anterior
3. Actualizar referencia

#### 🔴 Eliminar producto

1. Soft delete producto
2. Eliminar imagen física

#### 📌 Imagen vive y muere con el producto

---

### 🗂️ NIVEL 5 – Naming & Organización (como ERP real)

Tu naming es correcto, solo lo formalizamos:

```
producto_{productoId}_{timestamp}.{ext}
```

**Opcional (nivel enterprise):**

```
/images/productos/{empresaId}/{productoId}/main.jpg
```

Esto es EXACTAMENTE lo que hacen sistemas multi-empresa.

---

### 🛡️ NIVEL 6 – Reglas Profesionales Obligatorias

#### ✔️ Reglas de oro

- ❌ Nunca base64 en BD
- ❌ Nunca lógica de imágenes en UI
- ❌ Nunca depender de VPS en dev
- ✅ Siempre rutas relativas
- ✅ Siempre servicio centralizado

---

### 📦 NIVEL 7 – Estrategia de Escalabilidad (como Odoo)

Tu solución NO se descarta en producción, solo evoluciona:

| Entorno | Storage |
|---------|---------|
| Local | File System |
| VPS único | File System |
| Cluster | NFS |
| Cloud | S3 compatible |

👉 **La app no cambia, solo el imageService.**

---

### 🧠 Cómo Odoo haría EXACTAMENTE esto

| Odoo | Tu Proyecto |
|------|-------------|
| `ir.attachment` | `imageService` |
| `filestore` | `public/images` |
| `res_id` | `productoId` |
| `store_fname` | `nombreArchivo` |
| `unlink()` | `fs.unlink` |

👉 **Conceptualmente estás alineado con Odoo** 👍

---

### 🧪 Evaluación Final de tu Propuesta

#### ✅ Lo que ya hiciste bien

- Diagnóstico correcto
- Eliminación de base64
- Rutas relativas
- Eliminación de dependencias externas
- Manejo de borrado

#### 🔧 Lo que profesionaliza el sistema

- Servicio centralizado
- Separación de dominio / infraestructura
- Lifecycle formal
- Naming consistente
- Preparación para storage distribuido

---

### 🏁 Metodología Resumida (para documentación o equipo)

> Las imágenes de productos se gestionan como activos del sistema.  
> El sistema de archivos es el almacenamiento real,  
> la base de datos solo mantiene referencias,  
> y un servicio centralizado controla todo su ciclo de vida.

---

## ✅ Solución Propuesta

### Almacenamiento Local en `public/images/productos/`

La solución recomendada es guardar todas las imágenes de productos en una carpeta local dentro del proyecto:

```
public/
└── images/
    └── productos/
        ├── producto_1_1234567890.jpg
        ├── producto_2_1234567891.png
        └── producto_3_1234567892.jpg
```

### Ventajas de esta Solución

1. ✅ **Consistencia**: Mismo método para crear y editar productos
2. ✅ **Desarrollo Local**: Funciona sin dependencias externas
3. ✅ **Organización**: Todas las imágenes en una ubicación específica
4. ✅ **Performance**: URLs simples y rápidas de cargar
5. ✅ **Backup**: Las imágenes están en archivos físicos, fáciles de respaldar
6. ✅ **Base de Datos Limpia**: Solo se guarda la ruta relativa, no el contenido
7. ✅ **Mantenimiento**: Fácil de limpiar, organizar y gestionar

### Estructura de Almacenamiento Propuesta

```
public/images/productos/
├── producto_{productoId}_{timestamp}.jpg
├── producto_{productoId}_{timestamp}.png
└── ...
```

**Formato del nombre de archivo:**
- `producto_{id}_{timestamp}.{extension}`
- Ejemplo: `producto_123_1706284800000.jpg`

**URL almacenada en la base de datos:**
- `/images/productos/producto_123_1706284800000.jpg`
- Relativa a la carpeta `public/`

---

## 🔧 Implementación

### Cambios Necesarios

#### 1. Crear la Carpeta de Imágenes

```bash
# Crear la estructura de directorios
mkdir -p public/images/productos
```

#### 2. Modificar `nuevo/servidor.js`

**Cambios requeridos:**

- Eliminar la función `subirImagenAVPS()`
- Crear nueva función `guardarImagenLocal()` que:
  - Convierta base64 a buffer
  - Genere nombre único: `producto_{id}_{timestamp}.{ext}`
  - Guarde el archivo en `public/images/productos/`
  - Retorne la ruta relativa: `/images/productos/nombre_archivo.jpg`

**Código propuesto:**

```javascript
import fs from 'fs/promises'
import path from 'path'

async function guardarImagenLocal(imagenBase64, productoId) {
    try {
        // Extraer datos base64 y tipo MIME
        const base64Data = imagenBase64.split(',')[1]
        const mimeType = imagenBase64.split(';')[0].split(':')[1]
        const extension = mimeType.split('/')[1]
        
        // Convertir base64 a buffer
        const buffer = Buffer.from(base64Data, 'base64')
        
        // Generar nombre único
        const timestamp = Date.now()
        const nombreArchivo = `producto_${productoId}_${timestamp}.${extension}`
        
        // Ruta completa del archivo
        const rutaCompleta = path.join(process.cwd(), 'public', 'images', 'productos', nombreArchivo)
        
        // Asegurar que la carpeta existe
        const carpetaImagenes = path.join(process.cwd(), 'public', 'images', 'productos')
        await fs.mkdir(carpetaImagenes, { recursive: true })
        
        // Guardar archivo
        await fs.writeFile(rutaCompleta, buffer)
        
        // Retornar ruta relativa (desde public/)
        return `/images/productos/${nombreArchivo}`
        
    } catch (error) {
        console.error('Error al guardar imagen local:', error)
        throw error
    }
}
```

#### 3. Modificar `editar/servidor.js`

**Cambios requeridos:**

- Implementar la misma función `guardarImagenLocal()`
- Reemplazar la lógica que guarda base64 directamente
- Manejar la eliminación de imágenes antiguas al actualizar

**Código propuesto:**

```javascript
// Al actualizar imagen
if (datosProducto.imagen_base64 && !datosProducto.imagen_url) {
    try {
        // Obtener imagen anterior para eliminarla
        const [productoAnterior] = await connection.execute(
            `SELECT imagen_url FROM productos WHERE id = ?`,
            [productoId]
        )
        
        // Guardar nueva imagen
        imagenFinal = await guardarImagenLocal(datosProducto.imagen_base64, productoId)
        
        // Eliminar imagen anterior si existe y es local
        if (productoAnterior[0]?.imagen_url && productoAnterior[0].imagen_url.startsWith('/images/')) {
            const rutaAnterior = path.join(process.cwd(), 'public', productoAnterior[0].imagen_url)
            try {
                await fs.unlink(rutaAnterior)
            } catch (err) {
                console.warn('No se pudo eliminar imagen anterior:', err)
            }
        }
    } catch (error) {
        await connection.rollback()
        connection.release()
        return {
            success: false,
            mensaje: 'Error al guardar la imagen del producto'
        }
    }
}
```

#### 4. Modificar `servidor.js` (eliminar producto)

**Cambios requeridos:**

- Al eliminar un producto, eliminar también su imagen asociada

```javascript
export async function eliminarProducto(productoId) {
    // ... código existente de validación ...
    
    // Obtener imagen antes de eliminar
    const [producto] = await connection.execute(
        `SELECT imagen_url FROM productos WHERE id = ? AND empresa_id = ?`,
        [productoId, empresaId]
    )
    
    // Eliminar producto (soft delete)
    await connection.execute(
        `UPDATE productos SET activo = FALSE WHERE id = ? AND empresa_id = ?`,
        [productoId, empresaId]
    )
    
    // Eliminar imagen si es local
    if (producto[0]?.imagen_url && producto[0].imagen_url.startsWith('/images/')) {
        const rutaImagen = path.join(process.cwd(), 'public', producto[0].imagen_url)
        try {
            await fs.unlink(rutaImagen)
        } catch (err) {
            console.warn('No se pudo eliminar imagen del producto:', err)
        }
    }
    
    // ... resto del código ...
}
```

#### 5. Actualizar `.gitignore`

Agregar excepción para la carpeta de imágenes (o mantener las imágenes en git si es necesario):

```gitignore
# Imágenes de productos (opcional: comentar si quieres versionar las imágenes)
public/images/productos/*
!public/images/productos/.gitkeep
```

O crear un archivo `.gitkeep` para mantener la estructura:

```bash
touch public/images/productos/.gitkeep
```

---

## 📂 Estructura de Archivos Final

### Estructura del Proyecto

```
punto_de_venta_rd/
├── public/
│   └── images/
│       └── productos/
│           ├── .gitkeep
│           ├── producto_1_1706284800000.jpg
│           ├── producto_2_1706284900000.png
│           └── ...
├── _Pages/
│   └── admin/
│       └── productos/
│           ├── productos.js
│           ├── productos.module.css
│           ├── servidor.js
│           ├── nuevo/
│           │   ├── nuevo.js
│           │   ├── nuevo.module.css
│           │   └── servidor.js  ⚠️ MODIFICAR
│           ├── editar/
│           │   ├── editar.js
│           │   ├── editar.module.css
│           │   └── servidor.js  ⚠️ MODIFICAR
│           └── ver/
│               ├── ver.js
│               ├── ver.module.css
│               └── servidor.js
└── utils/
    └── imageUtils.js  ✅ Ya existe (validación de URLs)
```

### Base de Datos

**Tabla `productos` - Campo `imagen_url`:**

- **Tipo actual**: `VARCHAR(1000)`
- **Tipo recomendado**: `VARCHAR(255)` (suficiente para rutas relativas)
- **Ejemplo de valor**: `/images/productos/producto_123_1706284800000.jpg`

---

## 📝 Resumen de Cambios

### Archivos a Modificar

1. ✅ **`_Pages/admin/productos/nuevo/servidor.js`**
   - Reemplazar `subirImagenAVPS()` por `guardarImagenLocal()`
   - Actualizar lógica de creación de productos

2. ✅ **`_Pages/admin/productos/editar/servidor.js`**
   - Agregar función `guardarImagenLocal()`
   - Reemplazar guardado de base64 por guardado de archivo
   - Implementar eliminación de imagen anterior

3. ✅ **`_Pages/admin/productos/servidor.js`**
   - Agregar eliminación de imagen al eliminar producto

4. ✅ **Crear carpeta `public/images/productos/`**
   - Crear estructura de directorios
   - Agregar `.gitkeep` si es necesario

### Variables de Entorno

**Ya NO se necesitan:**
- ❌ `VPS_UPLOAD_URL`
- ❌ `VPS_IMAGE_BASE_URL`

**Mantenidas:**
- ✅ Todas las demás variables (DB_HOST, DB_USER, etc.)

---

## 🚀 Beneficios de la Implementación

1. **Consistencia Total**: Mismo método para crear y editar productos
2. **Funciona en Local**: No requiere servicios externos
3. **Base de Datos Optimizada**: Solo rutas, no contenido base64
4. **Sin Errores de URL**: URLs simples y válidas siempre
5. **Fácil Backup**: Carpeta de imágenes fácil de respaldar
6. **Mejor Performance**: Carga más rápida de imágenes
7. **Mantenimiento Simple**: Gestión de archivos directa

---

## ⚠️ Consideraciones Importantes

### Desarrollo vs Producción

- **Desarrollo Local**: Funciona perfectamente con esta solución
- **Producción**: Si se despliega en múltiples servidores, considerar:
  - Almacenamiento compartido (NFS, S3, etc.)
  - O mantener la solución actual para producción

### Migración de Datos Existentes

Si ya existen productos con imágenes en base64 o en VPS:

1. Crear script de migración para:
   - Extraer base64 de la base de datos
   - Guardar como archivos en `public/images/productos/`
   - Actualizar `imagen_url` con la nueva ruta

2. Para imágenes en VPS:
   - Descargar imágenes del VPS
   - Guardar localmente
   - Actualizar rutas en la base de datos

---

## 📌 Checklist de Implementación

- [ ] Crear carpeta `public/images/productos/`
- [ ] Crear función `guardarImagenLocal()` compartida o en cada archivo
- [ ] Modificar `nuevo/servidor.js` para usar guardado local
- [ ] Modificar `editar/servidor.js` para usar guardado local
- [ ] Actualizar `servidor.js` para eliminar imágenes al eliminar productos
- [ ] Actualizar `.gitignore` si es necesario
- [ ] Probar creación de productos con imágenes
- [ ] Probar edición de productos con imágenes
- [ ] Probar eliminación de productos (verificar eliminación de imagen)
- [ ] Crear script de migración si hay datos existentes (opcional)

---

**Última actualización**: 2025-01-27

**Estado**: Documentación preparada para implementación

