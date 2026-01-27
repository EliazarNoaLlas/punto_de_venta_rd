"use server"

import db from "@/_DB/db"
import { dbCrearObra } from "@/lib/services/constructionService"
import { validarObra } from '../../core/construction/validaciones'
import { ESTADOS_OBRA } from '../../core/construction/estados'
import { obtenerUsuarioActual, validarPermisoObras, mapearDatosFormularioABD } from '../lib'

/**
 * Crear nueva obra
 */
export async function crearObra(datos) {
    let connection
    try {
        const usuario = await obtenerUsuarioActual()
        validarPermisoObras(usuario)

        // Validar datos usando reglas del dominio
        const validacion = validarObra(datos)
        if (!validacion.valido) {
            return {
                success: false,
                mensaje: Object.values(validacion.errores)[0],
                errores: validacion.errores
            }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        // Generar código automático si no existe
        let codigoObra = datos.codigo || datos.codigo_obra
        if (!codigoObra) {
            const [ultimaObra] = await connection.execute(
                'SELECT codigo_obra FROM obras WHERE empresa_id = ? ORDER BY id DESC LIMIT 1',
                [usuario.empresaId]
            )

            let numero = 1
            if (ultimaObra.length > 0 && ultimaObra[0].codigo_obra) {
                const match = ultimaObra[0].codigo_obra.match(/\d+$/)
                if (match) numero = parseInt(match[0]) + 1
            }

            codigoObra = `OB-${new Date().getFullYear()}-${String(numero).padStart(3, '0')}`
        }

        // Mapear datos del formulario a formato BD
        const datosBD = mapearDatosFormularioABD(datos)

        // Crear obra usando el servicio
        const obraId = await dbCrearObra(connection, {
            ...datosBD,
            empresa_id: usuario.empresaId,
            codigo_obra: codigoObra,
            estado: ESTADOS_OBRA.ACTIVA,
            creado_por: usuario.id
        })

        await connection.commit()
        connection.release()

        return {
            success: true,
            mensaje: 'Obra creada exitosamente',
            obraId,
            codigo: codigoObra
        }
    } catch (error) {
        console.error('Error al crear obra:', error)
        if (connection) {
            await connection.rollback()
            connection.release()
        }
        return {
            success: false,
            mensaje: error.message || 'Error al crear obra'
        }
    }
}

