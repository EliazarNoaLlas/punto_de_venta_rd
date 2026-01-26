"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'

// =====================================================
// RE-EXPORT TEMPORAL: Funciones de Planes
// =====================================================
// Durante la migración, re-exportamos desde el nuevo módulo
// para mantener compatibilidad con código existente.
// TODO: Eliminar estos re-exports después de migrar todos los imports
// =====================================================

// Re-exportar funciones de planes desde el nuevo módulo
export {
    obtenerPlanesFinanciamiento,
    obtenerPlanPorId,
    crearPlanFinanciamiento,
    actualizarPlanFinanciamiento,
    eliminarPlanFinanciamiento
} from '../planes/servidor.js'

// Re-exportar funciones de contratos desde el nuevo módulo
export {
    obtenerContratos,
    obtenerContratoPorId,
    obtenerCuotasPorContrato,
    crearContratoFinanciamiento,
    actualizarContratoFinanciamiento,
    cancelarContratoFinanciamiento
} from '../contratos/servidor.js'

// =====================================================
// FUNCIONES ORIGINALES (DEPRECADAS - MIGRAR A MÓDULOS)
// =====================================================

/**
 * @deprecated Esta función ha sido movida a planes/servidor.js
 * Usar: import { obtenerPlanesFinanciamiento } from '@/Pages/admin/planes/servidor'
 * 
 * Obtiene la lista de planes de financiamiento con filtros
 */
export async function obtenerPlanesFinanciamiento_OLD(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        let query = `
            SELECT p.*, 
                   u.nombre as creado_por_nombre,
                   u2.nombre as modificado_por_nombre
            FROM planes_financiamiento p
            LEFT JOIN usuarios u ON p.creado_por = u.id
            LEFT JOIN usuarios u2 ON p.modificado_por = u2.id
            WHERE (p.empresa_id = ? OR p.empresa_id IS NULL)
        `
        const params = [empresaId]

        // Filtro por estado activo
        if (filtros.activo !== undefined) {
            query += ` AND p.activo = ?`
            params.push(filtros.activo ? 1 : 0)
        }

        // Búsqueda por nombre o código
        if (filtros.buscar) {
            query += ` AND (p.nombre LIKE ? OR p.codigo LIKE ?)`
            const busqueda = `%${filtros.buscar}%`
            params.push(busqueda, busqueda)
        }

        query += ` ORDER BY p.activo DESC, p.fecha_creacion DESC`

        const [planes] = await connection.execute(query, params)

        connection.release()

        return { success: true, planes }

    } catch (error) {
        console.error('Error al obtener planes de financiamiento:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar planes', planes: [] }
    }
}

/**
 * @deprecated Esta función ha sido movida a planes/servidor.js
 * Usar: import { crearPlanFinanciamiento } from '@/Pages/admin/planes/servidor'
 * 
 * Crea un nuevo plan de financiamiento
 */
export async function crearPlanFinanciamiento_OLD(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()

        // Validar que el código sea único
        const [codigoExistente] = await connection.execute(
            `SELECT id FROM planes_financiamiento WHERE codigo = ?`,
            [datos.codigo]
        )

        if (codigoExistente.length > 0) {
            connection.release()
            return { success: false, mensaje: 'El código del plan ya existe' }
        }

        // Insertar plan
        const [result] = await connection.execute(
            `INSERT INTO planes_financiamiento (
                empresa_id, codigo, nombre, descripcion, plazo_meses,
                tasa_interes_anual, pago_inicial_minimo_pct, monto_minimo,
                monto_maximo, penalidad_mora_pct, dias_gracia,
                descuento_pago_anticipado_pct, cuotas_minimas_anticipadas,
                activo, permite_pago_anticipado, requiere_fiador,
                creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                datos.empresa_id || empresaId,
                datos.codigo,
                datos.nombre,
                datos.descripcion || null,
                datos.plazo_meses,
                datos.tasa_interes_anual,
                datos.pago_inicial_minimo_pct || 15.00,
                datos.monto_minimo || 0.00,
                datos.monto_maximo || null,
                datos.penalidad_mora_pct || 5.00,
                datos.dias_gracia || 5,
                datos.descuento_pago_anticipado_pct || 0.00,
                datos.cuotas_minimas_anticipadas || 3.00,
                datos.activo !== undefined ? (datos.activo ? 1 : 0) : 1,
                datos.permite_pago_anticipado !== undefined ? (datos.permite_pago_anticipado ? 1 : 0) : 1,
                datos.requiere_fiador !== undefined ? (datos.requiere_fiador ? 1 : 0) : 0,
                userId
            ]
        )

        connection.release()

        return { success: true, id: result.insertId, mensaje: 'Plan creado exitosamente' }

    } catch (error) {
        console.error('Error al crear plan de financiamiento:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al crear plan: ' + error.message }
    }
}

/**
 * @deprecated Esta función ha sido movida a planes/servidor.js
 * Usar: import { actualizarPlanFinanciamiento } from '@/Pages/admin/planes/servidor'
 * 
 * Actualiza un plan de financiamiento
 */
export async function actualizarPlanFinanciamiento_OLD(id, datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()

        // Verificar que el plan existe y pertenece a la empresa
        const [planes] = await connection.execute(
            `SELECT id FROM planes_financiamiento 
             WHERE id = ? AND (empresa_id = ? OR empresa_id IS NULL)`,
            [id, empresaId]
        )

        if (planes.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Plan no encontrado' }
        }

        // Si se cambia el código, validar que sea único
        if (datos.codigo) {
            const [codigoExistente] = await connection.execute(
                `SELECT id FROM planes_financiamiento WHERE codigo = ? AND id != ?`,
                [datos.codigo, id]
            )

            if (codigoExistente.length > 0) {
                connection.release()
                return { success: false, mensaje: 'El código del plan ya existe' }
            }
        }

        // Construir query de actualización dinámicamente
        const campos = []
        const valores = []

        if (datos.nombre !== undefined) {
            campos.push('nombre = ?')
            valores.push(datos.nombre)
        }
        if (datos.descripcion !== undefined) {
            campos.push('descripcion = ?')
            valores.push(datos.descripcion)
        }
        if (datos.codigo !== undefined) {
            campos.push('codigo = ?')
            valores.push(datos.codigo)
        }
        if (datos.plazo_meses !== undefined) {
            campos.push('plazo_meses = ?')
            valores.push(datos.plazo_meses)
        }
        if (datos.tasa_interes_anual !== undefined) {
            campos.push('tasa_interes_anual = ?')
            valores.push(datos.tasa_interes_anual)
        }
        if (datos.pago_inicial_minimo_pct !== undefined) {
            campos.push('pago_inicial_minimo_pct = ?')
            valores.push(datos.pago_inicial_minimo_pct)
        }
        if (datos.monto_minimo !== undefined) {
            campos.push('monto_minimo = ?')
            valores.push(datos.monto_minimo)
        }
        if (datos.monto_maximo !== undefined) {
            campos.push('monto_maximo = ?')
            valores.push(datos.monto_maximo)
        }
        if (datos.penalidad_mora_pct !== undefined) {
            campos.push('penalidad_mora_pct = ?')
            valores.push(datos.penalidad_mora_pct)
        }
        if (datos.dias_gracia !== undefined) {
            campos.push('dias_gracia = ?')
            valores.push(datos.dias_gracia)
        }
        if (datos.descuento_pago_anticipado_pct !== undefined) {
            campos.push('descuento_pago_anticipado_pct = ?')
            valores.push(datos.descuento_pago_anticipado_pct)
        }
        if (datos.cuotas_minimas_anticipadas !== undefined) {
            campos.push('cuotas_minimas_anticipadas = ?')
            valores.push(datos.cuotas_minimas_anticipadas)
        }
        if (datos.activo !== undefined) {
            campos.push('activo = ?')
            valores.push(datos.activo ? 1 : 0)
        }
        if (datos.permite_pago_anticipado !== undefined) {
            campos.push('permite_pago_anticipado = ?')
            valores.push(datos.permite_pago_anticipado ? 1 : 0)
        }
        if (datos.requiere_fiador !== undefined) {
            campos.push('requiere_fiador = ?')
            valores.push(datos.requiere_fiador ? 1 : 0)
        }

        campos.push('modificado_por = ?')
        valores.push(userId)

        valores.push(id)

        await connection.execute(
            `UPDATE planes_financiamiento 
             SET ${campos.join(', ')}
             WHERE id = ?`,
            valores
        )

        connection.release()

        return { success: true, mensaje: 'Plan actualizado exitosamente' }

    } catch (error) {
        console.error('Error al actualizar plan de financiamiento:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al actualizar plan: ' + error.message }
    }
}

/**
 * Obtiene la lista de contratos de financiamiento con filtros
 */
export async function obtenerContratos(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        const pagina = filtros.pagina || 1
        const limite = filtros.limite || 20
        const offset = (pagina - 1) * limite

        let query = `
            SELECT c.*,
                   cl.nombre as cliente_nombre,
                   cl.numero_documento as cliente_documento,
                   cl.telefono as cliente_telefono,
                   p.nombre as plan_nombre,
                   u.nombre as vendedor_nombre
            FROM contratos_financiamiento c
            LEFT JOIN clientes cl ON c.cliente_id = cl.id
            LEFT JOIN planes_financiamiento p ON c.plan_id = p.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.empresa_id = ?
        `
        const params = [empresaId]

        // Filtro por estado
        if (filtros.estado) {
            query += ` AND c.estado = ?`
            params.push(filtros.estado)
        }

        // Búsqueda por número de contrato, cliente o NCF
        if (filtros.buscar) {
            query += ` AND (c.numero_contrato LIKE ? OR cl.nombre LIKE ? OR c.ncf LIKE ?)`
            const busqueda = `%${filtros.buscar}%`
            params.push(busqueda, busqueda, busqueda)
        }

        // Filtro por cliente
        if (filtros.cliente_id) {
            query += ` AND c.cliente_id = ?`
            params.push(filtros.cliente_id)
        }

        // Contar total
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
        const [countResult] = await connection.execute(countQuery, params)
        const total = countResult[0].total

        query += ` ORDER BY c.fecha_creacion DESC LIMIT ? OFFSET ?`
        params.push(limite, offset)

        const [contratos] = await connection.execute(query, params)

        connection.release()

        return {
            success: true,
            contratos,
            paginacion: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        }

    } catch (error) {
        console.error('Error al obtener contratos:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar contratos', contratos: [] }
    }
}

/**
 * Obtiene el detalle completo de un contrato
 */
export async function obtenerContratoPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        const [contratos] = await connection.execute(
            `SELECT c.*,
                   cl.nombre as cliente_nombre,
                   cl.apellidos as cliente_apellidos,
                   cl.numero_documento as cliente_documento,
                   cl.telefono as cliente_telefono,
                   cl.email as cliente_email,
                   cl.direccion as cliente_direccion,
                   p.nombre as plan_nombre,
                   p.codigo as plan_codigo,
                   u.nombre as vendedor_nombre,
                   v.numero_interno as venta_numero
            FROM contratos_financiamiento c
            LEFT JOIN clientes cl ON c.cliente_id = cl.id
            LEFT JOIN planes_financiamiento p ON c.plan_id = p.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            LEFT JOIN ventas v ON c.venta_id = v.id
            WHERE c.id = ? AND c.empresa_id = ?`,
            [id, empresaId]
        )

        if (contratos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Contrato no encontrado' }
        }

        const contrato = contratos[0]

        // Obtener cuotas del contrato
        const [cuotas] = await connection.execute(
            `SELECT * FROM cuotas_financiamiento
             WHERE contrato_id = ?
             ORDER BY numero_cuota ASC`,
            [id]
        )

        // Obtener pagos del contrato
        const [pagos] = await connection.execute(
            `SELECT p.*, u.nombre as registrado_por_nombre
             FROM pagos_financiamiento p
             LEFT JOIN usuarios u ON p.registrado_por = u.id
             WHERE p.contrato_id = ?
             ORDER BY p.fecha_pago DESC`,
            [id]
        )

        // Obtener activos asociados
        const [activos] = await connection.execute(
            `SELECT a.*, pr.nombre as producto_nombre
             FROM activos_productos a
             LEFT JOIN productos pr ON a.producto_id = pr.id
             WHERE a.contrato_financiamiento_id = ?`,
            [id]
        )

        connection.release()

        return {
            success: true,
            contrato,
            cuotas,
            pagos,
            activos
        }

    } catch (error) {
        console.error('Error al obtener contrato:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar contrato' }
    }
}

/**
 * Obtiene las cuotas de un contrato
 */
export async function obtenerCuotasPorContrato(contratoId) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        // Verificar que el contrato pertenece a la empresa
        const [contratos] = await connection.execute(
            `SELECT id FROM contratos_financiamiento 
             WHERE id = ? AND empresa_id = ?`,
            [contratoId, empresaId]
        )

        if (contratos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Contrato no encontrado' }
        }

        const [cuotas] = await connection.execute(
            `SELECT * FROM cuotas_financiamiento
             WHERE contrato_id = ?
             ORDER BY numero_cuota ASC`,
            [contratoId]
        )

        connection.release()

        return { success: true, cuotas }

    } catch (error) {
        console.error('Error al obtener cuotas:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar cuotas', cuotas: [] }
    }
}

/**
 * Obtiene la lista de activos rastreables
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
                   cl.nombre as cliente_nombre,
                   c.numero_contrato
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

        // Búsqueda por número de serie, VIN o código
        if (filtros.buscar) {
            query += ` AND (a.numero_serie LIKE ? OR a.vin LIKE ? OR a.codigo_activo LIKE ?)`
            const busqueda = `%${filtros.buscar}%`
            params.push(busqueda, busqueda, busqueda)
        }

        query += ` ORDER BY a.fecha_creacion DESC LIMIT 100`

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
 * Obtiene las alertas de financiamiento
 */
export async function obtenerAlertas(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        let query = `
            SELECT a.*,
                   cl.nombre as cliente_nombre,
                   cl.telefono as cliente_telefono,
                   c.numero_contrato,
                   u.nombre as asignado_a_nombre
            FROM alertas_financiamiento a
            LEFT JOIN clientes cl ON a.cliente_id = cl.id
            LEFT JOIN contratos_financiamiento c ON a.contrato_id = c.id
            LEFT JOIN usuarios u ON a.asignado_a = u.id
            WHERE a.empresa_id = ?
        `
        const params = [empresaId]

        // Filtro por estado
        if (filtros.estado) {
            query += ` AND a.estado = ?`
            params.push(filtros.estado)
        }

        // Filtro por severidad
        if (filtros.severidad) {
            query += ` AND a.severidad = ?`
            params.push(filtros.severidad)
        }

        // Filtro por tipo
        if (filtros.tipo_alerta) {
            query += ` AND a.tipo_alerta = ?`
            params.push(filtros.tipo_alerta)
        }

        query += ` ORDER BY 
            CASE a.severidad
                WHEN 'critica' THEN 1
                WHEN 'alta' THEN 2
                WHEN 'media' THEN 3
                WHEN 'baja' THEN 4
            END,
            a.fecha_creacion DESC
            LIMIT 100`

        const [alertas] = await connection.execute(query, params)

        connection.release()

        return { success: true, alertas }

    } catch (error) {
        console.error('Error al obtener alertas:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar alertas', alertas: [] }
    }
}

/**
 * Obtiene métricas del dashboard de financiamiento
 */
export async function obtenerDashboardFinanciamiento() {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        // Contratos activos
        const [contratosActivos] = await connection.execute(
            `SELECT COUNT(*) as total FROM contratos_financiamiento
             WHERE empresa_id = ? AND estado = 'activo'`,
            [empresaId]
        )

        // Cuotas vencidas
        const [cuotasVencidas] = await connection.execute(
            `SELECT COUNT(*) as total FROM cuotas_financiamiento
             WHERE empresa_id = ? AND estado = 'vencida'`,
            [empresaId]
        )

        // Saldo pendiente total
        const [saldoPendiente] = await connection.execute(
            `SELECT COALESCE(SUM(saldo_pendiente), 0) as total
             FROM contratos_financiamiento
             WHERE empresa_id = ? AND estado = 'activo'`,
            [empresaId]
        )

        // Cobrado este mes
        const fechaInicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString().split('T')[0]

        const [cobradoMes] = await connection.execute(
            `SELECT COALESCE(SUM(monto_pago), 0) as total
             FROM pagos_financiamiento
             WHERE empresa_id = ? AND DATE(fecha_pago) >= ? AND estado = 'confirmado'`,
            [empresaId, fechaInicioMes]
        )

        // Alertas críticas
        const [alertasCriticas] = await connection.execute(
            `SELECT COUNT(*) as total FROM alertas_financiamiento
             WHERE empresa_id = ? AND severidad = 'critica' AND estado = 'activa'`,
            [empresaId]
        )

        connection.release()

        return {
            success: true,
            metricas: {
                contratosActivos: parseInt(contratosActivos[0].total),
                cuotasVencidas: parseInt(cuotasVencidas[0].total),
                saldoPendiente: parseFloat(saldoPendiente[0].total),
                cobradoMes: parseFloat(cobradoMes[0].total),
                alertasCriticas: parseInt(alertasCriticas[0].total)
            }
        }

    } catch (error) {
        console.error('Error al obtener dashboard:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar dashboard' }
    }
}

/**
 * Crea un nuevo contrato de financiamiento desde una venta
 * Esta función debe ejecutarse dentro de una transacción
 */
export async function crearContratoFinanciamiento(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            // Obtener plan
            const [planes] = await connection.execute(
                `SELECT * FROM planes_financiamiento WHERE id = ?`,
                [datos.plan_id]
            )

            if (planes.length === 0) {
                throw new Error('Plan de financiamiento no encontrado')
            }

            const plan = planes[0]

            // Calcular tasa mensual
            const tasaMensual = plan.tasa_interes_anual / 12 / 100

            // Obtener siguiente número de contrato
            const [ultimoContrato] = await connection.execute(
                `SELECT numero_contrato FROM contratos_financiamiento
                 WHERE empresa_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [empresaId]
            )

            let secuencia = 1
            if (ultimoContrato.length > 0) {
                const ultimoNum = ultimoContrato[0].numero_contrato
                const match = ultimoNum.match(/FIN-\d+-(\d+)/)
                if (match) {
                    secuencia = parseInt(match[1]) + 1
                }
            }

            const numeroContrato = `FIN-${new Date().getFullYear()}-${String(secuencia).padStart(5, '0')}`

            // Calcular amortización
            const { calcularAmortizacionFrancesa } = await import('@/utils/financiamientoUtils')
            const amortizacion = calcularAmortizacionFrancesa(
                datos.monto_financiado,
                tasaMensual,
                datos.numero_cuotas
            )

            // Insertar contrato
            const [resultContrato] = await connection.execute(
                `INSERT INTO contratos_financiamiento (
                    empresa_id, cliente_id, plan_id, usuario_id, numero_contrato,
                    numero_referencia, venta_id, ncf, precio_producto,
                    pago_inicial, monto_financiado, total_intereses,
                    total_a_pagar, numero_cuotas, monto_cuota,
                    tasa_interes_mensual, fecha_contrato, fecha_primer_pago,
                    fecha_ultimo_pago, monto_pagado, saldo_pendiente,
                    cuotas_pagadas, estado, clasificacion_riesgo,
                    nombre_fiador, documento_fiador, telefono_fiador,
                    notas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    empresaId,
                    datos.cliente_id,
                    datos.plan_id,
                    userId,
                    numeroContrato,
                    datos.numero_referencia || null,
                    datos.venta_id,
                    datos.ncf,
                    datos.precio_producto,
                    datos.pago_inicial,
                    datos.monto_financiado,
                    amortizacion.totalIntereses,
                    amortizacion.totalPagar,
                    datos.numero_cuotas,
                    amortizacion.cuotaMensual,
                    tasaMensual,
                    datos.fecha_contrato || new Date().toISOString().split('T')[0],
                    datos.fecha_primer_pago,
                    datos.fecha_ultimo_pago,
                    datos.pago_inicial || 0,
                    datos.monto_financiado,
                    0,
                    'activo',
                    datos.clasificacion_riesgo || 'medio',
                    datos.nombre_fiador || null,
                    datos.documento_fiador || null,
                    datos.telefono_fiador || null,
                    datos.notas || null
                ]
            )

            const contratoId = resultContrato.insertId

            // Generar cuotas
            const fechaInicio = new Date(datos.fecha_primer_pago)
            const cuotas = []

            amortizacion.cronograma.forEach((item, index) => {
                const fechaVencimiento = new Date(fechaInicio)
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + index)

                const fechaFinGracia = new Date(fechaVencimiento)
                fechaFinGracia.setDate(fechaFinGracia.getDate() + (plan.dias_gracia || 5))

                cuotas.push([
                    contratoId,
                    empresaId,
                    datos.cliente_id,
                    item.numero,
                    fechaVencimiento.toISOString().split('T')[0],
                    fechaFinGracia.toISOString().split('T')[0],
                    item.capital,
                    item.interes,
                    item.cuota,
                    item.saldoRestante,
                    0,
                    0,
                    item.cuota,
                    'pendiente',
                    0
                ])
            })

            // Insertar todas las cuotas
            await connection.query(
                `INSERT INTO cuotas_financiamiento (
                    contrato_id, empresa_id, cliente_id, numero_cuota,
                    fecha_vencimiento, fecha_fin_gracia, monto_capital,
                    monto_interes, monto_cuota, saldo_restante,
                    monto_pagado, monto_mora, total_a_pagar, estado, dias_atraso
                ) VALUES ?`,
                [cuotas]
            )

            // Si hay activos asociados, actualizarlos
            if (datos.activos && datos.activos.length > 0) {
                for (const activoId of datos.activos) {
                    await connection.execute(
                        `UPDATE activos_productos
                         SET estado = 'financiado',
                             cliente_id = ?,
                             contrato_financiamiento_id = ?,
                             venta_id = ?,
                             fecha_venta = ?
                         WHERE id = ? AND empresa_id = ?`,
                        [
                            datos.cliente_id,
                            contratoId,
                            datos.venta_id,
                            new Date().toISOString().split('T')[0],
                            activoId,
                            empresaId
                        ]
                    )
                }
            }

            // Actualizar límite de crédito del cliente
            await connection.execute(
                `UPDATE credito_clientes
                 SET saldo_utilizado = saldo_utilizado + ?
                 WHERE cliente_id = ? AND empresa_id = ?`,
                [datos.monto_financiado, datos.cliente_id, empresaId]
            )

            await connection.commit()
            connection.release()

            return {
                success: true,
                contrato_id: contratoId,
                numero_contrato: numeroContrato,
                mensaje: 'Contrato creado exitosamente'
            }

        } catch (error) {
            await connection.rollback()
            throw error
        }

    } catch (error) {
        console.error('Error al crear contrato:', error)
        if (connection) {
            try {
                await connection.rollback()
            } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError)
            }
            connection.release()
        }
        return { success: false, mensaje: 'Error al crear contrato: ' + error.message }
    }
}

/**
 * Registra un pago de cuota
 */
export async function registrarPagoCuota(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            // Obtener cuota
            const [cuotas] = await connection.execute(
                `SELECT c.*, co.plan_id, co.cliente_id
                 FROM cuotas_financiamiento c
                 INNER JOIN contratos_financiamiento co ON c.contrato_id = co.id
                 WHERE c.id = ? AND c.empresa_id = ?`,
                [datos.cuota_id, empresaId]
            )

            if (cuotas.length === 0) {
                throw new Error('Cuota no encontrada')
            }

            const cuota = cuotas[0]

            // Calcular mora si aplica
            const { calcularDiasAtraso, calcularMora } = await import('@/utils/financiamientoUtils')
            const diasAtraso = calcularDiasAtraso(cuota.fecha_vencimiento)
            
            let montoMora = 0
            if (diasAtraso > 0) {
                // Obtener plan para tasa de mora
                const [planes] = await connection.execute(
                    `SELECT penalidad_mora_pct, dias_gracia FROM planes_financiamiento WHERE id = ?`,
                    [cuota.plan_id]
                )
                
                if (planes.length > 0) {
                    const plan = planes[0]
                    const tasaMora = plan.penalidad_mora_pct / 100
                    montoMora = calcularMora(
                        cuota.monto_cuota,
                        diasAtraso,
                        tasaMora,
                        plan.dias_gracia || 5
                    )
                }
            }

            // Obtener siguiente número de recibo
            const [ultimoRecibo] = await connection.execute(
                `SELECT numero_recibo FROM pagos_financiamiento
                 WHERE empresa_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [empresaId]
            )

            let secuencia = 1
            if (ultimoRecibo.length > 0) {
                const ultimoNum = ultimoRecibo[0].numero_recibo
                const match = ultimoNum.match(/REC-\d+-(\d+)/)
                if (match) {
                    secuencia = parseInt(match[1]) + 1
                }
            }

            const numeroRecibo = `REC-${new Date().getFullYear()}-${String(secuencia).padStart(5, '0')}`

            // Distribuir pago: mora primero, luego interés, luego capital
            let aplicadoMora = Math.min(datos.monto_pago, montoMora)
            let aplicadoInteres = 0
            let aplicadoCapital = 0
            let aplicadoFuturo = 0

            let montoRestante = datos.monto_pago - aplicadoMora

            if (montoRestante > 0) {
                const interesPendiente = cuota.monto_interes - (cuota.monto_pagado || 0)
                aplicadoInteres = Math.min(montoRestante, interesPendiente)
                montoRestante -= aplicadoInteres
            }

            if (montoRestante > 0) {
                const capitalPendiente = cuota.monto_capital - (cuota.monto_pagado || 0)
                aplicadoCapital = Math.min(montoRestante, capitalPendiente)
                montoRestante -= aplicadoCapital
            }

            // Si sobra, aplicar a siguiente cuota
            if (montoRestante > 0) {
                aplicadoFuturo = montoRestante
            }

            // Insertar pago
            const [resultPago] = await connection.execute(
                `INSERT INTO pagos_financiamiento (
                    cuota_id, contrato_id, empresa_id, cliente_id,
                    numero_recibo, monto_pago, aplicado_mora,
                    aplicado_interes, aplicado_capital, aplicado_futuro,
                    metodo_pago, ultimos_digitos_tarjeta, numero_referencia,
                    nombre_banco, origen_pago, fecha_pago, registrado_por,
                    caja_id, estado, notas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    datos.cuota_id,
                    cuota.contrato_id,
                    empresaId,
                    cuota.cliente_id,
                    numeroRecibo,
                    datos.monto_pago,
                    aplicadoMora,
                    aplicadoInteres,
                    aplicadoCapital,
                    aplicadoFuturo,
                    datos.metodo_pago,
                    datos.ultimos_digitos_tarjeta || null,
                    datos.numero_referencia || null,
                    datos.nombre_banco || null,
                    datos.origen_pago || 'cliente',
                    datos.fecha_pago || new Date().toISOString().split('T')[0],
                    userId,
                    datos.caja_id || null,
                    'confirmado',
                    datos.notas || null
                ]
            )

            // Actualizar cuota
            const nuevoMontoPagado = (cuota.monto_pagado || 0) + aplicadoCapital + aplicadoInteres + aplicadoMora
            const totalCuota = cuota.monto_cuota + montoMora
            let nuevoEstado = 'parcial'

            if (nuevoMontoPagado >= totalCuota) {
                nuevoEstado = 'pagada'
            } else if (nuevoMontoPagado > 0) {
                nuevoEstado = 'parcial'
            }

            await connection.execute(
                `UPDATE cuotas_financiamiento
                 SET monto_pagado = ?,
                     monto_mora = ?,
                     total_a_pagar = ?,
                     estado = ?,
                     dias_atraso = ?,
                     fecha_pago = CASE WHEN ? >= total_a_pagar THEN NOW() ELSE fecha_pago END,
                     fecha_ultimo_pago = NOW()
                 WHERE id = ?`,
                [
                    nuevoMontoPagado,
                    montoMora,
                    totalCuota,
                    nuevoEstado,
                    diasAtraso,
                    nuevoMontoPagado,
                    datos.cuota_id
                ]
            )

            // Actualizar contrato
            const [contratos] = await connection.execute(
                `SELECT monto_pagado, cuotas_pagadas, saldo_pendiente
                 FROM contratos_financiamiento WHERE id = ?`,
                [cuota.contrato_id]
            )

            if (contratos.length > 0) {
                const contrato = contratos[0]
                const nuevoMontoPagadoContrato = parseFloat(contrato.monto_pagado || 0) + datos.monto_pago
                const nuevoSaldoPendiente = parseFloat(contrato.saldo_pendiente || 0) - (aplicadoCapital + aplicadoInteres)

                // Contar cuotas pagadas
                const [cuotasPagadas] = await connection.execute(
                    `SELECT COUNT(*) as total FROM cuotas_financiamiento
                     WHERE contrato_id = ? AND estado = 'pagada'`,
                    [cuota.contrato_id]
                )

                let nuevoEstadoContrato = contrato.estado
                if (nuevoSaldoPendiente <= 0) {
                    nuevoEstadoContrato = 'pagado'
                }

                await connection.execute(
                    `UPDATE contratos_financiamiento
                     SET monto_pagado = ?,
                         saldo_pendiente = ?,
                         cuotas_pagadas = ?,
                         estado = ?
                     WHERE id = ?`,
                    [
                        nuevoMontoPagadoContrato,
                        nuevoSaldoPendiente,
                        parseInt(cuotasPagadas[0].total),
                        nuevoEstadoContrato,
                        cuota.contrato_id
                    ]
                )
            }

            // Si hay excedente, aplicar a siguiente cuota
            if (aplicadoFuturo > 0) {
                const [siguienteCuota] = await connection.execute(
                    `SELECT id FROM cuotas_financiamiento
                     WHERE contrato_id = ? AND estado = 'pendiente'
                     ORDER BY numero_cuota ASC LIMIT 1`,
                    [cuota.contrato_id]
                )

                if (siguienteCuota.length > 0) {
                    await connection.execute(
                        `UPDATE cuotas_financiamiento
                         SET monto_pagado = monto_pagado + ?
                         WHERE id = ?`,
                        [aplicadoFuturo, siguienteCuota[0].id]
                    )
                }
            }

            // Registrar en historial
            await connection.execute(
                `INSERT INTO historial_financiamiento (
                    empresa_id, contrato_id, cuota_id, tipo_cambio,
                    campo_modificado, valor_anterior, valor_nuevo,
                    usuario_id, comentario
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    empresaId,
                    cuota.contrato_id,
                    datos.cuota_id,
                    'pago_registrado',
                    'monto_pagado',
                    cuota.monto_pagado || 0,
                    nuevoMontoPagado,
                    userId,
                    `Pago registrado: ${numeroRecibo}`
                ]
            )

            await connection.commit()
            connection.release()

            return {
                success: true,
                pago_id: resultPago.insertId,
                numero_recibo: numeroRecibo,
                mensaje: 'Pago registrado exitosamente'
            }

        } catch (error) {
            await connection.rollback()
            throw error
        }

    } catch (error) {
        console.error('Error al registrar pago:', error)
        if (connection) {
            try {
                await connection.rollback()
            } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError)
            }
            connection.release()
        }
        return { success: false, mensaje: 'Error al registrar pago: ' + error.message }
    }
}

/**
 * Crea un nuevo activo rastreable
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

        connection = await db.getConnection()

        // Validar que el producto es rastreable
        const [productos] = await connection.execute(
            `SELECT es_rastreable FROM productos WHERE id = ? AND empresa_id = ?`,
            [datos.producto_id, empresaId]
        )

        if (productos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Producto no encontrado' }
        }

        if (!productos[0].es_rastreable) {
            connection.release()
            return { success: false, mensaje: 'El producto no es rastreable' }
        }

        // Generar código de activo si no se proporciona
        let codigoActivo = datos.codigo_activo
        if (!codigoActivo) {
            const [ultimoActivo] = await connection.execute(
                `SELECT codigo_activo FROM activos_productos
                 WHERE empresa_id = ? AND codigo_activo IS NOT NULL
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

