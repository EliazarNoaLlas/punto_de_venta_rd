"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { dbObtenerObras } from "@/lib/services/constructionService"
import { obtenerUsuarioActual, validarPermisoObras, formatearObra } from '../lib'

/**
 * Obtener todas las obras de la empresa con filtros
 */
export async function obtenerObras(filtros = {}) {
    let connection
    try {
        const usuario = await obtenerUsuarioActual()
        validarPermisoObras(usuario)

        connection = await db.getConnection()
        
        // Construir query con joins para obtener información completa
        let query = `
            SELECT 
                o.*,
                p.nombre AS proyecto_nombre,
                c.nombre AS cliente_nombre,
                u.nombre AS creador_nombre,
                (
                    SELECT COUNT(DISTINCT at.trabajador_id)
                    FROM asignaciones_trabajadores at
                    WHERE at.tipo_destino = 'obra'
                    AND at.destino_id = o.id
                    AND at.estado = 'activa'
                ) AS trabajadores_activos
            FROM obras o
            LEFT JOIN proyectos p ON o.proyecto_id = p.id
            LEFT JOIN clientes c ON o.cliente_id = c.id
            LEFT JOIN usuarios u ON o.creado_por = u.id
            WHERE o.empresa_id = ?
        `
        
        const params = [usuario.empresaId]
        
        // Aplicar filtros
        if (filtros.estado) {
            query += ` AND o.estado = ?`
            params.push(filtros.estado)
        }
        
        if (filtros.busqueda) {
            query += ` AND (o.nombre LIKE ? OR o.codigo_obra LIKE ? OR o.ubicacion LIKE ?)`
            const busqueda = `%${filtros.busqueda}%`
            params.push(busqueda, busqueda, busqueda)
        }
        
        query += ` ORDER BY 
            CASE o.estado
                WHEN 'activa' THEN 1
                WHEN 'suspendida' THEN 2
                WHEN 'finalizada' THEN 3
                WHEN 'cancelada' THEN 4
            END,
            o.fecha_creacion DESC
        `
        
        const [obras] = await connection.execute(query, params)
        
        // Formatear obras
        const obrasFormateadas = obras.map(formatearObra)
        
        connection.release()

        return {
            success: true,
            obras: obrasFormateadas
        }
    } catch (error) {
        console.error('Error al obtener obras:', error)
        if (connection) connection.release()
        return {
            success: false,
            mensaje: error.message || 'Error al cargar obras'
        }
    }
}

