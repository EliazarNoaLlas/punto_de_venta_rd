"use server"

import db from "@/_DB/db"
import { cookies } from 'next/headers'
import { obtenerCajaAbierta } from '../servidor'

export async function obtenerDatosVenta() {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesion invalida'
            }
        }

        connection = await db.getConnection()

        const [empresa] = await connection.execute(
            `SELECT id,
                    nombre_empresa,
                    rnc,
                    impuesto_nombre,
                    impuesto_porcentaje,
                    simbolo_moneda
             FROM empresas
             WHERE id = ?
               AND activo = TRUE`,
            [empresaId]
        )

        if (empresa.length === 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'Empresa no encontrada'
            }
        }

        const [tiposComprobante] = await connection.execute(
            `SELECT id,
                    codigo,
                    nombre,
                    prefijo_ncf,
                    requiere_rnc,
                    requiere_razon_social
             FROM tipos_comprobante
             WHERE activo = TRUE
             ORDER BY codigo ASC`
        )

        const [tiposDocumento] = await connection.execute(
            `SELECT id,
                    codigo,
                    nombre
             FROM tipos_documento
             WHERE activo = TRUE
             ORDER BY codigo ASC`
        )

        connection.release()

        return {
            success: true,
            empresa: empresa[0],
            tiposComprobante: tiposComprobante,
            tiposDocumento: tiposDocumento
        }

    } catch (error) {
        console.error('Error al obtener datos de venta:', error)

        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al cargar datos'
        }
    }
}

export async function buscarProductos(termino) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesion invalida'
            }
        }

        connection = await db.getConnection()

        const [productos] = await connection.execute(
            `SELECT id,
                    codigo_barras,
                    sku,
                    nombre,
                    precio_venta,
                    stock,
                    aplica_itbis
             FROM productos
             WHERE empresa_id = ?
               AND activo = TRUE
               AND (
                 nombre LIKE ? OR
                 codigo_barras LIKE ? OR
                 sku LIKE ?
                 )
               AND stock > 0
             ORDER BY nombre ASC LIMIT 20`,
            [empresaId, `%${termino}%`, `%${termino}%`, `%${termino}%`]
        )

        connection.release()

        return {
            success: true,
            productos: productos
        }

    } catch (error) {
        console.error('Error al buscar productos:', error)

        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al buscar productos'
        }
    }
}

export async function buscarClientes(termino = '') {
    let connection

    try {
        // =========================
        // Validación de sesión
        // =========================
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || !['admin', 'vendedor'].includes(userTipo)) {
            return { success: false, mensaje: 'Sesión inválida' }
        }

        // =========================
        // Normalizar término
        // =========================
        // =========================
        // Normalizar término
        // =========================
        const terminoLimpio = termino?.toString().trim()

        // Caso: término muy corto pero no vacío (evita búsquedas pobres)
        if (terminoLimpio.length > 0 && terminoLimpio.length < 2) {
            return { success: true, clientes: [] }
        }

        connection = await db.getConnection()

        // =========================
        // Lógica de Búsqueda
        // =========================
        let sql
        let params

        if (!terminoLimpio) {
            // CASO 1: Búsqueda vacía -> Retornar últimos 10 clientes
            // Usamos la misma estructura de columnas que la búsqueda general para evitar errores en frontend
            sql = `
                SELECT c.id,
                       c.numero_documento,
                       CONCAT(c.nombre, ' ', IFNULL(c.apellidos, '')) AS nombre_completo,
                       td.codigo                                      AS tipo_documento,
                       c.telefono,
                       c.email,
                       c.puntos_fidelidad
                FROM clientes c
                         INNER JOIN tipos_documento td ON td.id = c.tipo_documento_id
                WHERE c.empresa_id = ?
                  AND c.activo = TRUE
                  AND c.estado = 'activo'
                ORDER BY c.nombre ASC
                LIMIT 20
            `
            params = [empresaId]
        } else {
            // CASO 2: Búsqueda General (Nombre, Apellido, Documento, Teléfono, Email)
            const like = `%${terminoLimpio}%`
            sql = `
                SELECT c.id,
                       c.numero_documento,
                       CONCAT(c.nombre, ' ', IFNULL(c.apellidos, '')) AS nombre_completo,
                       td.codigo                                      AS tipo_documento,
                       c.telefono,
                       c.email,
                       c.puntos_fidelidad
                FROM clientes c
                         INNER JOIN tipos_documento td ON td.id = c.tipo_documento_id
                WHERE c.empresa_id = ?
                  AND c.activo = TRUE
                  AND c.estado = 'activo'
                  AND (
                    c.numero_documento LIKE ?
                        OR c.nombre LIKE ?
                        OR c.apellidos LIKE ?
                        OR c.telefono LIKE ?
                        OR c.email LIKE ?
                    )
                ORDER BY c.nombre ASC
                LIMIT 20
            `
            params = [
                empresaId,
                like, like, like, like, like
            ]
        }

        const [clientes] = await connection.execute(sql, params)

        return {
            success: true,
            clientes
        }

    } catch (error) {
        console.error('[buscarClientes]', error)
        return {
            success: false,
            mensaje: 'Error al buscar clientes'
        }
    } finally {
        if (connection) connection.release()
    }
}


export async function crearClienteRapido(nombre) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesion invalida'
            }
        }

        connection = await db.getConnection()

        const [tipoDocCedula] = await connection.execute(
            `SELECT id
             FROM tipos_documento
             WHERE codigo = 'CED' LIMIT 1`
        )

        if (tipoDocCedula.length === 0) {
            connection.release()
            return {
                success: false,
                mensaje: 'Tipo de documento no encontrado'
            }
        }

        const timestamp = Date.now()
        const numeroDocumentoTemporal = `TEMP${timestamp}`

        const [resultado] = await connection.execute(
            `INSERT INTO clientes (empresa_id,
                                   tipo_documento_id,
                                   numero_documento,
                                   nombre,
                                   activo)
             VALUES (?, ?, ?, ?, TRUE)`,
            [empresaId, tipoDocCedula[0].id, numeroDocumentoTemporal, nombre]
        )

        const [nuevoCliente] = await connection.execute(
            `SELECT c.id,
                    c.nombre,
                    c.numero_documento,
                    td.codigo as tipo_documento
             FROM clientes c
                      INNER JOIN tipos_documento td ON c.tipo_documento_id = td.id
             WHERE c.id = ?`,
            [resultado.insertId]
        )

        connection.release()

        return {
            success: true,
            mensaje: 'Cliente creado exitosamente',
            cliente: nuevoCliente[0]
        }

    } catch (error) {
        console.error('Error al crear cliente rapido:', error)

        if (connection) {
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al crear el cliente'
        }
    }
}

export async function crearVenta(datosVenta) {
    let connection
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('userId')?.value
        const empresaId = cookieStore.get('empresaId')?.value
        const userTipo = cookieStore.get('userTipo')?.value

        if (!userId || !empresaId || (userTipo !== 'admin' && userTipo !== 'vendedor')) {
            return {
                success: false,
                mensaje: 'Sesion invalida'
            }
        }

        if (!datosVenta.metodo_pago) {
            return {
                success: false,
                mensaje: 'Método de pago requerido'
            }
        }

        if (datosVenta.metodo_pago === 'efectivo' && datosVenta.efectivo_recibido < datosVenta.total) {
            return {
                success: false,
                mensaje: 'Efectivo insuficiente'
            }
        }

        connection = await db.getConnection()
        await connection.beginTransaction()

        // ============================================
        // VALIDACIÓN COMPLETA DE CRÉDITO
        // ============================================
        if (datosVenta.metodo_pago === 'credito') {
            if (!datosVenta.cliente_id) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'Venta a crédito requiere un cliente seleccionado'
                }
            }

            // 1. Verificar configuración de crédito
            const [credito] = await connection.execute(
                `SELECT *
                 FROM credito_clientes
                 WHERE cliente_id = ?
                   AND empresa_id = ?
                   AND activo = TRUE`,
                [datosVenta.cliente_id, empresaId]
            )

            if (credito.length === 0) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'El cliente no tiene configuración de crédito'
                }
            }

            const c = credito[0]

            // 2. Verificar estado del crédito
            if (c.estado_credito === 'bloqueado') {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'El crédito de este cliente está bloqueado por incumplimiento'
                }
            }

            if (c.estado_credito === 'suspendido') {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'El crédito de este cliente está suspendido temporalmente'
                }
            }

            // 3. Verificar clasificación crediticia
            if (c.clasificacion === 'D') {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'Cliente con clasificación D (Moroso). No se puede otorgar crédito'
                }
            }

            // 4. Verificar saldo disponible
            if (parseFloat(c.saldo_disponible) <= 0) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'El cliente no tiene saldo de crédito disponible'
                }
            }

            // 5. Verificar que la venta no exceda el límite
            if (parseFloat(datosVenta.total) > parseFloat(c.saldo_disponible)) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: `Esta venta (${new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(datosVenta.total)}) excede el saldo disponible (${new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(c.saldo_disponible)})`
                }
            }

            // 6. Verificar deudas vencidas
            const [deudasVencidas] = await connection.execute(
                `SELECT COUNT(*) as total, SUM(saldo_pendiente) as monto
                 FROM cuentas_por_cobrar
                 WHERE cliente_id = ?
                   AND empresa_id = ?
                   AND estado_cxc = 'vencida'`,
                [datosVenta.cliente_id, empresaId]
            )

            if (deudasVencidas[0].total > 0) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: `Cliente tiene ${deudasVencidas[0].total} factura(s) vencida(s) por ${new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(deudasVencidas[0].monto || 0)}. Debe regularizar antes de nueva compra a crédito`
                }
            }

            // 7. Verificar alertas críticas
            const [alertasCriticas] = await connection.execute(
                `SELECT COUNT(*) as total
                 FROM alertas_credito
                 WHERE cliente_id = ?
                   AND empresa_id = ?
                   AND estado = 'activa'
                   AND severidad = 'critica'`,
                [datosVenta.cliente_id, empresaId]
            )

            if (alertasCriticas[0].total > 0) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'El cliente tiene alertas críticas activas. Consulte con el administrador'
                }
            }
        }

        // Obtener tipo de comprobante y generar NCF
        const [tipoComprobante] = await connection.execute(
            `SELECT id,
                    codigo,
                    prefijo_ncf,
                    secuencia_actual,
                    secuencia_hasta
             FROM tipos_comprobante
             WHERE id = ?`,
            [datosVenta.tipo_comprobante_id]
        )

        if (tipoComprobante.length === 0) {
            await connection.rollback()
            connection.release()
            return {
                success: false,
                mensaje: 'Tipo de comprobante no encontrado'
            }
        }

        const secuenciaActual = tipoComprobante[0].secuencia_actual
        const secuenciaHasta = tipoComprobante[0].secuencia_hasta

        if (secuenciaActual > secuenciaHasta) {
            await connection.rollback()
            connection.release()
            return {
                success: false,
                mensaje: 'Se agotaron los NCF disponibles para este tipo de comprobante'
            }
        }

        const ncf = `${tipoComprobante[0].prefijo_ncf}${String(secuenciaActual).padStart(8, '0')}`

        await connection.execute(
            `UPDATE tipos_comprobante
             SET secuencia_actual = secuencia_actual + 1
             WHERE id = ?`,
            [datosVenta.tipo_comprobante_id]
        )

        // Generar número interno
        const [ultimaVenta] = await connection.execute(
            `SELECT MAX(CAST(SUBSTRING(numero_interno, 6) AS UNSIGNED)) as ultimo_numero
             FROM ventas
             WHERE empresa_id = ?`,
            [empresaId]
        )

        const numeroInterno = `VENTA${String((ultimaVenta[0].ultimo_numero || 0) + 1).padStart(6, '0')}`

        // Verificar stock de productos
        for (const producto of datosVenta.productos) {
            const [stockActual] = await connection.execute(
                `SELECT stock
                 FROM productos
                 WHERE id = ?
                   AND empresa_id = ?`,
                [producto.producto_id, empresaId]
            )

            if (stockActual.length === 0) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: 'Producto no encontrado'
                }
            }

            if (stockActual[0].stock < producto.cantidad_despachar) {
                await connection.rollback()
                connection.release()
                return {
                    success: false,
                    mensaje: `Stock insuficiente para el producto ID ${producto.producto_id}`
                }
            }
        }

        // Obtener caja activa (usando la nueva lógica compartida)
        const cajaId = await obtenerCajaAbierta(connection, empresaId, userId)

        if (!cajaId) {
            await connection.rollback()
            connection.release()
            return {
                success: false,
                mensaje: 'No tienes una caja abierta. Abre una caja antes de realizar ventas.'
            }
        }
        const hayDespachoParcial = datosVenta.tipo_entrega === 'parcial'
        const despachoCompleto = !hayDespachoParcial

        // Insertar venta
        const [resultadoVenta] = await connection.execute(
            `INSERT INTO ventas (empresa_id,
                                 tipo_comprobante_id,
                                 ncf,
                                 numero_interno,
                                 usuario_id,
                                 cliente_id,
                                 caja_id,
                                 subtotal,
                                 descuento,
                                 monto_gravado,
                                 itbis,
                                 total,
                                 metodo_pago,
                                 tipo_entrega,
                                 despacho_completo,
                                 efectivo_recibido,
                                 cambio,
                                 estado,
                                 notas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'emitida', ?)`,
            [
                empresaId,
                datosVenta.tipo_comprobante_id,
                ncf,
                numeroInterno,
                userId,
                datosVenta.cliente_id,
                cajaId,
                datosVenta.subtotal,
                datosVenta.descuento,
                datosVenta.monto_gravado,
                datosVenta.itbis,
                datosVenta.total,
                datosVenta.metodo_pago,
                datosVenta.tipo_entrega,
                despachoCompleto,
                datosVenta.efectivo_recibido,
                datosVenta.cambio,
                datosVenta.notas
            ]
        )

        // ACTUALIZAR TOTALES DE CAJA (CRÍTICO PARA POS)
        await connection.execute(
            `UPDATE cajas
             SET total_ventas          = total_ventas + ?,
                 total_efectivo        = total_efectivo + IF(? = 'efectivo', ?, 0),
                 total_tarjeta_debito  = total_tarjeta_debito + IF(? = 'tarjeta_debito', ?, 0),
                 total_tarjeta_credito = total_tarjeta_credito + IF(? = 'tarjeta_credito', ?, 0),
                 total_transferencia   = total_transferencia + IF(? = 'transferencia', ?, 0),
                 total_cheque          = total_cheque + IF(? = 'cheque', ?, 0)
             WHERE id = ?`,
            [
                datosVenta.total,
                datosVenta.metodo_pago, datosVenta.total,
                datosVenta.metodo_pago, datosVenta.total,
                datosVenta.metodo_pago, datosVenta.total,
                datosVenta.metodo_pago, datosVenta.total,
                datosVenta.metodo_pago, datosVenta.total,
                cajaId
            ]
        )

        const ventaId = resultadoVenta.insertId

        // Registrar Cuenta por Cobrar si es crédito
        if (datosVenta.metodo_pago === 'credito') {
            const [credito] = await connection.execute(
                `SELECT id, dias_plazo
                 FROM credito_clientes
                 WHERE cliente_id = ?
                   AND empresa_id = ?`,
                [datosVenta.cliente_id, empresaId]
            )

            const diasPlazo = credito[0].dias_plazo || 30
            const fechaVencimiento = new Date()
            fechaVencimiento.setDate(fechaVencimiento.getDate() + diasPlazo)
            const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0]

            await connection.execute(
                `INSERT INTO cuentas_por_cobrar (credito_cliente_id, empresa_id, cliente_id, venta_id,
                                                 origen, numero_documento, monto_total, fecha_emision,
                                                 fecha_vencimiento, fecha_vencimiento_original, creado_por)
                 VALUES (?, ?, ?, ?, 'venta', ?, ?, CURDATE(), ?, ?, ?)`,
                [
                    credito[0].id, empresaId, datosVenta.cliente_id, ventaId,
                    ncf, datosVenta.total, fechaVencimientoStr, fechaVencimientoStr, userId
                ]
            )
            // Note: Trigger trg_actualizar_saldo_credito_insert will update saldo_utilizado in credito_clientes
        }

        // Insertar detalle de productos
        for (const producto of datosVenta.productos) {
            const subtotalProducto = producto.cantidad * producto.precio_unitario
            const montoGravado = subtotalProducto
            const [empresa] = await connection.execute(
                `SELECT impuesto_porcentaje
                 FROM empresas
                 WHERE id = ?`,
                [empresaId]
            )
            const itbisProducto = (montoGravado * parseFloat(empresa[0].impuesto_porcentaje)) / 100
            const totalProducto = subtotalProducto + itbisProducto

            const cantidadDespachada = producto.cantidad_despachar
            const cantidadPendiente = producto.cantidad - producto.cantidad_despachar

            await connection.execute(
                `INSERT INTO detalle_ventas (venta_id,
                                             producto_id,
                                             cantidad,
                                             cantidad_despachada,
                                             cantidad_pendiente,
                                             precio_unitario,
                                             subtotal,
                                             descuento,
                                             monto_gravado,
                                             itbis,
                                             total)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
                [
                    ventaId,
                    producto.producto_id,
                    producto.cantidad,
                    cantidadDespachada,
                    cantidadPendiente,
                    producto.precio_unitario,
                    subtotalProducto,
                    montoGravado,
                    itbisProducto,
                    totalProducto
                ]
            )

            // Actualizar stock
            await connection.execute(
                `UPDATE productos
                 SET stock = stock - ?
                 WHERE id = ?
                   AND empresa_id = ?`,
                [cantidadDespachada, producto.producto_id, empresaId]
            )

            // Registrar movimiento de inventario
            const [productoActualizado] = await connection.execute(
                `SELECT stock
                 FROM productos
                 WHERE id = ?`,
                [producto.producto_id]
            )

            await connection.execute(
                `INSERT INTO movimientos_inventario (empresa_id,
                                                     producto_id,
                                                     tipo,
                                                     cantidad,
                                                     stock_anterior,
                                                     stock_nuevo,
                                                     referencia,
                                                     usuario_id,
                                                     notas)
                 VALUES (?, ?, 'salida', ?, ?, ?, ?, ?, ?)`,
                [
                    empresaId,
                    producto.producto_id,
                    cantidadDespachada,
                    productoActualizado[0].stock + cantidadDespachada,
                    productoActualizado[0].stock,
                    ncf,
                    userId,
                    `Venta ${numeroInterno}`
                ]
            )
        }

        // Insertar productos extra si existen
        if (datosVenta.extras && datosVenta.extras.length > 0) {
            const [empresa] = await connection.execute(
                `SELECT impuesto_porcentaje
                 FROM empresas
                 WHERE id = ?`,
                [empresaId]
            )
            const impuestoPorcentaje = parseFloat(empresa[0].impuesto_porcentaje)

            for (const extra of datosVenta.extras) {
                const cantidad = parseFloat(extra.cantidad) || 1
                const precioUnitario = parseFloat(extra.precio_unitario) || 0
                const montoBase = cantidad * precioUnitario
                const montoImpuesto = extra.aplica_itbis ? (montoBase * impuestoPorcentaje) / 100 : 0
                const montoTotal = montoBase + montoImpuesto

                await connection.execute(
                    `INSERT INTO venta_extras (venta_id,
                                               empresa_id,
                                               usuario_id,
                                               tipo,
                                               nombre,
                                               cantidad,
                                               precio_unitario,
                                               aplica_itbis,
                                               impuesto_porcentaje,
                                               monto_base,
                                               monto_impuesto,
                                               monto_total,
                                               notas)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        ventaId,
                        empresaId,
                        userId,
                        extra.tipo || 'otro',
                        extra.nombre,
                        cantidad,
                        precioUnitario,
                        extra.aplica_itbis ? 1 : 0,
                        impuestoPorcentaje,
                        montoBase,
                        montoImpuesto,
                        montoTotal,
                        extra.notas
                    ]
                )
            }
        }

        // Crear despacho si hay despacho parcial
        if (hayDespachoParcial) {
            const [resultadoDespacho] = await connection.execute(
                `INSERT INTO despachos (venta_id,
                                        numero_despacho,
                                        usuario_id,
                                        observaciones,
                                        estado)
                 VALUES (?, 1, ?, 'Despacho inicial parcial', 'activo')`,
                [ventaId, userId]
            )

            const despachoId = resultadoDespacho.insertId

            const [detallesVenta] = await connection.execute(
                `SELECT id, cantidad_despachada
                 FROM detalle_ventas
                 WHERE venta_id = ?`,
                [ventaId]
            )

            for (const detalle of detallesVenta) {
                if (detalle.cantidad_despachada > 0) {
                    await connection.execute(
                        `INSERT INTO detalle_despachos (despacho_id,
                                                        detalle_venta_id,
                                                        cantidad_despachada)
                         VALUES (?, ?, ?)`,
                        [despachoId, detalle.id, detalle.cantidad_despachada]
                    )
                }
            }
        }

        // Actualizar totales de cliente
        if (datosVenta.cliente_id) {
            await connection.execute(
                `UPDATE clientes
                 SET total_compras = total_compras + ?
                 WHERE id = ?
                   AND empresa_id = ?`,
                [datosVenta.total, datosVenta.cliente_id, empresaId]
            )
        }

        await connection.commit()
        connection.release()

        return {
            success: true,
            mensaje: 'Venta creada exitosamente',
            venta: {
                id: ventaId,
                ncf: ncf,
                numero_interno: numeroInterno
            }
        }

    } catch (error) {
        console.error('Error al crear venta:', error)

        if (connection) {
            await connection.rollback()
            connection.release()
        }

        return {
            success: false,
            mensaje: 'Error al crear la venta'
        }
    }
}