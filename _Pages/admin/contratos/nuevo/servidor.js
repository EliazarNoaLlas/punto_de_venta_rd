"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { crearContratoFinanciamiento } from '../servidor.js'
import { obtenerPlanesFinanciamiento } from '../../planes/servidor.js'

// Re-exportar función de creación desde el servidor principal
export { crearContratoFinanciamiento }

/**
 * Obtiene los datos necesarios para crear un contrato
 * @returns {Object} { success: boolean, planes?: Array, clientes?: Array, mensaje?: string }
 */
export async function obtenerDatosCreacion() {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()

        // Obtener planes activos
        const resultadoPlanes = await obtenerPlanesFinanciamiento({ activo: true })
        const planes = resultadoPlanes.success ? resultadoPlanes.planes : []

        // Obtener clientes activos
        const [clientes] = await connection.execute(
            `SELECT id, nombre, apellidos, numero_documento, telefono, email
             FROM clientes
             WHERE empresa_id = ? AND activo = 1
             ORDER BY nombre, apellidos`,
            [empresaId]
        )

        // Obtener activos disponibles (productos en stock que pueden ser financiados)
        const [activos] = await connection.execute(
            `SELECT a.id, a.codigo_activo, a.numero_serie, a.vin,
                    p.nombre as producto_nombre, p.precio_venta
             FROM activos_productos a
             LEFT JOIN productos p ON a.producto_id = p.id
             WHERE a.empresa_id = ? 
             AND a.estado = 'en_stock'
             AND a.contrato_financiamiento_id IS NULL
             ORDER BY p.nombre`,
            [empresaId]
        )

        connection.release()

        return {
            success: true,
            planes,
            clientes,
            activos
        }

    } catch (error) {
        console.error('Error al obtener datos para creación:', error)
        if (connection) connection.release()
        return { 
            success: false, 
            mensaje: 'Error al cargar datos', 
            planes: [],
            clientes: [],
            activos: []
        }
    }
}

