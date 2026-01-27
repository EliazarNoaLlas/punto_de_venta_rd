"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { obtenerObras } from '../obras/servidor'

export async function obtenerComprasObra(filtros = {}) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        let query = `
            SELECT co.*,
                   o.nombre AS obra_nombre,
                   o.codigo_obra,
                   p.nombre_comercial AS proveedor_nombre,
                   COUNT(cod.id) as cantidad_items
            FROM compras_obra co
            LEFT JOIN obras o ON co.tipo_destino = 'obra' AND co.destino_id = o.id
            LEFT JOIN proveedores p ON co.proveedor_id = p.id
            LEFT JOIN compras_obra_detalle cod ON co.id = cod.compra_obra_id
            WHERE co.empresa_id = ?
        `
        const params = [empresaId]
        
        if (filtros.obra_id) {
            query += ' AND co.tipo_destino = "obra" AND co.destino_id = ?'
            params.push(filtros.obra_id)
        }
        
        if (filtros.estado) {
            query += ' AND co.estado = ?'
            params.push(filtros.estado)
        }
        
        if (filtros.tipo_compra) {
            query += ' AND co.tipo_compra = ?'
            params.push(filtros.tipo_compra)
        }
        
        if (filtros.fecha_desde) {
            query += ' AND co.fecha_compra >= ?'
            params.push(filtros.fecha_desde)
        }
        
        if (filtros.fecha_hasta) {
            query += ' AND co.fecha_compra <= ?'
            params.push(filtros.fecha_hasta)
        }
        
        query += ' GROUP BY co.id ORDER BY co.fecha_compra DESC'
        
        const [compras] = await connection.query(query, params)
        connection.release()
        
        return { success: true, compras }
    } catch (error) {
        console.error('Error al obtener compras de obra:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar compras' }
    }
}

export async function obtenerCompraObraPorId(id) {
    let connection
    try {
        const cookieStore = await cookies()
        const empresaId = cookieStore.get('empresaId')?.value

        if (!empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        connection = await db.getConnection()
        
        // Obtener compra
        const [compras] = await connection.query(
            `SELECT co.*,
                    o.nombre AS obra_nombre,
                    o.codigo_obra,
                    p.nombre_comercial AS proveedor_nombre
             FROM compras_obra co
             LEFT JOIN obras o ON co.tipo_destino = 'obra' AND co.destino_id = o.id
             LEFT JOIN proveedores p ON co.proveedor_id = p.id
             WHERE co.id = ? AND co.empresa_id = ?`,
            [id, empresaId]
        )
        
        if (compras.length === 0) {
            connection.release()
            return { success: false, mensaje: 'Compra no encontrada' }
        }
        
        // Obtener detalle
        const [detalle] = await connection.query(
            'SELECT * FROM compras_obra_detalle WHERE compra_obra_id = ?',
            [id]
        )
        
        connection.release()
        
        return { 
            success: true, 
            compra: { ...compras[0], detalle } 
        }
    } catch (error) {
        console.error('Error al obtener compra:', error)
        if (connection) connection.release()
        return { success: false, mensaje: 'Error al cargar compra' }
    }
}

export async function crearCompraObra(datos) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value

        if (!userId || !empresaId) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // Validaciones básicas
        if (!datos.proveedor_id) {
            return { success: false, mensaje: 'Debe seleccionar un proveedor' }
        }
        
        if (!datos.tipo_destino || !datos.destino_id) {
            return { success: false, mensaje: 'Debe seleccionar una obra o servicio' }
        }
        
        if (!datos.numero_factura || datos.numero_factura.trim() === '') {
            return { success: false, mensaje: 'El número de factura es obligatorio' }
        }
        
        if (!datos.detalle || datos.detalle.length === 0) {
            return { success: false, mensaje: 'Debe agregar al menos un material' }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            // Insertar compra
            const [result] = await connection.query(
                `INSERT INTO compras_obra (
                    empresa_id, tipo_destino, destino_id, orden_trabajo_id,
                    proveedor_id, numero_factura, tipo_comprobante,
                    subtotal, impuesto, total, forma_pago, tipo_compra,
                    estado, fecha_compra, notas, usuario_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    empresaId,
                    datos.tipo_destino,
                    datos.destino_id,
                    datos.orden_trabajo_id || null,
                    datos.proveedor_id,
                    datos.numero_factura,
                    datos.tipo_comprobante || null,
                    datos.subtotal,
                    datos.impuesto || 0,
                    datos.total,
                    datos.forma_pago,
                    datos.tipo_compra || 'planificada',
                    'registrada',
                    datos.fecha_compra || new Date().toISOString().split('T')[0],
                    datos.notas || null,
                    userId
                ]
            )
            
            const compraId = result.insertId
            
            // Insertar detalle
            for (const item of datos.detalle) {
                await connection.query(
                    `INSERT INTO compras_obra_detalle (
                        compra_obra_id, material_nombre, material_descripcion,
                        unidad_medida, cantidad, precio_unitario, subtotal, producto_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        compraId,
                        item.material_nombre,
                        item.material_descripcion || null,
                        item.unidad_medida || null,
                        item.cantidad,
                        item.precio_unitario,
                        item.subtotal,
                        item.producto_id || null
                    ]
                )
            }
            
            await connection.commit()
            connection.release()
            
            return { success: true, mensaje: 'Compra registrada exitosamente', id: compraId }
        } catch (innerError) {
            await connection.rollback()
            throw innerError
        }
    } catch (error) {
        console.error('Error al crear compra:', error)
        if (connection) {
            await connection.rollback()
            connection.release()
        }
        return { success: false, mensaje: 'Error al registrar compra' }
    }
}

export async function obtenerObrasParaCompra() {
    const res = await obtenerObras({ estado: 'activa' })
    return res
}

