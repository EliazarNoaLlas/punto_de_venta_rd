# Metodología y Ciclo de Vida de Imágenes de Productos

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Ciclo de Vida Completo](#ciclo-de-vida-completo)
4. [Metodología de Implementación](#metodología-de-implementación)
5. [Flujos de Operación](#flujos-de-operación)
6. [Validaciones y Seguridad](#validaciones-y-seguridad)
7. [Estructura de Archivos](#estructura-de-archivos)
8. [Consideraciones Técnicas](#consideraciones-técnicas)

---

## Introducción

Este documento describe la metodología y el ciclo de vida completo de las imágenes de productos en el sistema de punto de venta. El sistema sigue una arquitectura centralizada basada en servicios, similar a metodologías ERP profesionales (estilo Odoo).

### Principios Fundamentales

- **Servicio Centralizado**: Toda la lógica de imágenes está centralizada en `services/imageService.js`
- **Separación de Responsabilidades**: Cliente maneja UI, servidor maneja almacenamiento
- **Tolerancia a Fallos**: El sistema es resiliente ante errores de eliminación de imágenes
- **Flexibilidad**: Soporta imágenes locales y URLs externas

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ nuevo.js     │  │ editar.js    │  │ productos.js │      │
│  │ (Formulario) │  │ (Formulario) │  │ (Lista)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                            │                                 │
│                   ┌────────▼─────────┐                       │
│                   │  imageUtils.js   │                       │
│                   │  (Visualización) │                       │
│                   └──────────────────┘                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Server Actions
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    SERVIDOR (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ nuevo/       │  │ editar/      │  │ productos/   │      │
│  │ servidor.js  │  │ servidor.js  │  │ servidor.js  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                            │                                 │
│                   ┌────────▼─────────┐                       │
│                   │  imageService.js │                       │
│                   │  (Lógica Core)   │                       │
│                   └────────┬─────────┘                       │
└────────────────────────────┼─────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼───────┐       ┌────────▼────────┐
        │  File System  │       │   Base de       │
        │ public/images/│       │   Datos MySQL   │
        │   productos/  │       │  productos      │
        └───────────────┘       └─────────────────┘
```

### Responsabilidades por Capa

#### 1. Cliente (Frontend)
- **Archivos**: `nuevo.js`, `editar.js`, `productos.js`
- **Responsabilidades**:
  - Captura de archivos/URLs desde formularios
  - Validación básica (tamaño, tipo)
  - Conversión a Base64 para vista previa
  - Envío de datos al servidor
  - Visualización de imágenes con fallbacks

#### 2. Utils (Frontend)
- **Archivo**: `utils/imageUtils.js`
- **Responsabilidades**:
  - Componente `ImagenProducto` para renderizado
  - Manejo de errores de carga
  - Placeholder cuando falla la imagen
  - Validación de URLs

#### 3. Server Actions
- **Archivos**: `servidor.js` en cada módulo
- **Responsabilidades**:
  - Recepción de datos del cliente
  - Validación de permisos
  - Coordinación con base de datos
  - Invocación de servicios de imagen

#### 4. Servicio Centralizado
- **Archivo**: `services/imageService.js`
- **Responsabilidades**:
  - **Único punto de verdad** para operaciones de imagen
  - Validación de formatos y tamaños
  - Guardado de archivos físicos
  - Eliminación de archivos físicos
  - Generación de nombres únicos

---

## Ciclo de Vida Completo

### Fases del Ciclo de Vida

```
┌─────────────┐
│  1. CREAR   │  ← Usuario sube imagen o URL
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. VALIDAR │  ← Validaciones (formato, tamaño)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  3. PROCESAR│  ← Conversión Base64 → Buffer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  4. GUARDAR │  ← Guardar en File System
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 5. REGISTRAR│  ← Guardar ruta en BD
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 6. VISUALIZAR│ ← Mostrar en UI
└──────┬──────┘
       │
       ├─────────┐
       │         │
       ▼         ▼
┌───────────┐ ┌───────────┐
│ 7a. ACTUALIZAR│ │ 7b. ELIMINAR│
│ (Reemplazar) │ │ (Borrar)    │
└──────────────┘ └──────────────┘
```

---

## Metodología de Implementación

### 1. Creación de Producto con Imagen

#### Flujo Cliente → Servidor

```javascript
// CLIENTE: nuevo.js
const manejarCambioImagen = (e) => {
    const archivo = e.target.files?.[0]
    
    // Validación cliente (máx 2MB)
    if (archivo.size > 2 * 1024 * 1024) {
        alert('Imagen demasiado grande')
        return
    }
    
    // Convertir a Base64
    const reader = new FileReader()
    reader.onloadend = () => {
        setVistaPrevia(reader.result) // Para preview
    }
    reader.readAsDataURL(archivo)
}

const manejarSubmit = async (e) => {
    const datosProducto = {
        // ... otros campos
        imagen_base64: vistaPrevia, // Base64 completo
        imagen_url: null // Si es local
    }
    
    await crearProducto(datosProducto)
}
```

```javascript
// SERVIDOR: nuevo/servidor.js
export async function crearProducto(datosProducto) {
    // 1. Crear producto SIN imagen primero
    const [resultado] = await connection.execute(
        `INSERT INTO productos (...) VALUES (...)`,
        [/* datos sin imagen */]
    )
    
    const productoId = resultado.insertId
    
    // 2. Si hay imagen Base64, guardarla
    if (datosProducto.imagen_base64 && !datosProducto.imagen_url) {
        const imagenFinal = await guardarImagenProducto(
            datosProducto.imagen_base64,
            productoId
        )
        
        // 3. Actualizar producto con ruta de imagen
        await connection.execute(
            `UPDATE productos SET imagen_url = ? WHERE id = ?`,
            [imagenFinal, productoId]
        )
    }
}
```

```javascript
// SERVICIO: services/imageService.js
export async function guardarImagenProducto(base64Data, productoId) {
    // 1. Validar formato
    if (!base64Data.startsWith('data:image/')) {
        throw new Error('Formato inválido')
    }
    
    // 2. Extraer datos
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    const [, extension, data] = matches
    const buffer = Buffer.from(data, 'base64')
    
    // 3. Validar extensión
    const permitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!permitidas.includes(extension.toLowerCase())) {
        throw new Error('Extensión no permitida')
    }
    
    // 4. Validar tamaño (máx 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
        throw new Error('Imagen demasiado grande')
    }
    
    // 5. Generar nombre único
    const timestamp = Date.now()
    const fileName = `producto_${productoId}_${timestamp}.${extension}`
    
    // 6. Guardar archivo
    const filePath = path.join(IMAGES_DIR, fileName)
    await fs.writeFile(filePath, buffer)
    
    // 7. Retornar ruta relativa
    return `/images/productos/${fileName}`
}
```

### 2. Actualización de Imagen

#### Flujo de Reemplazo

```javascript
// SERVIDOR: editar/servidor.js
export async function actualizarProducto(productoId, datosProducto) {
    // 1. Obtener imagen anterior
    const [productoExistente] = await connection.execute(
        `SELECT imagen_url FROM productos WHERE id = ?`,
        [productoId]
    )
    const imagenAnterior = productoExistente[0].imagen_url
    
    // 2. Si hay nueva imagen Base64
    if (datosProducto.imagen_base64 && !datosProducto.imagen_url) {
        // Guardar nueva imagen
        imagenFinal = await guardarImagenProducto(
            datosProducto.imagen_base64,
            productoId
        )
        
        // Eliminar imagen anterior (si es local)
        if (imagenAnterior && imagenAnterior.startsWith('/images/productos/')) {
            await eliminarImagenProducto(imagenAnterior)
        }
    }
    
    // 3. Actualizar en BD
    await connection.execute(
        `UPDATE productos SET imagen_url = ? WHERE id = ?`,
        [imagenFinal, productoId]
    )
}
```

### 3. Eliminación de Imagen

#### Flujo de Limpieza

```javascript
// SERVIDOR: productos/servidor.js
export async function eliminarProducto(productoId) {
    // 1. Obtener imagen antes de eliminar
    const [producto] = await connection.execute(
        `SELECT imagen_url FROM productos WHERE id = ?`,
        [productoId]
    )
    
    // 2. Soft delete del producto
    await connection.execute(
        `UPDATE productos SET activo = FALSE WHERE id = ?`,
        [productoId]
    )
    
    // 3. Eliminar imagen física (si es local)
    const imagenUrl = producto[0].imagen_url
    if (imagenUrl && imagenUrl.startsWith('/images/productos/')) {
        await eliminarImagenProducto(imagenUrl)
    }
}
```

```javascript
// SERVICIO: services/imageService.js
export async function eliminarImagenProducto(imagenUrl) {
    // Solo procesa si es local
    if (!imagenUrl || !imagenUrl.startsWith('/images/productos/')) {
        return // No es local, no hacer nada
    }
    
    try {
        const fileName = path.basename(imagenUrl)
        const filePath = path.join(IMAGES_DIR, fileName)
        await fs.unlink(filePath)
    } catch (error) {
        // Tolerante a fallos - no lanza error
        console.error('Error al eliminar imagen:', error)
    }
}
```

### 4. Visualización de Imagen

#### Componente con Fallback

```javascript
// CLIENTE: utils/imageUtils.js
export function ImagenProducto({ src, alt, className, placeholder = true }) {
    const [error, setError] = useState(false)
    const urlValida = obtenerUrlImagenValida(src)
    
    // Si no hay URL o hay error, mostrar placeholder
    if (!urlValida || error) {
        if (!placeholder) return null
        
        return (
            <div className={`${className} imagen-placeholder`}>
                <ion-icon name="image-outline"></ion-icon>
                <span>Sin imagen</span>
            </div>
        )
    }
    
    // Renderizar imagen con manejo de error
    return (
        <img 
            src={urlValida} 
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    )
}
```

---

## Flujos de Operación

### Flujo 1: Crear Producto con Imagen Local

```
┌──────────┐
│ Usuario  │
└────┬─────┘
     │
     │ 1. Selecciona archivo
     ▼
┌─────────────────────────┐
│ nuevo.js                │
│ - manejarCambioImagen() │
│ - Validar tamaño (<2MB) │
│ - FileReader → Base64   │
└────┬────────────────────┘
     │
     │ 2. Vista previa
     ▼
┌─────────────────────────┐
│ Estado: vistaPrevia     │
│ (Base64 completo)       │
└────┬────────────────────┘
     │
     │ 3. Submit formulario
     ▼
┌─────────────────────────┐
│ nuevo/servidor.js       │
│ - crearProducto()       │
│ - INSERT producto       │
│   (sin imagen)          │
└────┬────────────────────┘
     │
     │ 4. Guardar imagen
     ▼
┌─────────────────────────┐
│ imageService.js         │
│ - guardarImagenProducto()│
│ - Validar formato       │
│ - Validar tamaño (<5MB) │
│ - Generar nombre único  │
│ - Buffer → Archivo      │
└────┬────────────────────┘
     │
     │ 5. Retornar ruta
     ▼
┌─────────────────────────┐
│ /images/productos/      │
│ producto_123_1234.jpg   │
└────┬────────────────────┘
     │
     │ 6. Actualizar BD
     ▼
┌─────────────────────────┐
│ MySQL: productos        │
│ imagen_url = '/images/  │
│ productos/...'          │
└─────────────────────────┘
```

### Flujo 2: Crear Producto con URL Externa

```
┌──────────┐
│ Usuario  │
└────┬─────┘
     │
     │ 1. Ingresa URL
     ▼
┌─────────────────────────┐
│ nuevo.js                │
│ - manejarCambioImagenUrl()│
│ - Vista previa directa  │
└────┬────────────────────┘
     │
     │ 2. Submit formulario
     ▼
┌─────────────────────────┐
│ nuevo/servidor.js       │
│ - crearProducto()       │
│ - imagen_url = URL      │
│   (no procesar imagen)  │
└────┬────────────────────┘
     │
     │ 3. INSERT directo
     ▼
┌─────────────────────────┐
│ MySQL: productos        │
│ imagen_url = 'https://  │
│ ejemplo.com/imagen.jpg' │
└─────────────────────────┘
```

### Flujo 3: Actualizar Imagen

```
┌──────────┐
│ Usuario  │ Edita producto
└────┬─────┘
     │
     │ 1. Selecciona nueva imagen
     ▼
┌─────────────────────────┐
│ editar.js               │
│ - manejarCambioImagen() │
│ - Base64 para preview   │
└────┬────────────────────┘
     │
     │ 2. Submit
     ▼
┌─────────────────────────┐
│ editar/servidor.js      │
│ - Obtener imagen_anterior│
└────┬────────────────────┘
     │
     │ 3. Guardar nueva
     ▼
┌─────────────────────────┐
│ imageService.js         │
│ - guardarImagenProducto()│
│ - Nuevo archivo creado  │
└────┬────────────────────┘
     │
     │ 4. Eliminar anterior
     ▼
┌─────────────────────────┐
│ imageService.js         │
│ - eliminarImagenProducto()│
│ - fs.unlink(anterior)   │
└────┬────────────────────┘
     │
     │ 5. UPDATE BD
     ▼
┌─────────────────────────┐
│ MySQL: productos        │
│ imagen_url = nueva_ruta │
└─────────────────────────┘
```

### Flujo 4: Eliminar Producto

```
┌──────────┐
│ Usuario  │ Elimina producto
└────┬─────┘
     │
     │ 1. Confirmar eliminación
     ▼
┌─────────────────────────┐
│ productos/servidor.js   │
│ - Obtener imagen_url    │
│ - Soft delete producto  │
└────┬────────────────────┘
     │
     │ 2. Eliminar imagen
     ▼
┌─────────────────────────┐
│ imageService.js         │
│ - eliminarImagenProducto()│
│ - Verificar si es local │
│ - fs.unlink()           │
└────┬────────────────────┘
     │
     │ 3. Archivo eliminado
     ▼
┌─────────────────────────┐
│ File System             │
│ Archivo físico borrado  │
└─────────────────────────┘
```

### Flujo 5: Visualizar Imagen

```
┌──────────┐
│ Usuario  │ Ve lista de productos
└────┬─────┘
     │
     │ 1. Renderizar lista
     ▼
┌─────────────────────────┐
│ productos.js            │
│ - ImagenProducto        │
└────┬────────────────────┘
     │
     │ 2. Validar URL
     ▼
┌─────────────────────────┐
│ imageUtils.js           │
│ - obtenerUrlImagenValida()│
│ - Verificar formato     │
└────┬────────────────────┘
     │
     ├──────────────┬──────────────┐
     │              │              │
     ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Local    │  │ Externa  │  │ Error    │
│ /images/ │  │ https:// │  │ Placeholder│
└────┬─────┘  └────┬─────┘  └──────────┘
     │             │
     │             │
     ▼             ▼
┌─────────────────────────┐
│ <img src={url} />       │
│ onError → Placeholder   │
└─────────────────────────┘
```

---

## Validaciones y Seguridad

### Validaciones en Cliente

| Validación | Ubicación | Criterio |
|------------|-----------|----------|
| Tipo de archivo | `nuevo.js`, `editar.js` | `archivo.type.startsWith('image/')` |
| Tamaño máximo | `nuevo.js`, `editar.js` | `archivo.size <= 2MB` |
| Formato Base64 | `nuevo.js`, `editar.js` | Validación implícita por FileReader |

### Validaciones en Servidor

| Validación | Ubicación | Criterio |
|------------|-----------|----------|
| Formato Base64 | `imageService.js` | `base64Data.startsWith('data:image/')` |
| Extensión válida | `imageService.js` | `['jpg', 'jpeg', 'png', 'gif', 'webp']` |
| Tamaño máximo | `imageService.js` | `buffer.length <= 5MB` |
| Estructura Base64 | `imageService.js` | Regex: `/^data:image\/(\w+);base64,(.+)$/` |
| Permisos | Todos los `servidor.js` | Verificar `userTipo === 'admin'` |

### Medidas de Seguridad

1. **Validación Multi-Capa**
   - Cliente: Validación UX (feedback inmediato)
   - Servidor: Validación de seguridad (no confiable)

2. **Sanitización de Nombres**
   - Generación automática de nombres únicos
   - Evita inyección de rutas maliciosas
   - Formato: `producto_{id}_{timestamp}.{ext}`

3. **Validación de Rutas**
   - Solo rutas locales que empiezan con `/images/productos/`
   - Validación antes de eliminar archivos

4. **Tolerancia a Fallos**
   - Eliminación de imágenes no lanza errores críticos
   - Fallbacks en visualización

---

## Estructura de Archivos

### Organización en File System

```
punto_de_venta_rd/
├── public/
│   └── images/
│       └── productos/
│           ├── producto_1_1706284800000.jpg
│           ├── producto_1_1706284900000.png
│           ├── producto_2_1706285000000.webp
│           └── ...
│
├── services/
│   └── imageService.js          ← Servicio centralizado
│
├── utils/
│   └── imageUtils.js            ← Utilidades cliente
│
└── _Pages/
    └── admin/
        └── productos/
            ├── productos.js     ← Lista (visualización)
            ├── servidor.js      ← Server actions (eliminar)
            ├── nuevo/
            │   ├── nuevo.js     ← Formulario creación
            │   └── servidor.js  ← Server action creación
            ├── editar/
            │   ├── editar.js    ← Formulario edición
            │   └── servidor.js  ← Server action edición
            └── ver/
                └── ver.js       ← Vista detalle
```

### Convención de Nombres de Archivo

**Formato**: `producto_{productoId}_{timestamp}.{extension}`

- `producto`: Prefijo fijo
- `{productoId}`: ID del producto en BD
- `{timestamp}`: `Date.now()` - garantiza unicidad
- `{extension}`: Extraída del tipo MIME

**Ejemplos**:
- `producto_123_1706284800000.jpg`
- `producto_456_1706284900000.png`
- `producto_789_1706285000000.webp`

### Almacenamiento en Base de Datos

**Tabla**: `productos`
**Campo**: `imagen_url` (VARCHAR/TEXT)

**Valores posibles**:
- `NULL`: Sin imagen
- `/images/productos/producto_123_1234.jpg`: Ruta local (relativa)
- `https://ejemplo.com/imagen.jpg`: URL externa

---

## Consideraciones Técnicas

### Formatos Soportados

| Formato | Extensión | Tipo MIME | Soporte |
|---------|-----------|-----------|---------|
| JPEG | `.jpg`, `.jpeg` | `image/jpeg` | ✅ Completo |
| PNG | `.png` | `image/png` | ✅ Completo |
| GIF | `.gif` | `image/gif` | ✅ Completo |
| WebP | `.webp` | `image/webp` | ✅ Completo |
| SVG | `.svg` | `image/svg+xml` | ❌ No soportado |

### Límites de Tamaño

| Ubicación | Límite | Razón |
|-----------|--------|-------|
| Cliente (validación) | 2 MB | Feedback rápido al usuario |
| Servidor (validación) | 5 MB | Seguridad real |
| Base de datos | Sin límite directo | Solo almacena ruta/URL |

### Procesamiento de Imágenes

**Estado Actual**:
- ✅ Conversión Base64 → Buffer → Archivo
- ✅ Validación de formato
- ✅ Validación de tamaño
- ✅ Generación de nombres únicos

**No Implementado** (posibles mejoras):
- ❌ Redimensionamiento automático
- ❌ Optimización de tamaño
- ❌ Generación de thumbnails
- ❌ Compresión de calidad

### Manejo de Errores

#### Errores en Guardado
```javascript
try {
    const imagenFinal = await guardarImagenProducto(base64Data, productoId)
} catch (error) {
    // Error capturado en servidor
    // Rollback de transacción BD
    // Retorna error al cliente
    return {
        success: false,
        mensaje: 'Error al guardar imagen: ' + error.message
    }
}
```

#### Errores en Eliminación
```javascript
// Tolerante a fallos - no lanza error
try {
    await fs.unlink(filePath)
} catch (error) {
    console.error('Error al eliminar imagen:', error)
    // No afecta el flujo principal
}
```

#### Errores en Visualización
```javascript
// Componente maneja error automáticamente
<img 
    src={url} 
    onError={() => setError(true)} // Muestra placeholder
/>
```

### Transacciones de Base de Datos

**Estrategia**: El guardado de imagen ocurre DESPUÉS de crear el producto

**Razón**: Necesitamos el `productoId` para el nombre del archivo

**Flujo**:
1. BEGIN TRANSACTION
2. INSERT producto (sin imagen)
3. Obtener `insertId`
4. Guardar imagen física
5. UPDATE producto con `imagen_url`
6. COMMIT TRANSACTION
7. Si error → ROLLBACK (producto no se crea)

**Nota**: Si falla el guardado de imagen, el producto se elimina (rollback completo)

---

## Resumen Ejecutivo

### Puntos Clave

1. **Servicio Centralizado**: `imageService.js` es el único punto de verdad
2. **Separación de Responsabilidades**: Cliente (UI) vs Servidor (almacenamiento)
3. **Validación Multi-Capa**: Cliente (UX) y Servidor (seguridad)
4. **Nombres Únicos**: `producto_{id}_{timestamp}.{ext}` garantiza unicidad
5. **Tolerancia a Fallos**: Eliminación de imágenes no bloquea operaciones
6. **Soporte Dual**: URLs locales y externas

### Mejores Prácticas Implementadas

✅ Validación en cliente y servidor
✅ Manejo de errores robusto
✅ Nombres de archivo predecibles
✅ Transacciones de BD consistentes
✅ Separación de responsabilidades
✅ Componente reutilizable para visualización

### Áreas de Mejora Futura

🔲 Redimensionamiento automático de imágenes
🔲 Optimización/compresión de imágenes
🔲 Generación de thumbnails
🔲 CDN para imágenes
🔲 Caché de imágenes
🔲 Soporte para múltiples imágenes por producto

---

**Última Actualización**: Enero 2025
**Versión**: 1.0
**Autor**: Sistema de Documentación Automática





