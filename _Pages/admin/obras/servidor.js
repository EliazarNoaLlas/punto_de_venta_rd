"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { dbObtenerObras, dbCrearObra } from "@/lib/services/constructionService"
import { validarObra } from '../core/construction/validaciones'
import { ESTADOS_OBRA } from '../core/construction/estados'

export async function obtenerObras(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        const obras = await dbObtenerObras(connection, empresaId, filtros)
        connection.release()

        return { success: true, obras }
    } catch (error) {
        console.error('Error al obtener obras:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar obras' }
    }
}

export async function crearObra(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validar usando reglas del dominio
        const validacion = validarObra(datos)
        if (!validacion.valido) {
            return { 
                success: false, 
                mensaje: Object.values(validacion.errores)[0], 
                errores: validacion.errores 
            }
        }

        connection = await db.getConnection()
        
        // Generar código único
        const [ultimaObra] = await connection.query(
            'SELECT codigo_obra FROM obras WHERE empresa_id = ? ORDER BY id DESC LIMIT 1',
            [empresaId]
        )
        
        let numero = 1
        if (ultimaObra.length > 0 && ultimaObra[0].codigo_obra) {
            const match = ultimaObra[0].codigo_obra.match(/\d+$/)
            if (match) numero = parseInt(match[0]) + 1
        }
        
        const codigoObra = `OB-${new Date().getFullYear()}-${String(numero).padStart(3, '0')}`
        
        const id = await dbCrearObra(connection, { 
            ...datos, 
            empresa_id: empresaId,
            codigo_obra: codigoObra,
            estado: ESTADOS_OBRA.ACTIVA,
            creado_por: userId
        })
        connection.release()

        return { success: true, mensaje: 'Obra creada exitosamente', id }
    } catch (error) {
        console.error('Error al crear obra:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al crear obra' }
    }
}

// Mantener guardarObra para compatibilidad con código existente
export async function guardarObra(datos) {
    return await crearObra(datos)
}

export async function obtenerObraPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        const [obras] = await connection.query(
            `SELECT o.*, 
                    c.nombre AS cliente_nombre,
                    u.nombre AS responsable_nombre
             FROM obras o
             LEFT JOIN clientes c ON o.cliente_id = c.id
             LEFT JOIN usuarios u ON o.usuario_responsable_id = u.id
             WHERE o.id = ? AND o.empresa_id = ?`,
            [id, empresaId]
        )
        connection.release()

        if (obras.length === 0) {
            return { success: false, mensaje: 'Obra no encontrada' }
        }

        return { success: true, obra: obras[0] }
    } catch (error) {
        console.error('Error al obtener obra:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar obra' }
    }
}

export async function actualizarObra(id, datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validar usando reglas del dominio
        const validacion = validarObra(datos)
        if (!validacion.valido) {
            return { 
                success: false, 
                mensaje: Object.values(validacion.errores)[0], 
                errores: validacion.errores 
            }
        }

        connection = await db.getConnection()
        
        await connection.query(
            `UPDATE obras SET
                nombre = ?,
                descripcion = ?,
                tipo_obra = ?,
                ubicacion = ?,
                zona = ?,
                municipio = ?,
                provincia = ?,
                presupuesto_aprobado = ?,
                fecha_inicio = ?,
                fecha_fin_estimada = ?,
                cliente_id = ?,
                usuario_responsable_id = ?,
                actualizado_por = ?,
                actualizado_at = NOW()
             WHERE id = ? AND empresa_id = ?`,
            [
                datos.nombre,
                datos.descripcion || null,
                datos.tipo_obra || 'construccion',
                datos.ubicacion,
                datos.zona || null,
                datos.municipio || null,
                datos.provincia || null,
                datos.presupuesto_aprobado,
                datos.fecha_inicio,
                datos.fecha_fin_estimada,
                datos.cliente_id || null,
                datos.responsable_id || null,
                userId,
                id,
                empresaId
            ]
        )
        
        connection.release()

        return { success: true, mensaje: 'Obra actualizada exitosamente' }
    } catch (error) {
        console.error('Error al actualizar obra:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al actualizar obra' }
    }
}
