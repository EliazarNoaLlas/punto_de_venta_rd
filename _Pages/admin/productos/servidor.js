"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { eliminarImagenProducto } from '@/services/imageService'

export async function obtenerProductos() {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesion invalida'
            }
        }

        connection = await db.getConnection()

        const [productos] = await connection.execute(
            `SELECT 
                p.id,
                p.codigo_barras,
                p.sku,
                p.nombre,
                p.descripcion,
                p.categoria_id,
                p.marca_id,
                p.precio_compra,
                p.precio_venta,
                p.precio_oferta,
                p.stock,
                p.stock_minimo,
                p.stock_maximo,
                p.imagen_url,
                p.aplica_itbis,
                p.activo,
                c.nombre as categoria_nombre,
                m.nombre as marca_nombre,
                um.abreviatura as unidad_medida_abreviatura
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN marcas m ON p.marca_id = m.id
            LEFT JOIN unidades_medida um ON p.unidad_medida_id = um.id
            WHERE p.empresa_id = ?
            ORDER BY p.nombre ASC`,
            [empresaId]
        )

        const [categorias] = await connection.execute(
            `SELECT id, nombre
            FROM categorias
            WHERE empresa_id = ? AND activo = TRUE
            ORDER BY nombre ASC`,
            [empresaId]
        )

        const [marcas] = await connection.execute(
            `SELECT id, nombre
            FROM marcas
            WHERE empresa_id = ? AND activo = TRUE
            ORDER BY nombre ASC`,
            [empresaId]
        )

        connection.release()

        // Filtrar datos según el rol del usuario
        let productosFiltrados = productos
        
        if (userTipo === 'vendedor') {
            // Para vendedores: ocultar información sensible
            productosFiltrados = productos.map(producto => {
                // Calcular estado de stock operativo
                let estadoStock = 'disponible'
                if (producto.stock <= 0) {
                    estadoStock = 'agotado'
                } else if (producto.stock <= producto.stock_minimo || producto.stock <= 5) {
                    estadoStock = 'bajo'
                }
                
                return {
                    id: producto.id,
                    codigo_barras: producto.codigo_barras,
                    sku: producto.sku,
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    categoria_id: producto.categoria_id,
                    marca_id: producto.marca_id,
                    // ❌ NO incluir precio_compra
                    precio_venta: producto.precio_venta,
                    precio_oferta: producto.precio_oferta,
                    // ❌ NO incluir stock, stock_minimo, stock_maximo numéricos
                    estado_stock: estadoStock, // ✅ Solo estado operativo
                    imagen_url: producto.imagen_url,
                    aplica_itbis: producto.aplica_itbis,
                    activo: producto.activo,
                    categoria_nombre: producto.categoria_nombre,
                    marca_nombre: producto.marca_nombre,
                    unidad_medida_abreviatura: producto.unidad_medida_abreviatura
                }
            })
        }

        return {
            success: true,
            productos: productosFiltrados,
            categorias: categorias,
            marcas: marcas,
            userTipo: userTipo // Incluir tipo de usuario para el frontend
        }

    } catch (error) {
        console.error('Error al obtener productos:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar productos'
        }
    }
}

export async function eliminarProducto(productoId) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || userTipo !== 'admin') {
            return {
                success: false,
                mensaje: 'No tienes permisos para eliminar productos'
            }
        }

        connection = await db.getConnection()

        // Obtener imagen antes de eliminar producto
        const [producto] = await connection.execute(
            `SELECT id, imagen_url FROM productos WHERE id = ? AND empresa_id = ?`,
            [productoId, empresaId]
        )

        if (producto.length === 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'Producto no encontrado'
            }
        }

        // Soft delete del producto
        await connection.execute(
            `UPDATE productos SET activo = FALSE WHERE id = ? AND empresa_id = ?`,
            [productoId, empresaId]
        )

        connection.release()

        // Eliminar imagen física si es local
        const imagenUrl = producto[0].imagen_url
        if (imagenUrl && imagenUrl.startsWith('/images/productos/')) {
            await eliminarImagenProducto(imagenUrl)
        }

        return {
            success: true,
            mensaje: 'Producto eliminado exitosamente'
        }

    } catch (error) {
        console.error('Error al eliminar producto:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al eliminar producto'
        }
    }
}