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
import { validarDatosPlan } from '../../core/finance/validaciones.js'
import { tasaAnualAMensual } from '../../core/finance/calculos.js'

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

