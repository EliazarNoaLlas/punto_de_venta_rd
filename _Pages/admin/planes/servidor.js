"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { 
    validarTasaInteres, 
    validarPlazo, 
    validarPagoInicialPct,
    validarTasaMora,
    validarDiasGracia,
    validarMontoFinanciable
} from '../core/finance/reglas.js'
import { validarDatosPlan } from '../core/finance/validaciones.js'
import { tasaAnualAMensual } from '../core/finance/calculos.js'

/**
 * Obtiene la lista de planes de financiamiento con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Object} { success: boolean, planes: Array, mensaje?: string }
 */
export async function obtenerPlanesFinanciamiento(filtros = {}) {
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
 * Obtiene un plan por su ID
 * @param {number} id - ID del plan
 * @returns {Object} { success: boolean, plan?: Object, mensaje?: string }
 */
export async function obtenerPlanPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) return { success: false, mensaje: 'Sesión inválida' }

        connection = await db.getConnection()

        const [planes] = await connection.execute(
            `SELECT p.*, 
                    u.nombre as creado_por_nombre,
                    u2.nombre as modificado_por_nombre
             FROM planes_financiamiento p
             LEFT JOIN usuarios u ON p.creado_por = u.id
             LEFT JOIN usuarios u2 ON p.modificado_por = u2.id
             WHERE p.id = ? AND (p.empresa_id = ? OR p.empresa_id IS NULL)`,
            [id, empresaId]
        )

        connection.release()

        if (planes.length === 0) {
            return { success: false, mensaje: 'Plan no encontrado' }
        }

        return { success: true, plan: planes[0] }

    } catch (error) {
        console.error('Error al obtener plan:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar plan' }
    }
}

/**
 * Crea un nuevo plan de financiamiento
 * @param {Object} datos - Datos del plan
 * @returns {Object} { success: boolean, id?: number, mensaje?: string }
 */
export async function crearPlanFinanciamiento(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value
        const userId = cookieStore.get('userId')?.value

        if (!empresaId || !userId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validar datos usando el dominio compartido
        const validacion = validarDatosPlan(datos)
        if (!validacion.valido) {
            return { success: false, mensaje: validacion.errores.join(', ') }
        }

        // Validaciones específicas usando reglas del dominio
        const validacionTasa = validarTasaInteres(datos.tasa_interes_anual)
        if (!validacionTasa.valido) {
            return { success: false, mensaje: validacionTasa.error }
        }

        const validacionPlazo = validarPlazo(datos.plazo_meses)
        if (!validacionPlazo.valido) {
            return { success: false, mensaje: validacionPlazo.error }
        }

        if (datos.pago_inicial_minimo_pct !== undefined) {
            const validacionInicial = validarPagoInicialPct(datos.pago_inicial_minimo_pct)
            if (!validacionInicial.valido) {
                return { success: false, mensaje: validacionInicial.error }
            }
        }

        if (datos.penalidad_mora_pct !== undefined) {
            const validacionMora = validarTasaMora(datos.penalidad_mora_pct)
            if (!validacionMora.valido) {
                return { success: false, mensaje: validacionMora.error }
            }
        }

        if (datos.dias_gracia !== undefined) {
            const validacionGracia = validarDiasGracia(datos.dias_gracia)
            if (!validacionGracia.valido) {
                return { success: false, mensaje: validacionGracia.error }
            }
        }

        // Validar montos si se proporcionan
        if (datos.monto_minimo !== undefined && datos.monto_minimo > 0) {
            const validacionMinimo = validarMontoFinanciable(datos.monto_minimo)
            if (!validacionMinimo.valido) {
                return { success: false, mensaje: validacionMinimo.error }
            }
        }

        if (datos.monto_maximo !== undefined && datos.monto_maximo !== null) {
            const validacionMaximo = validarMontoFinanciable(datos.monto_maximo)
            if (!validacionMaximo.valido) {
                return { success: false, mensaje: validacionMaximo.error }
            }

            // Validar que máximo sea mayor que mínimo
            if (datos.monto_minimo && datos.monto_maximo < datos.monto_minimo) {
                return { success: false, mensaje: 'El monto máximo debe ser mayor al monto mínimo' }
            }
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

        // Calcular tasa mensual automáticamente
        const tasaMensual = tasaAnualAMensual(datos.tasa_interes_anual)

        // Insertar plan
        const [result] = await connection.execute(
            `INSERT INTO planes_financiamiento (
                empresa_id, codigo, nombre, descripcion, plazo_meses,
                tasa_interes_anual, tasa_interes_mensual, pago_inicial_minimo_pct, 
                monto_minimo, monto_maximo, penalidad_mora_pct, dias_gracia,
                descuento_pago_anticipado_pct, cuotas_minimas_anticipadas,
                activo, permite_pago_anticipado, requiere_fiador,
                creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                datos.empresa_id || empresaId,
                datos.codigo,
                datos.nombre,
                datos.descripcion || null,
                datos.plazo_meses,
                datos.tasa_interes_anual,
                tasaMensual,
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
 * Actualiza un plan de financiamiento
 * @param {number} id - ID del plan
 * @param {Object} datos - Datos a actualizar
 * @returns {Object} { success: boolean, mensaje?: string }
 */
export async function actualizarPlanFinanciamiento(id, datos) {
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

        // Validaciones usando el dominio compartido
        if (datos.tasa_interes_anual !== undefined) {
            const validacionTasa = validarTasaInteres(datos.tasa_interes_anual)
            if (!validacionTasa.valido) {
                connection.release()
                return { success: false, mensaje: validacionTasa.error }
            }
        }

        if (datos.plazo_meses !== undefined) {
            const validacionPlazo = validarPlazo(datos.plazo_meses)
            if (!validacionPlazo.valido) {
                connection.release()
                return { success: false, mensaje: validacionPlazo.error }
            }
        }

        if (datos.pago_inicial_minimo_pct !== undefined) {
            const validacionInicial = validarPagoInicialPct(datos.pago_inicial_minimo_pct)
            if (!validacionInicial.valido) {
                connection.release()
                return { success: false, mensaje: validacionInicial.error }
            }
        }

        if (datos.penalidad_mora_pct !== undefined) {
            const validacionMora = validarTasaMora(datos.penalidad_mora_pct)
            if (!validacionMora.valido) {
                connection.release()
                return { success: false, mensaje: validacionMora.error }
            }
        }

        if (datos.dias_gracia !== undefined) {
            const validacionGracia = validarDiasGracia(datos.dias_gracia)
            if (!validacionGracia.valido) {
                connection.release()
                return { success: false, mensaje: validacionGracia.error }
            }
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
            // Recalcular tasa mensual si cambia la anual
            const tasaMensual = tasaAnualAMensual(datos.tasa_interes_anual)
            campos.push('tasa_interes_mensual = ?')
            valores.push(tasaMensual)
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
            valores.push(datos.monto_maximo === '' ? null : datos.monto_maximo)
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
 * Elimina (desactiva) un plan de financiamiento
 * @param {number} id - ID del plan
 * @returns {Object} { success: boolean, mensaje?: string }
 */
export async function eliminarPlanFinanciamiento(id) {
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

        // Verificar si hay contratos usando este plan
        const [contratos] = await connection.execute(
            `SELECT COUNT(*) as total FROM contratos_financiamiento WHERE plan_id = ?`,
            [id]
        )

        if (contratos[0].total > 0) {
            // En lugar de eliminar, desactivar el plan
            await connection.execute(
                `UPDATE planes_financiamiento 
                 SET activo = 0, modificado_por = ?
                 WHERE id = ?`,
                [userId, id]
            )
            connection.release()
            return { success: true, mensaje: 'Plan desactivado (tiene contratos asociados)' }
        }

        // Si no tiene contratos, eliminar físicamente
        await connection.execute(
            `DELETE FROM planes_financiamiento WHERE id = ?`,
            [id]
        )

        connection.release()

        return { success: true, mensaje: 'Plan eliminado exitosamente' }

    } catch (error) {
        console.error('Error al eliminar plan de financiamiento:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al eliminar plan: ' + error.message }
    }
}

