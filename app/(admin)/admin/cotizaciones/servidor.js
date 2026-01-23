"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { formatearNumeroCotizacion, calcularTotalesCotizacion } from "@/utils/cotizacionUtils"

export async function crearCotizacion(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesion invalida' }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        // 1. Obtener configuración de numeración
        const [settings] = await connection.execute(
            `SELECT name, value FROM settings WHERE empresa_id = ? AND name IN ('cotizacion_prefijo', 'cotizacion_numero_actual')`,
            [empresaId]
        )

        const prefijo = settings.find(s => s.name === 'cotizacion_prefijo')?.value || 'COT'
        const numeroActual = settings.find(s => s.name === 'cotizacion_numero_actual')?.value || '1'
        const numeroCotizacion = formatearNumeroCotizacion(prefijo, numeroActual)

        // 2. Calcular totales
        const totales = calcularTotalesCotizacion(datos.productos)

        // 3. Insertar cotización
        const [resCot] = await connection.execute(
            `INSERT INTO cotizaciones (
                empresa_id, cliente_id, usuario_id, numero_cotizacion, 
                estado, subtotal, descuento, monto_gravado, itbis, total, 
                fecha_emision, fecha_vencimiento, observaciones
            ) VALUES (?, ?, ?, ?, 'borrador', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empresaId, datos.cliente_id, userId, numeroCotizacion,
                totales.subtotal, datos.descuento || 0, totales.monto_gravado,
                totales.itbis, totales.total, datos.fecha_emision,
                datos.fecha_vencimiento, datos.observaciones
            ]
        )

        const cotizacionId = resCot.insertId

        // 4. Insertar detalle
        for (const prod of datos.productos) {
            const lineTotales = calcularTotalesCotizacion([prod])
            await connection.execute(
                `INSERT INTO cotizacion_detalle (
                    cotizacion_id, producto_id, nombre_producto, descripcion_producto,
                    cantidad, precio_unitario, subtotal, aplica_itbis, 
                    monto_gravado, itbis, total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cotizacionId, prod.producto_id, prod.nombre_producto, prod.descripcion_producto,
                    prod.cantidad, prod.precio_unitario, lineTotales.subtotal, prod.aplica_itbis ? 1 : 0,
                    lineTotales.monto_gravado, lineTotales.itbis, lineTotales.total
                ]
            )
        }

        // 5. Actualizar número actual en settings
        await connection.execute(
            `UPDATE settings SET value = ? WHERE empresa_id = ? AND name = 'cotizacion_numero_actual'`,
            [(parseInt(numeroActual) + 1).toString(), empresaId]
        )

        await connection.commit()
        connection.release()

        return { success: true, mensaje: 'Cotización creada exitosamente', id: cotizacionId }

    } catch (error) {
        console.error('Error al crear cotización:', error)
        if (connection) {
            await connection.rollback()
            connection.release()
        }
        return { success: false, mensaje: 'Error al crear la cotización' }
    }
}

export async function obtenerCotizaciones(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()

        let query = `
            SELECT c.*, cl.nombre as cliente_nombre, u.nombre as usuario_nombre
            FROM cotizaciones c
            LEFT JOIN clientes cl ON c.cliente_id = cl.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.empresa_id = ?
        `
        const params = [empresaId]

        if (filtros.estado && filtros.estado !== 'todos') {
            query += " AND c.estado = ?"
            params.push(filtros.estado)
        }

        if (filtros.buscar) {
            query += " AND (c.numero_cotizacion LIKE ? OR cl.nombre LIKE ?)"
            params.push(`%${filtros.buscar}%`, `%${filtros.buscar}%`)
        }

        query += " ORDER BY c.created_at DESC"

        const [rows] = await connection.execute(query, params)
        connection.release()

        return { success: true, cotizaciones: rows }

    } catch (error) {
        console.error('Error al obtener cotizaciones:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar cotizaciones' }
    }
}

export async function obtenerCotizacionPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()

        const [cot] = await connection.execute(
            `SELECT c.*, cl.nombre as cliente_nombre, cl.numero_documento as cliente_documento, cl.telefono as cliente_telefono
             FROM cotizaciones c
             LEFT JOIN clientes cl ON c.cliente_id = cl.id
             WHERE c.id = ? AND c.empresa_id = ?`,
            [id, empresaId]
        )

        if (cot.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Cotización no encontrada' }
        }

        const [detalle] = await connection.execute(
            `SELECT cd.*, p.codigo_barras
             FROM cotizacion_detalle cd
             LEFT JOIN productos p ON cd.producto_id = p.id
             WHERE cd.cotizacion_id = ?`,
            [id]
        )

        connection.release()

        return { success: true, cotizacion: cot[0], detalle }

    } catch (error) {
        console.error('Error al obtener detalle de cotización:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar la cotización' }
    }
}

export async function actualizarEstadoCotizacion(id, estado) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()
        await connection.execute(
            `UPDATE cotizaciones SET estado = ? WHERE id = ? AND empresa_id = ?`,
            [estado, id, empresaId]
        )
        connection.release()

        return { success: true, mensaje: 'Estado actualizado' }

    } catch (error) {
        console.error('Error al actualizar estado:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al actualizar estado' }
    }
}
