"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { obtenerObras } from '../obras/servidor'
import { obtenerPersonalEnCampo } from '../personal/servidor'
import { obtenerAlertasPresupuesto } from '../presupuesto/servidor'
import { obtenerServicios } from '../servicios/servidor'

export async function obtenerDashboardConstructora() {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Obtener datos de todos los módulos
        const [resObras, resPersonal, resAlertas, resServicios] = await Promise.all([
            obtenerObras({ estado: 'activa' }),
            obtenerPersonalEnCampo(),
            obtenerAlertasPresupuesto({ estado: 'activa' }),
            obtenerServicios({ estado: 'en_ejecucion' })
        ])

        // Calcular estadísticas
        const obrasActivas = resObras.success ? resObras.obras : []
        const personalActivo = resPersonal.success ? resPersonal.personal : []
        const alertasActivas = resAlertas.success ? resAlertas.alertas : []
        const serviciosHoy = resServicios.success ? resServicios.servicios : []

        // Estadísticas adicionales
        connection = await db.getConnection()
        
        // Total de obras activas
        const [totalObras] = await connection.query(
            'SELECT COUNT(*) as total FROM obras WHERE empresa_id = ? AND estado = "activa"',
            [empresaId]
        )
        
        // Total de personal en campo hoy
        const fechaHoy = new Date().toISOString().split('T')[0]
        const [totalPersonal] = await connection.query(
            `SELECT COUNT(DISTINCT trabajador_id) as total 
             FROM asignaciones_trabajadores 
             WHERE empresa_id = ? 
               AND fecha_asignacion = ? 
               AND estado = 'activo'`,
            [empresaId, fechaHoy]
        )
        
        // Total de servicios pendientes
        const [totalServicios] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM servicios 
             WHERE empresa_id = ? 
               AND estado IN ('pendiente', 'programado', 'en_ejecucion')`,
            [empresaId]
        )
        
        // Total de alertas activas
        const [totalAlertas] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM presupuesto_alertas 
             WHERE empresa_id = ? 
               AND estado = 'activa'`,
            [empresaId]
        )
        
        connection.release()
        
        return {
            success: true,
            dashboard: {
                estadisticas: {
                    obras_activas: totalObras[0].total || 0,
                    personal_campo: totalPersonal[0].total || 0,
                    servicios_pendientes: totalServicios[0].total || 0,
                    alertas_activas: totalAlertas[0].total || 0
                },
                obras_activas: obrasActivas.slice(0, 5), // Top 5
                personal_campo: personalActivo.slice(0, 5), // Top 5
                alertas_presupuesto: alertasActivas.slice(0, 5), // Top 5
                servicios_hoy: serviciosHoy.slice(0, 5) // Top 5
            }
        }
    } catch (error) {
        console.error('Error al obtener dashboard:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar dashboard' }
    }
}

