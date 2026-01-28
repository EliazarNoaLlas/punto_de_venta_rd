"use server"

import db from "@/_DB/db";
import { cookies } from "next/headers";
import { guardarImagenCliente } from "@/services/imageService"
import { calcularScoreInicial, registrarHistorialCredito } from "../lib";

// ============================================
// ACTUALIZAR CLIENTE Y CRÉDITO
// ============================================

export async function actualizarClienteYCredito(datos) {
    let connection;
    try {
        // 1️⃣ Validar sesión y permisos
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;
        const empresaId = cookieStore.get("empresaId")?.value;
        const userTipo = cookieStore.get("userTipo")?.value;

        if (!userId || !empresaId || (userTipo !== "admin" && userTipo !== "vendedor")) {
            return { success: false, mensaje: "No tienes permisos" };
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 2️⃣ Validar existencia del cliente
        const [clienteExiste] = await connection.execute(
            `SELECT id FROM clientes WHERE id = ? AND empresa_id = ?`,
            [datos.cliente_id, empresaId]
        );

        if (clienteExiste.length === 0) {
            await connection.rollback();
            connection.release();
            return { success: false, mensaje: "Cliente no encontrado" };
        }

        // 3️⃣ Validar duplicado de documento (excepto este cliente)
        const [existeDocumento] = await connection.execute(
            `SELECT id FROM clientes WHERE numero_documento = ? AND empresa_id = ? AND id != ?`,
            [datos.cliente.numero_documento, empresaId, datos.cliente_id]
        );

        if (existeDocumento.length > 0) {
            await connection.rollback();
            connection.release();
            return { success: false, mensaje: "Ya existe otro cliente con ese número de documento" };
        }

        // 4️⃣ Actualizar datos del cliente
        await connection.execute(
            `UPDATE clientes
             SET tipo_documento_id = ?,
                 numero_documento  = ?,
                 nombre            = ?,
                 apellidos         = ?,
                 telefono          = ?,
                 email             = ?,
                 direccion         = ?,
                 sector            = ?,
                 municipio         = ?,
                 provincia         = ?,
                 fecha_nacimiento  = ?,
                 genero            = ?,
                 estado            = ?
             WHERE id = ? AND empresa_id = ?`,
            [
                datos.cliente.tipo_documento_id,
                datos.cliente.numero_documento,
                datos.cliente.nombre,
                datos.cliente.apellidos || null,
                datos.cliente.telefono || null,
                datos.cliente.email || null,
                datos.cliente.direccion || null,
                datos.cliente.sector || null,
                datos.cliente.municipio || null,
                datos.cliente.provincia || null,
                datos.cliente.fecha_nacimiento || null,
                datos.cliente.genero || null,
                datos.cliente.activo ? 'activo' : 'inactivo',
                datos.cliente_id,
                empresaId
            ]
        );

        // 5️⃣ Actualizar imagen si existe
        if (datos.cliente.imagen_base64) {
            try {
                const imagenFinal = await guardarImagenCliente(datos.cliente.imagen_base64, datos.cliente_id);
                await connection.execute(
                    `UPDATE clientes SET foto_url = ? WHERE id = ? AND empresa_id = ?`,
                    [imagenFinal, datos.cliente_id, empresaId]
                );
            } catch (error) {
                await connection.rollback();
                connection.release();
                return { success: false, mensaje: "Error al actualizar imagen: " + error.message };
            }
        }

        // 6️⃣ Actualizar o crear crédito (solo admin)
        if (datos.credito && userTipo === 'admin') {
            // Obtener crédito actual
            const [creditoActual] = await connection.execute(
                `SELECT id, limite_credito, clasificacion, frecuencia_pago, dias_plazo, activo
                 FROM credito_clientes
                 WHERE cliente_id = ? AND empresa_id = ?`,
                [datos.cliente_id, empresaId]
            );

            if (creditoActual.length > 0) {
                const cActual = creditoActual[0];
                const creditoId = cActual.id;

                // Nuevos valores
                const limiteNuevo = datos.credito.limite ?? cActual.limite_credito;
                const clasificacionNueva = datos.credito.clasificacion ?? cActual.clasificacion;
                const frecuenciaPago = datos.credito.frecuencia_pago ?? cActual.frecuencia_pago ?? 'mensual';
                const diasPlazo = datos.credito.dias_plazo ?? cActual.dias_plazo ?? 30;
                const activoNuevo = datos.credito.activo !== false;

                // Actualizar crédito
                await connection.execute(
                    `UPDATE credito_clientes
                     SET limite_credito  = ?,
                         frecuencia_pago = ?,
                         dias_plazo      = ?,
                         clasificacion   = ?,
                         activo          = ?,
                         modificado_por  = ?
                     WHERE id = ?`,
                    [
                        limiteNuevo,
                        frecuenciaPago,
                        diasPlazo,
                        clasificacionNueva,
                        activoNuevo,
                        userId,
                        creditoId
                    ]
                );

                // Registrar historial si hubo cambios
                const huboCambios =
                    cActual.limite_credito !== limiteNuevo ||
                    cActual.clasificacion !== clasificacionNueva ||
                    cActual.frecuencia_pago !== frecuenciaPago ||
                    cActual.dias_plazo !== diasPlazo ||
                    cActual.activo !== activoNuevo;

                if (huboCambios) {
                    await registrarHistorialCredito(connection, {
                        credito_cliente_id: creditoId,
                        cliente_id: datos.cliente_id,
                        empresa_id: empresaId,
                        tipo_evento: 'ajuste_manual',
                        datos_anteriores: {
                            limite_credito: cActual.limite_credito,
                            clasificacion: cActual.clasificacion,
                            frecuencia_pago: cActual.frecuencia_pago,
                            dias_plazo: cActual.dias_plazo,
                            activo: cActual.activo
                        },
                        datos_nuevos: {
                            limite_credito: limiteNuevo,
                            clasificacion: clasificacionNueva,
                            frecuencia_pago: frecuenciaPago,
                            dias_plazo: diasPlazo,
                            activo: activoNuevo
                        },
                        clasificacion_momento: clasificacionNueva,
                        score_momento: await calcularScoreInicial(clasificacionNueva),
                        observaciones: datos.credito.observacion || 'Ajuste manual realizado',
                        usuario_id: userId
                    });
                }
            } else if (datos.credito.activo) {
                // Crear crédito si no existe y está activo
                const limiteNuevo = datos.credito.limite || 0;
                const clasificacionNueva = 'C'; // Clasificación inicial por defecto
                const frecuenciaPago = datos.credito.frecuencia_pago || 'mensual';
                const diasPlazo = datos.credito.dias_plazo || 30;
                const scoreInicial = await calcularScoreInicial(clasificacionNueva, 0);

                // No incluir saldo_disponible porque es una columna COMPUTED
                const [resultCredito] = await connection.execute(
                    `INSERT INTO credito_clientes (
                        cliente_id, empresa_id, limite_credito, saldo_utilizado, 
                        estado_credito, clasificacion, score_crediticio,
                        frecuencia_pago, dias_plazo, activo, creado_por
                    ) VALUES (?, ?, ?, 0, 'normal', ?, ?, ?, ?, TRUE, ?)`,
                    [
                        datos.cliente_id,
                        empresaId,
                        limiteNuevo,
                        clasificacionNueva,
                        scoreInicial,
                        frecuenciaPago,
                        diasPlazo,
                        userId
                    ]
                );

                const creditoId = resultCredito.insertId;

                // Registrar en historial la creación
                await registrarHistorialCredito(connection, {
                    credito_cliente_id: creditoId,
                    cliente_id: datos.cliente_id,
                    empresa_id: empresaId,
                    tipo_evento: 'creacion',
                    datos_anteriores: null,
                    datos_nuevos: {
                        limite_credito: limiteNuevo,
                        clasificacion: clasificacionNueva,
                        frecuencia_pago: frecuenciaPago,
                        dias_plazo: diasPlazo,
                        activo: true
                    },
                    clasificacion_momento: clasificacionNueva,
                    score_momento: scoreInicial,
                    observaciones: datos.credito.observacion || 'Perfil de crédito creado desde edición',
                    usuario_id: userId
                });
            }
        }

        await connection.commit();
        connection.release();

        return {
            success: true,
            mensaje: "Cliente y crédito actualizados exitosamente"
        };

    } catch (error) {
        console.error("Error al actualizar cliente y crédito:", error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        return { success: false, mensaje: "Error al actualizar el cliente y crédito" };
    }
}
