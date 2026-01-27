"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

/**
 * Obtiene la lista de activos rastreables con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Object} { success: boolean, activos: Array, mensaje?: string }
 */
export async function obtenerActivos(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        let query = `
            SELECT a.*,
                   p.nombre as producto_nombre,
                   p.sku as producto_sku,
                   p.tipo_activo,
                   cl.nombre as cliente_nombre,
                   cl.apellidos as cliente_apellidos,
                   cl.numero_documento as cliente_documento,
                   cl.telefono as cliente_telefono,
                   c.numero_contrato,
                   c.saldo_pendiente as contrato_saldo_pendiente
            FROM activos_productos a
            LEFT JOIN productos p ON a.producto_id = p.id
            LEFT JOIN clientes cl ON a.cliente_id = cl.id
            LEFT JOIN contratos_financiamiento c ON a.contrato_financiamiento_id = c.id
            WHERE a.empresa_id = ?
        `
        const params = [empresaId]

        // Filtro por estado
        if (filtros.estado) {
            query += ` AND a.estado = ?`
            params.push(filtros.estado)
        }

        // Filtro por producto
        if (filtros.producto_id) {
            query += ` AND a.producto_id = ?`
            params.push(filtros.producto_id)
        }

        // Filtro por cliente
        if (filtros.cliente_id) {
            query += ` AND a.cliente_id = ?`
            params.push(filtros.cliente_id)
        }

        // Filtro por contrato
        if (filtros.contrato_id) {
            query += ` AND a.contrato_financiamiento_id = ?`
            params.push(filtros.contrato_id)
        }

        // Búsqueda por número de serie, VIN, código o placa
        if (filtros.buscar) {
            query += ` AND (
                a.numero_serie LIKE ? OR 
                a.vin LIKE ? OR 
                a.codigo_activo LIKE ? OR 
                a.numero_placa LIKE ? OR
                p.nombre LIKE ? OR
                cl.nombre LIKE ?
            )`
            const busqueda = `%${filtros.buscar}%`
            params.push(busqueda, busqueda, busqueda, busqueda, busqueda, busqueda)
        }

        query += ` ORDER BY a.fecha_creacion DESC LIMIT 200`

        const [activos] = await connection.execute(query, params)

        connection.release()

        return { success: true, activos }

    } catch (error) {
        console.error('Error al obtener activos:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar activos', activos: [] }
    }
}

/**
 * Obtiene un activo por su ID
 * @param {number} id - ID del activo
 * @returns {Object} { success: boolean, activo?: Object, mensaje?: string }
 */
export async function obtenerActivoPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        const [activos] = await connection.execute(
            `SELECT a.*,
                   p.nombre as producto_nombre,
                   p.sku as producto_sku,
                   p.tipo_activo,
                   cl.nombre as cliente_nombre,
                   cl.apellidos as cliente_apellidos,
                   cl.numero_documento as cliente_documento,
                   cl.telefono as cliente_telefono,
                   cl.email as cliente_email,
                   c.numero_contrato,
                   c.saldo_pendiente as contrato_saldo_pendiente,
                   u.nombre as creado_por_nombre,
                   u2.nombre as modificado_por_nombre
            FROM activos_productos a
            LEFT JOIN productos p ON a.producto_id = p.id
            LEFT JOIN clientes cl ON a.cliente_id = cl.id
            LEFT JOIN contratos_financiamiento c ON a.contrato_financiamiento_id = c.id
            LEFT JOIN usuarios u ON a.creado_por = u.id
            LEFT JOIN usuarios u2 ON a.modificado_por = u2.id
            WHERE a.id = ? AND a.empresa_id = ?`,
            [id, empresaId]
        )

        if (activos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Activo no encontrado' }
        }

        const activo = activos[0]

        // Parsear JSON si existe
        if (activo.especificaciones_tecnicas) {
            try {
                activo.especificaciones_tecnicas = typeof activo.especificaciones_tecnicas === 'string' 
                    ? JSON.parse(activo.especificaciones_tecnicas)
                    : activo.especificaciones_tecnicas
            } catch (e) {
                activo.especificaciones_tecnicas = {}
            }
        }

        if (activo.documentos_json) {
            try {
                activo.documentos_json = typeof activo.documentos_json === 'string'
                    ? JSON.parse(activo.documentos_json)
                    : activo.documentos_json
            } catch (e) {
                activo.documentos_json = []
            }
        }

        connection.release()

        return {
            success: true,
            activo
        }

    } catch (error) {
        console.error('Error al obtener activo:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar activo' }
    }
}

/**
 * Crea un nuevo activo rastreable
 * @param {Object} datos - Datos del activo
 * @returns {Object} { success: boolean, activo_id?: number, mensaje?: string }
 */
export async function crearActivo(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validaciones básicas
        if (!datos.producto_id) {
            return { success: false, mensaje: 'El producto es requerido' }
        }

        connection = await db.getConnection()

        // Generar código de activo si no se proporciona
        let codigoActivo = datos.codigo_activo
        if (!codigoActivo) {
            const [ultimoActivo] = await connection.execute(
                `SELECT codigo_activo FROM activos_productos
                 WHERE empresa_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [empresaId]
            )

            let secuencia = 1
            if (ultimoActivo.length > 0) {
                const ultimoCod = ultimoActivo[0].codigo_activo
                const match = ultimoCod.match(/ACT-(\d+)/)
                if (match) {
                    secuencia = parseInt(match[1]) + 1
                }
            }

            codigoActivo = `ACT-${String(secuencia).padStart(6, '0')}`
        }

        // Validar unicidad de número de serie si se proporciona
        if (datos.numero_serie) {
            const [serieExistente] = await connection.execute(
                `SELECT id FROM activos_productos
                 WHERE numero_serie = ? AND empresa_id = ?`,
                [datos.numero_serie, empresaId]
            )

            if (serieExistente.length > 0) {
                connection.release()
                return { success: false, mensaje: 'El número de serie ya existe' }
            }
        }

        // Validar unicidad de VIN si se proporciona
        if (datos.vin) {
            const [vinExistente] = await connection.execute(
                `SELECT id FROM activos_productos
                 WHERE vin = ? AND empresa_id = ?`,
                [datos.vin, empresaId]
            )

            if (vinExistente.length > 0) {
                connection.release()
                return { success: false, mensaje: 'El VIN ya existe' }
            }
        }

        // Insertar activo
        const [result] = await connection.execute(
            `INSERT INTO activos_productos (
                empresa_id, producto_id, codigo_activo, numero_serie,
                vin, numero_motor, numero_placa, color, anio_fabricacion,
                especificaciones_tecnicas, estado, fecha_compra, precio_compra,
                ubicacion, observaciones, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empresaId,
                datos.producto_id,
                codigoActivo,
                datos.numero_serie || null,
                datos.vin || null,
                datos.numero_motor || null,
                datos.numero_placa || null,
                datos.color || null,
                datos.anio_fabricacion || null,
                datos.especificaciones_tecnicas ? JSON.stringify(datos.especificaciones_tecnicas) : null,
                datos.estado || 'en_stock',
                datos.fecha_compra || null,
                datos.precio_compra || null,
                datos.ubicacion || null,
                datos.observaciones || null,
                userId
            ]
        )

        connection.release()

        return {
            success: true,
            activo_id: result.insertId,
            codigo_activo: codigoActivo,
            mensaje: 'Activo creado exitosamente'
        }

    } catch (error) {
        console.error('Error al crear activo:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al crear activo: ' + error.message }
    }
}

/**
 * Actualiza un activo existente
 * @param {number} id - ID del activo
 * @param {Object} datos - Datos a actualizar
 * @returns {Object} { success: boolean, mensaje?: string }
 */
export async function actualizarActivo(id, datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()

        // Verificar que el activo existe
        const [activos] = await connection.execute(
            `SELECT id FROM activos_productos 
             WHERE id = ? AND empresa_id = ?`,
            [id, empresaId]
        )

        if (activos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Activo no encontrado' }
        }

        // Validar unicidad de número de serie si se está actualizando
        if (datos.numero_serie) {
            const [serieExistente] = await connection.execute(
                `SELECT id FROM activos_productos
                 WHERE numero_serie = ? AND empresa_id = ? AND id != ?`,
                [datos.numero_serie, empresaId, id]
            )

            if (serieExistente.length > 0) {
                connection.release()
                return { success: false, mensaje: 'El número de serie ya existe en otro activo' }
            }
        }

        // Validar unicidad de VIN si se está actualizando
        if (datos.vin) {
            const [vinExistente] = await connection.execute(
                `SELECT id FROM activos_productos
                 WHERE vin = ? AND empresa_id = ? AND id != ?`,
                [datos.vin, empresaId, id]
            )

            if (vinExistente.length > 0) {
                connection.release()
                return { success: false, mensaje: 'El VIN ya existe en otro activo' }
            }
        }

        // Construir query de actualización dinámicamente
        const campos = []
        const valores = []

        if (datos.numero_serie !== undefined) {
            campos.push('numero_serie = ?')
            valores.push(datos.numero_serie || null)
        }

        if (datos.vin !== undefined) {
            campos.push('vin = ?')
            valores.push(datos.vin || null)
        }

        if (datos.numero_motor !== undefined) {
            campos.push('numero_motor = ?')
            valores.push(datos.numero_motor || null)
        }

        if (datos.numero_placa !== undefined) {
            campos.push('numero_placa = ?')
            valores.push(datos.numero_placa || null)
        }

        if (datos.color !== undefined) {
            campos.push('color = ?')
            valores.push(datos.color || null)
        }

        if (datos.anio_fabricacion !== undefined) {
            campos.push('anio_fabricacion = ?')
            valores.push(datos.anio_fabricacion || null)
        }

        if (datos.especificaciones_tecnicas !== undefined) {
            campos.push('especificaciones_tecnicas = ?')
            valores.push(datos.especificaciones_tecnicas ? JSON.stringify(datos.especificaciones_tecnicas) : null)
        }

        if (datos.estado !== undefined) {
            campos.push('estado = ?')
            valores.push(datos.estado)
        }

        if (datos.fecha_compra !== undefined) {
            campos.push('fecha_compra = ?')
            valores.push(datos.fecha_compra || null)
        }

        if (datos.precio_compra !== undefined) {
            campos.push('precio_compra = ?')
            valores.push(datos.precio_compra || null)
        }

        if (datos.fecha_venta !== undefined) {
            campos.push('fecha_venta = ?')
            valores.push(datos.fecha_venta || null)
        }

        if (datos.precio_venta !== undefined) {
            campos.push('precio_venta = ?')
            valores.push(datos.precio_venta || null)
        }

        if (datos.cliente_id !== undefined) {
            campos.push('cliente_id = ?')
            valores.push(datos.cliente_id || null)
        }

        if (datos.contrato_financiamiento_id !== undefined) {
            campos.push('contrato_financiamiento_id = ?')
            valores.push(datos.contrato_financiamiento_id || null)
        }

        if (datos.ubicacion !== undefined) {
            campos.push('ubicacion = ?')
            valores.push(datos.ubicacion || null)
        }

        if (datos.observaciones !== undefined) {
            campos.push('observaciones = ?')
            valores.push(datos.observaciones || null)
        }

        if (datos.fecha_ultimo_mantenimiento !== undefined) {
            campos.push('fecha_ultimo_mantenimiento = ?')
            valores.push(datos.fecha_ultimo_mantenimiento || null)
        }

        if (datos.fecha_proximo_mantenimiento !== undefined) {
            campos.push('fecha_proximo_mantenimiento = ?')
            valores.push(datos.fecha_proximo_mantenimiento || null)
        }

        if (datos.notas_mantenimiento !== undefined) {
            campos.push('notas_mantenimiento = ?')
            valores.push(datos.notas_mantenimiento || null)
        }

        if (campos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'No hay campos para actualizar' }
        }

        // Agregar modificado_por y fecha_actualizacion
        campos.push('modificado_por = ?')
        valores.push(userId)

        valores.push(id)

        await connection.execute(
            `UPDATE activos_productos 
             SET ${campos.join(', ')}
             WHERE id = ?`,
            valores
        )

        connection.release()

        return { success: true, mensaje: 'Activo actualizado exitosamente' }

    } catch (error) {
        console.error('Error al actualizar activo:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al actualizar activo: ' + error.message }
    }
}

/**
 * Obtiene estadísticas de activos
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} { success: boolean, estadisticas?: Object, mensaje?: string }
 */
export async function obtenerEstadisticasActivos(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        let whereClause = 'WHERE a.empresa_id = ?'
        const params = [empresaId]

        if (filtros.fecha_desde) {
            whereClause += ' AND a.fecha_creacion >= ?'
            params.push(filtros.fecha_desde)
        }

        if (filtros.fecha_hasta) {
            whereClause += ' AND a.fecha_creacion <= ?'
            params.push(filtros.fecha_hasta)
        }

        // Estadísticas generales
        const [estadisticas] = await connection.execute(
            `SELECT 
                COUNT(*) as total_activos,
                SUM(CASE WHEN a.estado = 'en_stock' THEN 1 ELSE 0 END) as activos_en_stock,
                SUM(CASE WHEN a.estado = 'vendido' THEN 1 ELSE 0 END) as activos_vendidos,
                SUM(CASE WHEN a.estado = 'financiado' THEN 1 ELSE 0 END) as activos_financiados,
                SUM(CASE WHEN a.estado = 'asignado' THEN 1 ELSE 0 END) as activos_asignados,
                SUM(CASE WHEN a.estado = 'devuelto' THEN 1 ELSE 0 END) as activos_devueltos,
                SUM(CASE WHEN a.estado = 'mantenimiento' THEN 1 ELSE 0 END) as activos_mantenimiento,
                SUM(CASE WHEN a.estado = 'dado_baja' THEN 1 ELSE 0 END) as activos_dado_baja,
                SUM(a.precio_compra) as total_inversion,
                SUM(a.precio_venta) as total_ventas
             FROM activos_productos a
             ${whereClause}`,
            params
        )

        connection.release()

        return {
            success: true,
            estadisticas: estadisticas[0]
        }

    } catch (error) {
        console.error('Error al obtener estadísticas:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar estadísticas' }
    }
}

