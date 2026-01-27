"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { validarProyecto } from '../core/construction/validaciones'
import { ESTADOS_PROYECTO } from '../core/construction/estados'

export async function obtenerProyectos(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        let query = `
            SELECT p.*,
                   COUNT(DISTINCT o.id) as cantidad_obras,
                   COUNT(DISTINCT s.id) as cantidad_servicios
            FROM proyectos p
            LEFT JOIN obras o ON p.id = o.proyecto_id
            LEFT JOIN servicios s ON p.id = s.proyecto_id
            WHERE p.empresa_id = ?
        `
        const params = [empresaId]
        
        if (filtros.estado) {
            query += ' AND p.estado = ?'
            params.push(filtros.estado)
        }
        
        if (filtros.busqueda) {
            query += ' AND (p.nombre LIKE ? OR p.codigo_proyecto LIKE ?)'
            const busqueda = `%${filtros.busqueda}%`
            params.push(busqueda, busqueda)
        }
        
        query += ' GROUP BY p.id ORDER BY p.fecha_creacion DESC'
        
        const [proyectos] = await connection.query(query, params)
        connection.release()
        
        return { success: true, proyectos }
    } catch (error) {
        console.error('Error al obtener proyectos:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar proyectos' }
    }
}

export async function crearProyecto(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validar usando reglas del dominio
        const validacion = validarProyecto(datos)
        if (!validacion.valido) {
            return { 
                success: false, 
                mensaje: Object.values(validacion.errores)[0], 
                errores: validacion.errores 
            }
        }

        connection = await db.getConnection()
        
        // Generar código único
        const [ultimoProyecto] = await connection.query(
            'SELECT codigo_proyecto FROM proyectos WHERE empresa_id = ? ORDER BY id DESC LIMIT 1',
            [empresaId]
        )
        
        let numero = 1
        if (ultimoProyecto.length > 0 && ultimoProyecto[0].codigo_proyecto) {
            const match = ultimoProyecto[0].codigo_proyecto.match(/\d+$/)
            if (match) numero = parseInt(match[0]) + 1
        }
        
        const codigoProyecto = `PRJ-${new Date().getFullYear()}-${String(numero).padStart(3, '0')}`
        
        const [result] = await connection.query(
            `INSERT INTO proyectos (
                empresa_id, codigo_proyecto, nombre, descripcion,
                fecha_inicio, fecha_fin_estimada, presupuesto_total,
                cliente_id, usuario_responsable_id, estado, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empresaId,
                codigoProyecto,
                datos.nombre,
                datos.descripcion || null,
                datos.fecha_inicio,
                datos.fecha_fin_estimada,
                datos.presupuesto_total || null,
                datos.cliente_id || null,
                datos.responsable_id || null,
                ESTADOS_PROYECTO.ACTIVO,
                userId
            ]
        )
        
        connection.release()
        
        return { success: true, mensaje: 'Proyecto creado exitosamente', id: result.insertId }
    } catch (error) {
        console.error('Error al crear proyecto:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al crear proyecto' }
    }
}

export async function obtenerProyectoPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        const [proyectos] = await connection.query(
            `SELECT p.*,
                    c.nombre AS cliente_nombre,
                    u.nombre AS responsable_nombre
             FROM proyectos p
             LEFT JOIN clientes c ON p.cliente_id = c.id
             LEFT JOIN usuarios u ON p.usuario_responsable_id = u.id
             WHERE p.id = ? AND p.empresa_id = ?`,
            [id, empresaId]
        )
        
        connection.release()
        
        if (proyectos.length === 0) {
            return { success: false, mensaje: 'Proyecto no encontrado' }
        }
        
        return { success: true, proyecto: proyectos[0] }
    } catch (error) {
        console.error('Error al obtener proyecto:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar proyecto' }
    }
}

