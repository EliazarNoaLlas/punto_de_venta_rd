"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { dbObtenerObras, dbCrearObra } from "@/lib/services/constructionService"

export async function obtenerObras(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesion invalida' }
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

export async function guardarObra(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesion invalida' }
        }

        connection = await db.getConnection()
        const id = await dbCrearObra(connection, { ...datos, empresa_id: empresaId })
        connection.release()

        return { success: true, mensaje: 'Obra registrada exitosamente', id }
    } catch (error) {
        console.error('Error al guardar obra:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al registrar obra' }
    }
}
