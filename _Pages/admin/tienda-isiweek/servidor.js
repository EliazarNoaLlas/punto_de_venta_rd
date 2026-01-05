"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

/**
 * Obtener productos visibles de la tienda IsiWeek para empresas cliente
 */
export async function obtenerProductosTiendaIsiWeek(filtroCategoria = null) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesión inválida o sin permisos'
            }
        }

        connection = await db.getConnection()

        // Verificar que la empresa está activa
        const [empresas] = await connection.execute(
            `SELECT activo FROM empresas WHERE id = ?`,
            [empresaId]
        )

        if (empresas.length === 0 || !empresas[0].activo) {
            connection.release()
            return {
                success: false,
                mensaje: 'Empresa no activa'
            }
        }

        let query = `
            SELECT 
                ip.*,
                ic.nombre as categoria_nombre
            FROM isiweek_productos ip
            LEFT JOIN isiweek_categorias ic ON ip.categoria_id = ic.id
            WHERE ip.activo = TRUE
        `
        const params = []

        if (filtroCategoria) {
            query += ` AND ip.categoria_id = ?`
            params.push(filtroCategoria)
        }

        query += ` ORDER BY ip.destacado DESC, ip.nombre ASC`

        const [productos] = await connection.execute(query, params)

        connection.release()

        return {
            success: true,
            productos: productos
        }

    } catch (error) {
        console.error('Error al obtener productos tienda IsiWeek:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar productos de la tienda'
        }
    }
}

/**
 * Obtener categorías disponibles en la tienda IsiWeek
 */
export async function obtenerCategoriasTiendaIsiWeek() {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return {
                success: false,
                mensaje: 'Sesión inválida'
            }
        }

        connection = await db.getConnection()

        const [categorias] = await connection.execute(
            `SELECT DISTINCT
                ic.*,
                COUNT(DISTINCT ip.id) as cantidad_productos
            FROM isiweek_categorias ic
            LEFT JOIN isiweek_productos ip ON ic.id = ip.categoria_id AND ip.activo = TRUE
            WHERE ic.activo = TRUE
            GROUP BY ic.id
            ORDER BY ic.orden ASC, ic.nombre ASC`
        )

        connection.release()

        return {
            success: true,
            categorias: categorias
        }

    } catch (error) {
        console.error('Error al obtener categorías tienda:', error)
        
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
 * Crear pedido B2B desde empresa cliente
 */
export async function crearPedidoB2B(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesión inválida o sin permisos'
            }
        }

        if (!datos.items || datos.items.length === 0) {
            return {
                success: false,
                mensaje: 'El pedido debe contener al menos un producto'
            }
        }

        connection = await db.getConnection()

        // Generar número de pedido
        const fecha = new Date()
        const año = fecha.getFullYear()
        const mes = String(fecha.getMonth() + 1).padStart(2, '0')
        const dia = String(fecha.getDate()).padStart(2, '0')
        
        // Obtener el último número del día
        const [ultimos] = await connection.execute(
            `SELECT numero_pedido FROM pedidos_b2b 
            WHERE numero_pedido LIKE ? 
            ORDER BY id DESC LIMIT 1`,
            [`B2B-${año}${mes}${dia}-%`]
        )

        let secuencia = 1
        if (ultimos.length > 0) {
            const ultimoNum = ultimos[0].numero_pedido
            const ultimaSecuencia = parseInt(ultimoNum.split('-')[2]) || 0
            secuencia = ultimaSecuencia + 1
        }

        const numeroPedido = `B2B-${año}${mes}${dia}-${String(secuencia).padStart(3, '0')}`

        // Calcular totales
        let subtotal = 0
        for (const item of datos.items) {
            // Determinar precio (volumen si aplica, sino precio normal)
            let precioAplicar = parseFloat(item.precio_unitario)
            if (item.precio_volumen && item.cantidad >= item.cantidad_volumen) {
                precioAplicar = parseFloat(item.precio_volumen)
            }
            subtotal += precioAplicar * parseInt(item.cantidad)
        }

        const total = subtotal - (datos.descuento || 0) + (datos.impuesto || 0)

        // Crear pedido
        const [resultadoPedido] = await connection.execute(
            `INSERT INTO pedidos_b2b (
                numero_pedido, empresa_id, usuario_id, metodo_pago,
                subtotal, descuento, impuesto, total, estado, notas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
            [
                numeroPedido,
                empresaId,
                userId,
                datos.metodo_pago || 'contra_entrega',
                subtotal,
                datos.descuento || 0,
                datos.impuesto || 0,
                total,
                datos.notas || null
            ]
        )

        const pedidoId = resultadoPedido.insertId

        // Crear items del pedido
        for (const item of datos.items) {
            let precioAplicar = parseFloat(item.precio_unitario)
            if (item.precio_volumen && item.cantidad >= item.cantidad_volumen) {
                precioAplicar = parseFloat(item.precio_volumen)
            }

            await connection.execute(
                `INSERT INTO pedidos_b2b_items (
                    pedido_id, producto_id, cantidad, precio_unitario,
                    precio_aplicado, subtotal
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    pedidoId,
                    item.producto_id,
                    item.cantidad,
                    item.precio_unitario,
                    precioAplicar,
                    precioAplicar * parseInt(item.cantidad)
                ]
            )
        }

        connection.release()

        return {
            success: true,
            mensaje: 'Pedido creado correctamente',
            pedidoId: pedidoId,
            numeroPedido: numeroPedido
        }

    } catch (error) {
        console.error('Error al crear pedido B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al crear pedido B2B'
        }
    }
}

/**
 * Obtener historial de pedidos B2B de la empresa
 */
export async function obtenerHistorialPedidosB2B() {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesión inválida o sin permisos'
            }
        }

        connection = await db.getConnection()

        const [pedidos] = await connection.execute(
            `SELECT 
                pb.*,
                COUNT(pbi.id) as cantidad_items
            FROM pedidos_b2b pb
            LEFT JOIN pedidos_b2b_items pbi ON pb.id = pbi.pedido_id
            WHERE pb.empresa_id = ?
            GROUP BY pb.id
            ORDER BY pb.fecha_pedido DESC
            LIMIT 50`,
            [empresaId]
        )

        // Obtener items para cada pedido
        for (let pedido of pedidos) {
            const [items] = await connection.execute(
                `SELECT 
                    pbi.*,
                    ip.nombre as producto_nombre,
                    ip.imagen_url
                FROM pedidos_b2b_items pbi
                LEFT JOIN isiweek_productos ip ON pbi.producto_id = ip.id
                WHERE pbi.pedido_id = ?`,
                [pedido.id]
            )
            pedido.items = items
        }

        connection.release()

        return {
            success: true,
            pedidos: pedidos
        }

    } catch (error) {
        console.error('Error al obtener historial pedidos B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar historial de pedidos'
        }
    }
}

/**
 * Obtener detalle de un pedido B2B (para empresa cliente)
 */
export async function obtenerDetallePedidoB2BCliente(pedidoId) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesión inválida o sin permisos'
            }
        }

        connection = await db.getConnection()

        const [pedidos] = await connection.execute(
            `SELECT * FROM pedidos_b2b WHERE id = ? AND empresa_id = ?`,
            [pedidoId, empresaId]
        )

        if (pedidos.length === 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'Pedido no encontrado'
            }
        }

        const pedido = pedidos[0]

        // Obtener items
        const [items] = await connection.execute(
            `SELECT 
                pbi.*,
                ip.nombre as producto_nombre,
                ip.sku,
                ip.imagen_url
            FROM pedidos_b2b_items pbi
            LEFT JOIN isiweek_productos ip ON pbi.producto_id = ip.id
            WHERE pbi.pedido_id = ?`,
            [pedidoId]
        )

        pedido.items = items

        connection.release()

        return {
            success: true,
            pedido: pedido
        }

    } catch (error) {
        console.error('Error al obtener detalle pedido B2B:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar detalle del pedido'
        }
    }
}

