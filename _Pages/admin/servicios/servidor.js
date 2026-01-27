"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { validarServicio } from '../core/construction/validaciones'
import { ESTADOS_SERVICIO, TIPOS_SERVICIO, PRIORIDADES } from '../core/construction/estados'

export async function obtenerServicios(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        let query = `
            SELECT s.*,
                   c.nombre AS cliente_nombre,
                   o.nombre AS obra_nombre,
                   o.codigo_obra
            FROM servicios s
            LEFT JOIN clientes c ON s.cliente_id = c.id
            LEFT JOIN obras o ON s.obra_id = o.id
            WHERE s.empresa_id = ?
        `
        const params = [empresaId]
        
        if (filtros.estado) {
            query += ' AND s.estado = ?'
            params.push(filtros.estado)
        }
        
        if (filtros.tipo_servicio) {
            query += ' AND s.tipo_servicio = ?'
            params.push(filtros.tipo_servicio)
        }
        
        if (filtros.prioridad) {
            query += ' AND s.prioridad = ?'
            params.push(filtros.prioridad)
        }
        
        if (filtros.busqueda) {
            query += ' AND (s.nombre LIKE ? OR s.codigo_servicio LIKE ?)'
            const busqueda = `%${filtros.busqueda}%`
            params.push(busqueda, busqueda)
        }
        
        query += ' ORDER BY s.fecha_solicitud DESC'
        
        const [servicios] = await connection.query(query, params)
        connection.release()
        
        return { success: true, servicios }
    } catch (error) {
        console.error('Error al obtener servicios:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar servicios' }
    }
}

export async function crearServicio(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validar usando reglas del dominio
        const validacion = validarServicio(datos)
        if (!validacion.valido) {
            return { 
                success: false, 
                mensaje: Object.values(validacion.errores)[0], 
                errores: validacion.errores 
            }
        }

        connection = await db.getConnection()
        
        // Generar código único
        const [ultimoServicio] = await connection.query(
            'SELECT codigo_servicio FROM servicios WHERE empresa_id = ? ORDER BY id DESC LIMIT 1',
            [empresaId]
        )
        
        let numero = 1
        if (ultimoServicio.length > 0 && ultimoServicio[0].codigo_servicio) {
            const match = ultimoServicio[0].codigo_servicio.match(/\d+$/)
            if (match) numero = parseInt(match[0]) + 1
        }
        
        const codigoServicio = `SRV-${new Date().getFullYear()}-${String(numero).padStart(3, '0')}`
        
        const [result] = await connection.query(
            `INSERT INTO servicios (
                empresa_id, codigo_servicio, nombre, descripcion, tipo_servicio,
                ubicacion, zona, costo_estimado, fecha_solicitud, fecha_programada,
                duracion_estimada_horas, estado, prioridad,
                cliente_id, obra_id, proyecto_id, usuario_responsable_id, creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empresaId,
                codigoServicio,
                datos.nombre,
                datos.descripcion || null,
                datos.tipo_servicio || TIPOS_SERVICIO.OTRO,
                datos.ubicacion,
                datos.zona || null,
                datos.costo_estimado || null,
                datos.fecha_solicitud || new Date().toISOString().split('T')[0],
                datos.fecha_programada || null,
                datos.duracion_estimada_horas || null,
                ESTADOS_SERVICIO.PENDIENTE,
                datos.prioridad || PRIORIDADES.MEDIA,
                datos.cliente_id || null,
                datos.obra_id || null,
                datos.proyecto_id || null,
                datos.responsable_id || null,
                userId
            ]
        )
        
        connection.release()
        
        return { success: true, mensaje: 'Servicio creado exitosamente', id: result.insertId }
    } catch (error) {
        console.error('Error al crear servicio:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al crear servicio' }
    }
}

export async function obtenerServicioPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        const [servicios] = await connection.query(
            `SELECT s.*,
                    c.nombre AS cliente_nombre,
                    o.nombre AS obra_nombre,
                    o.codigo_obra,
                    u.nombre AS responsable_nombre
             FROM servicios s
             LEFT JOIN clientes c ON s.cliente_id = c.id
             LEFT JOIN obras o ON s.obra_id = o.id
             LEFT JOIN usuarios u ON s.usuario_responsable_id = u.id
             WHERE s.id = ? AND s.empresa_id = ?`,
            [id, empresaId]
        )
        
        connection.release()
        
        if (servicios.length === 0) {
            return { success: false, mensaje: 'Servicio no encontrado' }
        }
        
        return { success: true, servicio: servicios[0] }
    } catch (error) {
        console.error('Error al obtener servicio:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar servicio' }
    }
}

export async function obtenerObrasParaServicio() {
    const { obtenerObras } = await import('../obras/servidor')
    return await obtenerObras({ estado: 'activa' })
}

