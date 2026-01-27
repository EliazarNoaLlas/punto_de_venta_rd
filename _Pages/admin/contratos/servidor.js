"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { 
    validarMontoFinanciable,
    validarMontoInicial
} from '../core/finance/reglas.js'
import { validarDatosContrato } from '../core/finance/validaciones.js'
import { 
    calcularAmortizacionFrancesa,
    generarCronograma,
    formatearNumeroContrato,
    tasaAnualAMensual
} from '../core/finance/calculos.js'
import { ESTADOS_CONTRATO } from '../core/finance/estados.js'

/**
 * Obtiene la lista de contratos de financiamiento con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Object} { success: boolean, contratos: Array, paginacion: Object, mensaje?: string }
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

        // Contar total (sin LIMIT y OFFSET)
        let countQuery = `
            SELECT COUNT(*) as total
            FROM contratos_financiamiento c
            LEFT JOIN clientes cl ON c.cliente_id = cl.id
            LEFT JOIN planes_financiamiento p ON c.plan_id = p.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.empresa_id = ?
        `
        const countParams = [empresaId]

        // Aplicar los mismos filtros que la consulta principal
        if (filtros.estado) {
            countQuery += ` AND c.estado = ?`
            countParams.push(filtros.estado)
        }

        if (filtros.buscar) {
            countQuery += ` AND (c.numero_contrato LIKE ? OR cl.nombre LIKE ? OR c.ncf LIKE ?)`
            const busqueda = `%${filtros.buscar}%`
            countParams.push(busqueda, busqueda, busqueda)
        }

        if (filtros.cliente_id) {
            countQuery += ` AND c.cliente_id = ?`
            countParams.push(filtros.cliente_id)
        }

        const [countResult] = await connection.execute(countQuery, countParams)
        const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0

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
 * @param {number} id - ID del contrato
 * @returns {Object} { success: boolean, contrato?: Object, cuotas?: Array, pagos?: Array, activos?: Array, mensaje?: string }
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
 * @param {number} contratoId - ID del contrato
 * @returns {Object} { success: boolean, cuotas: Array, mensaje?: string }
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
 * Crea un nuevo contrato de financiamiento
 * @param {Object} datos - Datos del contrato
 * @returns {Object} { success: boolean, contrato_id?: number, numero_contrato?: string, mensaje?: string }
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

        // Validar datos usando el dominio compartido
        const validacion = validarDatosContrato(datos)
        if (!validacion.valido) {
            return { success: false, mensaje: validacion.errores.join(', ') }
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

            // Validar plan contra monto e inicial
            const validacionPlan = validarMontoInicial(
                datos.precio_producto,
                datos.pago_inicial || 0,
                plan.pago_inicial_minimo_pct
            )
            if (!validacionPlan.valido) {
                throw new Error(validacionPlan.error)
            }

            // Calcular tasa mensual usando el dominio compartido
            const tasaMensual = tasaAnualAMensual(plan.tasa_interes_anual)

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

            const numeroContrato = formatearNumeroContrato(empresaId, secuencia)

            // Calcular amortización usando el dominio compartido
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
                    cuotas_pagadas, estado, nombre_fiador, 
                    documento_fiador, telefono_fiador, notas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                    datos.pago_inicial || 0,
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
                    ESTADOS_CONTRATO.ACTIVO,
                    datos.nombre_fiador || null,
                    datos.documento_fiador || null,
                    datos.telefono_fiador || null,
                    datos.notas || null
                ]
            )

            const contratoId = resultContrato.insertId

            // Generar cuotas usando el dominio compartido
            const cronograma = generarCronograma({
                monto_financiado: datos.monto_financiado,
                numero_cuotas: datos.numero_cuotas,
                fecha_primer_pago: datos.fecha_primer_pago,
                tasa_interes_mensual: tasaMensual,
                dias_gracia: plan.dias_gracia || 5
            })

            // Insertar cuotas
            for (const cuota of cronograma) {
                await connection.execute(
                    `INSERT INTO cuotas_financiamiento (
                        contrato_id, empresa_id, cliente_id, numero_cuota,
                        fecha_vencimiento, fecha_fin_gracia, monto_capital,
                        monto_interes, monto_cuota, saldo_restante,
                        monto_pagado, monto_mora, total_a_pagar, estado, dias_atraso
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        contratoId,
                        empresaId,
                        datos.cliente_id,
                        cuota.numero_cuota,
                        cuota.fecha_vencimiento,
                        cuota.fecha_fin_gracia,
                        cuota.monto_capital,
                        cuota.monto_interes,
                        cuota.monto_cuota,
                        cuota.saldo_restante,
                        0,
                        0,
                        cuota.monto_cuota,
                        'pendiente',
                        0
                    ]
                )
            }

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
                 SET saldo_utilizado = saldo_utilizado + ?,
                     monto_financiado_total = monto_financiado_total + ?,
                     contratos_activos = contratos_activos + 1
                 WHERE cliente_id = ? AND empresa_id = ?`,
                [datos.monto_financiado, datos.monto_financiado, datos.cliente_id, empresaId]
            )

            // Actualizar venta para asociar con contrato
            await connection.execute(
                `UPDATE ventas
                 SET tiene_financiamiento = 1,
                     contrato_financiamiento_id = ?
                 WHERE id = ? AND empresa_id = ?`,
                [contratoId, datos.venta_id, empresaId]
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
 * Actualiza un contrato de financiamiento
 * @param {number} id - ID del contrato
 * @param {Object} datos - Datos a actualizar
 * @returns {Object} { success: boolean, mensaje?: string }
 */
export async function actualizarContratoFinanciamiento(id, datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()

        // Verificar que el contrato existe y pertenece a la empresa
        const [contratos] = await connection.execute(
            `SELECT id, estado FROM contratos_financiamiento 
             WHERE id = ? AND empresa_id = ?`,
            [id, empresaId]
        )

        if (contratos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Contrato no encontrado' }
        }

        const contrato = contratos[0]

        // No permitir editar contratos pagados o cancelados
        if (contrato.estado === ESTADOS_CONTRATO.PAGADO || contrato.estado === ESTADOS_CONTRATO.CANCELADO) {
            connection.release()
            return { success: false, mensaje: 'No se puede editar un contrato pagado o cancelado' }
        }

        // Construir query de actualización dinámicamente
        const campos = []
        const valores = []

        if (datos.notas !== undefined) {
            campos.push('notas = ?')
            valores.push(datos.notas)
        }

        if (datos.notas_internas !== undefined) {
            campos.push('notas_internas = ?')
            valores.push(datos.notas_internas)
        }

        if (datos.estado !== undefined) {
            campos.push('estado = ?')
            valores.push(datos.estado)
            
            if (datos.razon_estado !== undefined) {
                campos.push('razon_estado = ?')
                valores.push(datos.razon_estado)
            }
        }

        if (campos.length === 0) {
            connection.release()
            return { success: false, mensaje: 'No hay campos para actualizar' }
        }

        valores.push(id)

        await connection.execute(
            `UPDATE contratos_financiamiento 
             SET ${campos.join(', ')}
             WHERE id = ?`,
            valores
        )

        connection.release()

        return { success: true, mensaje: 'Contrato actualizado exitosamente' }

    } catch (error) {
        console.error('Error al actualizar contrato:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al actualizar contrato: ' + error.message }
    }
}

/**
 * Cancela un contrato de financiamiento
 * @param {number} id - ID del contrato
 * @param {string} razon - Razón de la cancelación
 * @returns {Object} { success: boolean, mensaje?: string }
 */
export async function cancelarContratoFinanciamiento(id, razon) {
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
            // Verificar que el contrato existe
            const [contratos] = await connection.execute(
                `SELECT id, estado, monto_financiado, cliente_id 
                 FROM contratos_financiamiento 
                 WHERE id = ? AND empresa_id = ?`,
                [id, empresaId]
            )

            if (contratos.length === 0) {
                throw new Error('Contrato no encontrado')
            }

            const contrato = contratos[0]

            // No permitir cancelar contratos ya cancelados
            if (contrato.estado === ESTADOS_CONTRATO.CANCELADO) {
                throw new Error('El contrato ya está cancelado')
            }

            // Actualizar contrato
            await connection.execute(
                `UPDATE contratos_financiamiento
                 SET estado = ?,
                     razon_estado = ?,
                     fecha_cancelacion = NOW(),
                     cancelado_por = ?
                 WHERE id = ?`,
                [ESTADOS_CONTRATO.CANCELADO, razon, userId, id]
            )

            // Actualizar límite de crédito del cliente
            await connection.execute(
                `UPDATE credito_clientes
                 SET saldo_utilizado = saldo_utilizado - ?,
                     monto_financiado_total = monto_financiado_total - ?,
                     contratos_activos = GREATEST(contratos_activos - 1, 0)
                 WHERE cliente_id = ? AND empresa_id = ?`,
                [contrato.monto_financiado, contrato.monto_financiado, contrato.cliente_id, empresaId]
            )

            // Actualizar activos asociados
            await connection.execute(
                `UPDATE activos_productos
                 SET estado = 'en_stock',
                     cliente_id = NULL,
                     contrato_financiamiento_id = NULL,
                     venta_id = NULL
                 WHERE contrato_financiamiento_id = ?`,
                [id]
            )

            await connection.commit()
            connection.release()

            return { success: true, mensaje: 'Contrato cancelado exitosamente' }

        } catch (error) {
            await connection.rollback()
            throw error
        }

    } catch (error) {
        console.error('Error al cancelar contrato:', error)
        if (connection) {
            try {
                await connection.rollback()
            } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError)
            }
            connection.release()
        }
        return { success: false, mensaje: 'Error al cancelar contrato: ' + error.message }
    }
}

