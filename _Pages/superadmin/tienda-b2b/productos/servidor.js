"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

/**
 * Obtener todas las categorías B2B
 */
export async function obtenerCategoriasB2B() {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || userTipo !== 'superadmin') {
            return {
                success: false,
                mensaje: 'Acceso no autorizado'
            }
        }

        connection = await db.getConnection()

        const [categorias] = await connection.execute(
            `SELECT * FROM isiweek_categorias 
            ORDER BY orden ASC, nombre ASC`
        )

        connection.release()

        return {
            success: true,
            categorias: categorias
        }

    } catch (error) {
        console.error('Error al obtener categorías B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar categorías'
        }
    }
}

/**
 * Obtener todos los productos B2B con información de categoría
 */
export async function obtenerProductosB2B(filtroCategoria = null, filtroActivo = null) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || userTipo !== 'superadmin') {
            return {
                success: false,
                mensaje: 'Acceso no autorizado'
            }
        }

        connection = await db.getConnection()

        let query = `
            SELECT 
                ip.*,
                ic.nombre as categoria_nombre
            FROM isiweek_productos ip
            LEFT JOIN isiweek_categorias ic ON ip.categoria_id = ic.id
            WHERE 1=1
        `
        const params = []

        if (filtroCategoria) {
            query += ` AND ip.categoria_id = ?`
            params.push(filtroCategoria)
        }

        if (filtroActivo !== null) {
            query += ` AND ip.activo = ?`
            params.push(filtroActivo)
        }

        query += ` ORDER BY ip.destacado DESC, ip.nombre ASC`

        const [productos] = await connection.execute(query, params)

        connection.release()

        return {
            success: true,
            productos: productos
        }

    } catch (error) {
        console.error('Error al obtener productos B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar productos B2B'
        }
    }
}

/**
 * Crear nuevo producto B2B
 */
export async function crearProductoB2B(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || userTipo !== 'superadmin') {
            return {
                success: false,
                mensaje: 'Acceso no autorizado'
            }
        }

        if (!datos.nombre || !datos.precio) {
            return {
                success: false,
                mensaje: 'Nombre y precio son obligatorios'
            }
        }

        connection = await db.getConnection()

        const [resultado] = await connection.execute(
            `INSERT INTO isiweek_productos (
                nombre, descripcion, categoria_id, precio, precio_volumen,
                cantidad_volumen, stock, imagen_url, sku, tiempo_entrega,
                activo, destacado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                datos.nombre,
                datos.descripcion || null,
                datos.categoria_id || null,
                parseFloat(datos.precio),
                datos.precio_volumen ? parseFloat(datos.precio_volumen) : null,
                datos.cantidad_volumen || null,
                datos.stock ? parseInt(datos.stock) : 0,
                datos.imagen_url || null,
                datos.sku || null,
                datos.tiempo_entrega || null,
                datos.activo !== undefined ? datos.activo : true,
                datos.destacado !== undefined ? datos.destacado : false
            ]
        )

        connection.release()

        return {
            success: true,
            mensaje: 'Producto B2B creado correctamente',
            productoId: resultado.insertId
        }

    } catch (error) {
        console.error('Error al crear producto B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al crear producto B2B'
        }
    }
}

/**
 * Actualizar producto B2B
 */
export async function actualizarProductoB2B(productoId, datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || userTipo !== 'superadmin') {
            return {
                success: false,
                mensaje: 'Acceso no autorizado'
            }
        }

        connection = await db.getConnection()

        // Verificar que el producto existe
        const [productos] = await connection.execute(
            `SELECT id FROM isiweek_productos WHERE id = ?`,
            [productoId]
        )

        if (productos.length === 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'Producto no encontrado'
            }
        }

        await connection.execute(
            `UPDATE isiweek_productos SET
                nombre = ?,
                descripcion = ?,
                categoria_id = ?,
                precio = ?,
                precio_volumen = ?,
                cantidad_volumen = ?,
                stock = ?,
                imagen_url = ?,
                sku = ?,
                tiempo_entrega = ?,
                activo = ?,
                destacado = ?,
                fecha_actualizacion = NOW()
            WHERE id = ?`,
            [
                datos.nombre,
                datos.descripcion || null,
                datos.categoria_id || null,
                parseFloat(datos.precio),
                datos.precio_volumen ? parseFloat(datos.precio_volumen) : null,
                datos.cantidad_volumen || null,
                datos.stock ? parseInt(datos.stock) : 0,
                datos.imagen_url || null,
                datos.sku || null,
                datos.tiempo_entrega || null,
                datos.activo !== undefined ? datos.activo : true,
                datos.destacado !== undefined ? datos.destacado : false,
                productoId
            ]
        )

        connection.release()

        return {
            success: true,
            mensaje: 'Producto B2B actualizado correctamente'
        }

    } catch (error) {
        console.error('Error al actualizar producto B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al actualizar producto B2B'
        }
    }
}

/**
 * Eliminar producto B2B
 */
export async function eliminarProductoB2B(productoId) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || userTipo !== 'superadmin') {
            return {
                success: false,
                mensaje: 'Acceso no autorizado'
            }
        }

        connection = await db.getConnection()

        // Verificar si hay pedidos asociados
        const [pedidos] = await connection.execute(
            `SELECT COUNT(*) as cantidad FROM pedidos_b2b_items WHERE producto_id = ?`,
            [productoId]
        )

        if (pedidos[0].cantidad > 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'No se puede eliminar el producto porque tiene pedidos asociados'
            }
        }

        await connection.execute(
            `DELETE FROM isiweek_productos WHERE id = ?`,
            [productoId]
        )

        connection.release()

        return {
            success: true,
            mensaje: 'Producto B2B eliminado correctamente'
        }

    } catch (error) {
        console.error('Error al eliminar producto B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al eliminar producto B2B'
        }
    }
}

/**
 * Obtener detalle de un producto B2B
 */
export async function obtenerProductoB2B(productoId) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || userTipo !== 'superadmin') {
            return {
                success: false,
                mensaje: 'Acceso no autorizado'
            }
        }

        connection = await db.getConnection()

        const [productos] = await connection.execute(
            `SELECT 
                ip.*,
                ic.nombre as categoria_nombre
            FROM isiweek_productos ip
            LEFT JOIN isiweek_categorias ic ON ip.categoria_id = ic.id
            WHERE ip.id = ?`,
            [productoId]
        )

        connection.release()

        if (productos.length === 0) {
            return {
                success: false,
                mensaje: 'Producto no encontrado'
            }
        }

        return {
            success: true,
            producto: productos[0]
        }

    } catch (error) {
        console.error('Error al obtener producto B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar producto B2B'
        }
    }
}

