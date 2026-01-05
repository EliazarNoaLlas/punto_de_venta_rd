import fs from 'fs/promises'
import path from 'path'

/**
 * Servicio centralizado para manejo de imágenes de productos
 * Siguiendo metodología profesional (estilo Odoo/ERP)
 * 
 * Este servicio es el único punto de verdad para todo lo relacionado con imágenes
 */

// En producción: usar carpeta persistente fuera del proyecto
// En desarrollo: usar carpeta local (public/images/productos)
const IMAGES_DIR_PRODUCTION = '/var/data/pdv_images/productos'
const IMAGES_DIR_DEVELOPMENT = path.join(process.cwd(), 'public', 'images', 'productos')

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production'

// En producción, usar siempre la carpeta persistente
// En desarrollo, usar la carpeta local
const IMAGES_DIR = isProduction ? IMAGES_DIR_PRODUCTION : IMAGES_DIR_DEVELOPMENT

const PUBLIC_PATH = '/images/productos'

/**
 * Asegura que la carpeta de imágenes existe
 */
async function ensureDirExists() {
    try {
        await fs.mkdir(IMAGES_DIR, { recursive: true })
    } catch (error) {
        console.error('Error al crear directorio de imágenes:', error)
        throw new Error('No se pudo crear el directorio de imágenes')
    }
}

/**
 * Guarda una imagen y retorna la ruta relativa
 * @param {string} base64Data - Cadena base64 de la imagen (data:image/...)
 * @param {number|string} productoId - ID del producto
 * @returns {Promise<string>} - Ruta relativa de la imagen (/images/productos/...)
 */
export async function guardarImagenProducto(base64Data, productoId) {
    // Validación
    if (!base64Data || !base64Data.startsWith('data:image/')) {
        throw new Error('Formato de imagen inválido')
    }

    // Crear directorio si no existe
    await ensureDirExists()

    // Extraer información
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
        throw new Error('Base64 inválido')
    }

    const [, extension, data] = matches
    const buffer = Buffer.from(data, 'base64')

    // Validar extensión permitida
    const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!extensionesPermitidas.includes(extension.toLowerCase())) {
        throw new Error(`Extensión ${extension} no permitida. Use: ${extensionesPermitidas.join(', ')}`)
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (buffer.length > maxSize) {
        throw new Error('La imagen es demasiado grande. Máximo 5MB')
    }

    // Nombre único
    const timestamp = Date.now()
    const fileName = `producto_${productoId}_${timestamp}.${extension}`
    const filePath = path.join(IMAGES_DIR, fileName)

    // Guardar archivo
    await fs.writeFile(filePath, buffer)

    // Retornar ruta RELATIVA
    return `${PUBLIC_PATH}/${fileName}`
}

/**
 * Elimina una imagen física si es local
 * @param {string} imagenUrl - Ruta relativa de la imagen (/images/productos/...)
 * @returns {Promise<void>}
 */
export async function eliminarImagenProducto(imagenUrl) {
    if (!imagenUrl || !imagenUrl.startsWith(PUBLIC_PATH)) {
        return // No es local, no hacer nada
    }

    try {
        const fileName = path.basename(imagenUrl)
        const filePath = path.join(IMAGES_DIR, fileName)
        await fs.unlink(filePath)
    } catch (error) {
        console.error('Error al eliminar imagen:', error)
        // No lanzar error, es tolerante a fallos
    }
}

/**
 * Valida si una URL de imagen es accesible (solo estructura, no existencia física)
 * @param {string} imagenUrl - URL o ruta de la imagen
 * @returns {string|null} - URL válida o null
 */
export function obtenerUrlValida(imagenUrl) {
    if (!imagenUrl) return null
    
    // Si es local (empieza con /images/)
    if (imagenUrl.startsWith('/images/')) {
        return imagenUrl
    }
    
    // Si es URL externa válida
    try {
        new URL(imagenUrl)
        return imagenUrl
    } catch {
        return null
    }
}

/**
 * Valida que una imagen local existe físicamente
 * @param {string} imagenUrl - Ruta relativa de la imagen
 * @returns {Promise<boolean>} - true si la imagen existe
 */
export async function existeImagenLocal(imagenUrl) {
    if (!imagenUrl || !imagenUrl.startsWith(PUBLIC_PATH)) {
        return false
    }

    try {
        const fileName = path.basename(imagenUrl)
        const filePath = path.join(IMAGES_DIR, fileName)
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}
