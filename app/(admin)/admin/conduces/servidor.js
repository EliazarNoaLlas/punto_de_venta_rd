"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { formatearNumeroConduce } from "@/utils/conduceUtils"

export async function crearConduce(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()
        await connection.beginTransaction()

        // 1. Obtener numeración
        const [settings] = await connection.execute(
            `SELECT name, value FROM settings WHERE empresa_id = ? AND name IN ('conduce_prefijo', 'conduce_numero_actual')`,
            [empresaId]
        )
        const prefijo = settings.find(s => s.name === 'conduce_prefijo')?.value || 'COND'
        const numeroActual = settings.find(s => s.name === 'conduce_numero_actual')?.value || '1'
        const numeroConduce = formatearNumeroConduce(prefijo, numeroActual)

        // 2. Insertar conduce
        const [resCon] = await connection.execute(
            `INSERT INTO conduces (
                empresa_id, tipo_origen, origen_id, numero_origen,
                numero_conduce, fecha_conduce, cliente_id, usuario_id,
                chofer, vehiculo, placa, estado, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'emitido', ?)`,
            [
                empresaId, datos.tipo_origen, datos.origen_id, datos.numero_origen,
                numeroConduce, datos.fecha_conduce, datos.cliente_id, userId,
                datos.chofer, datos.vehiculo, datos.placa, datos.observaciones
            ]
        )
        const conduceId = resCon.insertId

        // 3. Procesar detalles y actualizar saldos
        for (const item of datos.productos) {
            // Insertar detalle
            await connection.execute(
                `INSERT INTO conduce_detalle (conduce_id, producto_id, nombre_producto, cantidad_despachada)
                 VALUES (?, ?, ?, ?)`,
                [conduceId, item.producto_id, item.nombre_producto, item.cantidad_a_despachar]
            )

            // Actualizar saldo_despacho
            await connection.execute(
                `UPDATE saldo_despacho 
                 SET cantidad_despachada = cantidad_despachada + ?, 
                     cantidad_pendiente = cantidad_pendiente - ?
                 WHERE empresa_id = ? AND tipo_origen = ? AND origen_id = ? AND producto_id = ?`,
                [
                    item.cantidad_a_despachar, item.cantidad_a_despachar,
                    empresaId, datos.tipo_origen, datos.origen_id, item.producto_id
                ]
            )
        }

        // 4. Actualizar numeración
        await connection.execute(
            `UPDATE settings SET value = ? WHERE empresa_id = ? AND name = 'conduce_numero_actual'`,
            [(parseInt(numeroActual) + 1).toString(), empresaId]
        )

        await connection.commit()
        connection.release()
        return { success: true, mensaje: 'Conduce creado exitosamente', id: conduceId }

    } catch (error) {
        console.error('Error al crear conduce:', error)
        if (connection) {
            await connection.rollback()
            connection.release()
        }
        return { success: false, mensaje: 'Error al crear el conduce' }
    }
}

export async function listarConduces(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        if (!empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()
        let query = `
            SELECT c.*, cl.nombre as cliente_nombre, u.nombre as usuario_nombre
            FROM conduces c
            LEFT JOIN clientes cl ON c.cliente_id = cl.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.empresa_id = ?
        `
        const params = [empresaId]

        if (filtros.buscar) {
            query += " AND (c.numero_conduce LIKE ? OR c.numero_origen LIKE ? OR cl.nombre LIKE ?)"
            params.push(`%${filtros.buscar}%`, `%${filtros.buscar}%`, `%${filtros.buscar}%`)
        }

        query += " ORDER BY c.created_at DESC"
        const [rows] = await connection.execute(query, params)
        connection.release()

        return { success: true, conduces: rows }
    } catch (error) {
        console.error('Error al listar conduces:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar conduces' }
    }
}

export async function obtenerSaldoPendiente(tipoOrigen, origenId) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        if (!empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()

        // Primero verificamos si hay registros en saldo_despacho
        const [saldos] = await connection.execute(
            `SELECT sd.*, p.nombre as nombre_producto, p.unidad_medida
             FROM saldo_despacho sd
             JOIN productos p ON sd.producto_id = p.id
             WHERE sd.empresa_id = ? AND sd.tipo_origen = ? AND sd.origen_id = ?`,
            [empresaId, tipoOrigen, origenId]
        )

        // Si no hay saldos y es una Venta, los inicializamos (esto puede ocurrir la primera vez que se despacha una venta)
        if (saldos.length === 0 && tipoOrigen === 'venta') {
            const [detallesVenta] = await connection.execute(
                `SELECT dv.producto_id, dv.cantidad, p.nombre as nombre_producto
                 FROM detalle_ventas dv
                 JOIN productos p ON dv.producto_id = p.id
                 WHERE dv.venta_id = ?`,
                [origenId]
            )

            for (const item of detallesVenta) {
                await connection.execute(
                    `INSERT IGNORE INTO saldo_despacho (empresa_id, tipo_origen, origen_id, producto_id, cantidad_total, cantidad_pendiente)
                     VALUES (?, 'venta', ?, ?, ?, ?)`,
                    [empresaId, origenId, item.producto_id, item.cantidad, item.cantidad]
                )
            }

            // Volvemos a consultar
            const [nuevosSaldos] = await connection.execute(
                `SELECT sd.*, p.nombre as nombre_producto
                 FROM saldo_despacho sd
                 JOIN productos p ON sd.producto_id = p.id
                 WHERE sd.empresa_id = ? AND sd.tipo_origen = ? AND sd.origen_id = ?`,
                [empresaId, tipoOrigen, origenId]
            )
            connection.release()
            return { success: true, saldos: nuevosSaldos }
        }

        return { success: true, saldos }

    } catch (error) {
        console.error('Error al obtener saldos:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al verificar saldos' }
    }
}

export async function obtenerDetalleConduce(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        if (!empresaId) return { success: false, mensaje: 'Sesion invalida' }

        connection = await db.getConnection()

        const [con] = await connection.execute(
            `SELECT c.*, cl.nombre as cliente_nombre
             FROM conduces c
             LEFT JOIN clientes cl ON c.cliente_id = cl.id
             WHERE c.id = ? AND c.empresa_id = ?`,
            [id, empresaId]
        )

        if (con.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Conduce no encontrado' }
        }

        const [detalle] = await connection.execute(
            `SELECT cd.*, p.codigo_barras
             FROM conduce_detalle cd
             LEFT JOIN productos p ON cd.producto_id = p.id
             WHERE cd.conduce_id = ?`,
            [id]
        )

        connection.release()
        return { success: true, conduce: con[0], detalle }
    } catch (error) {
        console.error('Error al obtener detalle de conduce:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar el conduce' }
    }
}
