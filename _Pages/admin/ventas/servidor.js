"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

export async function obtenerDatosCaja() {
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

        const fechaHoy = new Date().toISOString().split('T')[0]

        const [cajas] = await connection.execute(
            `SELECT 
                id,
                numero_caja,
                fecha_caja,
                monto_inicial,
                monto_final,
                total_ventas,
                total_efectivo,
                total_tarjeta_debito,
                total_tarjeta_credito,
                total_transferencia,
                total_cheque,
                total_gastos,
                diferencia,
                estado,
                fecha_apertura,
                fecha_cierre
            FROM cajas
            WHERE empresa_id = ? 
            AND usuario_id = ? 
            AND fecha_caja = ?
            AND estado = 'abierta'
            ORDER BY fecha_apertura DESC
            LIMIT 1`,
            [empresaId, userId, fechaHoy]
        )

        connection.release()

        if (cajas.length > 0) {
            return {
                success: true,
                cajaAbierta: true,
                caja: cajas[0]
            }
        } else {
            return {
                success: true,
                cajaAbierta: false
            }
        }

    } catch (error) {
        console.error('Error al obtener datos de caja:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al verificar estado de caja'
        }
    }
}

export async function abrirCaja(montoInicial) {
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

        const fechaHoy = new Date().toISOString().split('T')[0]

        const [cajaExistente] = await connection.execute(
            `SELECT id FROM cajas 
            WHERE empresa_id = ? 
            AND usuario_id = ? 
            AND fecha_caja = ?
            AND estado = 'abierta'`,
            [empresaId, userId, fechaHoy]
        )

        if (cajaExistente.length > 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'Ya existe una caja abierta para hoy'
            }
        }

        const [ultimaCaja] = await connection.execute(
            `SELECT MAX(numero_caja) as ultimo_numero
            FROM cajas
            WHERE empresa_id = ?`,
            [empresaId]
        )

        const numeroCaja = (ultimaCaja[0].ultimo_numero || 0) + 1

        const [resultado] = await connection.execute(
            `INSERT INTO cajas (
                empresa_id,
                usuario_id,
                numero_caja,
                fecha_caja,
                monto_inicial,
                estado
            ) VALUES (?, ?, ?, ?, ?, 'abierta')`,
            [empresaId, userId, numeroCaja, fechaHoy, montoInicial]
        )

        const [nuevaCaja] = await connection.execute(
            `SELECT 
                id,
                numero_caja,
                fecha_caja,
                monto_inicial,
                monto_final,
                total_ventas,
                estado,
                fecha_apertura
            FROM cajas
            WHERE id = ?`,
            [resultado.insertId]
        )

        connection.release()

        return {
            success: true,
            mensaje: 'Caja abierta exitosamente',
            caja: nuevaCaja[0]
        }

    } catch (error) {
        console.error('Error al abrir caja:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al abrir la caja'
        }
    }
}

export async function obtenerVentas(pagina = 1, limite = 10, filtroEstado = 'todos', filtroMetodo = 'todos', fechaInicio = null, fechaFin = null) {
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

        // Validar y normalizar parámetros
        const paginaNum = Math.max(1, parseInt(pagina) || 1)
        const limiteNum = Math.max(1, Math.min(100, parseInt(limite) || 10))
        const offset = (paginaNum - 1) * limiteNum

        connection = await db.getConnection()

        // Construir condiciones WHERE
        const condiciones = ['v.empresa_id = ?']
        const parametros = [empresaId]

        if (filtroEstado !== 'todos') {
            condiciones.push('v.estado = ?')
            parametros.push(filtroEstado)
        }

        if (filtroMetodo !== 'todos') {
            condiciones.push('v.metodo_pago = ?')
            parametros.push(filtroMetodo)
        }

        if (fechaInicio) {
            condiciones.push('DATE(v.fecha_venta) >= ?')
            parametros.push(fechaInicio)
        }

        if (fechaFin) {
            condiciones.push('DATE(v.fecha_venta) <= ?')
            parametros.push(fechaFin)
        }

        const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : 'WHERE v.empresa_id = ?'

        // Obtener total de ventas para paginación
        const [totalResult] = await connection.execute(
            `SELECT COUNT(*) as total
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            LEFT JOIN tipos_comprobante tc ON v.tipo_comprobante_id = tc.id
            ${whereClause}`,
            parametros
        )

        const totalVentas = totalResult[0].total
        const totalPaginas = Math.ceil(totalVentas / limiteNum)

        // Obtener ventas paginadas
        const [ventas] = await connection.execute(
            `SELECT 
                v.id,
                v.ncf,
                v.numero_interno,
                v.subtotal,
                v.descuento,
                v.monto_gravado,
                v.itbis,
                v.total,
                v.metodo_pago,
                v.efectivo_recibido,
                v.cambio,
                v.estado,
                v.tipo_entrega,
                v.despacho_completo,
                v.razon_anulacion,
                v.fecha_venta,
                c.nombre as cliente_nombre,
                c.numero_documento as cliente_documento,
                u.nombre as vendedor_nombre,
                tc.nombre as tipo_comprobante
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            LEFT JOIN tipos_comprobante tc ON v.tipo_comprobante_id = tc.id
            ${whereClause}
            ORDER BY v.fecha_venta DESC
            LIMIT ? OFFSET ?`,
            [...parametros, limiteNum, offset]
        )

        connection.release()

        return {
            success: true,
            ventas: ventas,
            paginacion: {
                pagina: paginaNum,
                limite: limiteNum,
                total: totalVentas,
                totalPaginas: totalPaginas
            }
        }

    } catch (error) {
        console.error('Error al obtener ventas:', error)
        
        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar ventas'
        }
    }
}

export async function anularVenta(ventaId, razonAnulacion) {
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
        await connection.beginTransaction()

        const [venta] = await connection.execute(
            `SELECT id, estado, empresa_id FROM ventas WHERE id = ? AND empresa_id = ?`,
            [ventaId, empresaId]
        )

        if (venta.length === 0) {
            await connection.rollback()
            connection.release()
            return {
                success: false,
                mensaje: 'Venta no encontrada'
            }
        }

        if (venta[0].estado === 'anulada') {
            await connection.rollback()
            connection.release()
            return {
                success: false,
                mensaje: 'Esta venta ya esta anulada'
            }
        }

        const [detalles] = await connection.execute(
            `SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = ?`,
            [ventaId]
        )

        for (const detalle of detalles) {
            await connection.execute(
                `UPDATE productos 
                SET stock = stock + ? 
                WHERE id = ? AND empresa_id = ?`,
                [detalle.cantidad, detalle.producto_id, empresaId]
            )

            const [producto] = await connection.execute(
                `SELECT stock FROM productos WHERE id = ?`,
                [detalle.producto_id]
            )

            await connection.execute(
                `INSERT INTO movimientos_inventario (
                    empresa_id,
                    producto_id,
                    tipo,
                    cantidad,
                    stock_anterior,
                    stock_nuevo,
                    referencia,
                    usuario_id,
                    notas
                ) VALUES (?, ?, 'devolucion', ?, ?, ?, ?, ?, ?)`,
                [
                    empresaId,
                    detalle.producto_id,
                    detalle.cantidad,
                    producto[0].stock - detalle.cantidad,
                    producto[0].stock,
                    `Venta anulada #${ventaId}`,
                    userId,
                    razonAnulacion
                ]
            )
        }

        await connection.execute(
            `UPDATE ventas 
            SET estado = 'anulada', razon_anulacion = ? 
            WHERE id = ? AND empresa_id = ?`,
            [razonAnulacion, ventaId, empresaId]
        )

        await connection.commit()
        connection.release()

        return {
            success: true,
            mensaje: 'Venta anulada exitosamente'
        }

    } catch (error) {
        console.error('Error al anular venta:', error)
        
        if (connection) {
            await connection.rollback()
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al anular la venta'
        }
    }
}