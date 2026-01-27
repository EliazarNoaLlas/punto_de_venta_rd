"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { dbCrearBitacora, dbObtenerTrabajadoresAsignados } from "@/lib/services/constructionService"
import { validarBitacora } from '../core/construction/validaciones'
import { obtenerObras } from '../obras/servidor'

export async function obtenerObrasActivas() {
    const res = await obtenerObras({ estado: 'activa' })
    return res
}

export async function obtenerTrabajadoresAsignados(obraId) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        const trabajadores = await dbObtenerTrabajadoresAsignados(connection, obraId)
        connection.release()
        
        return { success: true, trabajadores }
    } catch (error) {
        console.error('Error al obtener trabajadores:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar trabajadores asignados' }
    }
}

export async function crearBitacora(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validar usando reglas del dominio
        const validacion = validarBitacora(datos)
        if (!validacion.valido) {
            return { 
                success: false, 
                mensaje: Object.values(validacion.errores)[0], 
                errores: validacion.errores 
            }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            const bitacoraId = await dbCrearBitacora(connection, {
                ...datos,
                empresa_id: empresaId,
                creado_por: userId
            })
            
            await connection.commit()
            connection.release()
            
            return { success: true, mensaje: 'Bitácora registrada exitosamente', id: bitacoraId }
        } catch (innerError) {
            await connection.rollback()
            throw innerError
        }
    } catch (error) {
        console.error('Error al registrar bitácora:', error)
        if (connection) {
            await connection.rollback()
            connection.release()
        }
        return { success: false, mensaje: 'Error al registrar la bitácora' }
    }
}

export async function obtenerBitacorasPorObra(obraId, filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        let query = `
            SELECT b.*, 
                   COUNT(DISTINCT a.trabajador_id) as trabajadores_presentes
            FROM bitacora_diaria b
            LEFT JOIN bitacora_trabajadores a ON b.id = a.bitacora_id
            WHERE b.obra_id = ? AND b.empresa_id = ?
        `
        const params = [obraId, empresaId]
        
        if (filtros.fecha_desde) {
            query += ' AND b.fecha_bitacora >= ?'
            params.push(filtros.fecha_desde)
        }
        
        if (filtros.fecha_hasta) {
            query += ' AND b.fecha_bitacora <= ?'
            params.push(filtros.fecha_hasta)
        }
        
        query += ' GROUP BY b.id ORDER BY b.fecha_bitacora DESC'
        
        const [bitacoras] = await connection.query(query, params)
        connection.release()
        
        return { success: true, bitacoras }
    } catch (error) {
        console.error('Error al obtener bitácoras:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar bitácoras' }
    }
}

export async function obtenerBitacoraPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        const [bitacoras] = await connection.query(
            `SELECT b.*, 
                    o.nombre as obra_nombre,
                    o.codigo_obra
             FROM bitacora_diaria b
             INNER JOIN obras o ON b.obra_id = o.id
             WHERE b.id = ? AND b.empresa_id = ?`,
            [id, empresaId]
        )
        
        if (bitacoras.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Bitácora no encontrada' }
        }
        
        // Obtener trabajadores presentes
        const [trabajadores] = await connection.query(
            `SELECT bt.*, 
                    t.nombre as trabajador_nombre,
                    t.rol as trabajador_rol
             FROM bitacora_trabajadores bt
             INNER JOIN trabajadores_obra t ON bt.trabajador_id = t.id
             WHERE bt.bitacora_id = ?`,
            [id]
        )
        
        connection.release()
        
        return { 
            success: true, 
            bitacora: { ...bitacoras[0], trabajadores } 
        }
    } catch (error) {
        console.error('Error al obtener bitácora:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar bitácora' }
    }
}

