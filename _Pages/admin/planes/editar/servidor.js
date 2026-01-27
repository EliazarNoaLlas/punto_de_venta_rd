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
} from '../../core/finance/reglas.js'
import { tasaAnualAMensual } from '../../core/finance/calculos.js'

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

