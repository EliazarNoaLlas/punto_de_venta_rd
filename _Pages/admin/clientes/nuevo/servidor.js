"use server"

import db from "@/_DB/db";
import { cookies } from "next/headers";
import { guardarImagenCliente } from "@/services/imageService"
import { obtenerReglasCreditoPorEmpresa, calcularScoreInicial, registrarHistorialCredito } from "../lib";

// ============================================
// CREAR CLIENTE CON CRÉDITO (REGLA R-01)
// ============================================

export async function crearClienteConCredito(datos) {
    let connection;
    try {
        // 1️⃣ Validar sesión y permisos
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;
        const empresaId = cookieStore.get("empresaId")?.value;
        const userTipo = cookieStore.get("userTipo")?.value;

        if (!userId || !empresaId || (userTipo !== "admin" && userTipo !== "vendedor")) {
            return { success: false, mensaje: "No tienes permisos para crear clientes" };
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 2️⃣ Validar duplicado por número de documento
        const [existeDocumento] = await connection.execute(
            `SELECT id FROM clientes WHERE numero_documento = ? AND empresa_id = ?`,
            [datos.cliente.numero_documento, empresaId]
        );

        if (existeDocumento.length > 0) {
            await connection.rollback();
            connection.release();
            return { success: false, mensaje: "Ya existe un cliente con ese número de documento" };
        }

        // 3️⃣ Obtener reglas de crédito
        const reglas = await obtenerReglasCreditoPorEmpresa(empresaId, connection);

        // 4️⃣ Insertar cliente
        const [resultadoCliente] = await connection.execute(
            `INSERT INTO clientes (
                empresa_id,
                tipo_documento_id,
                numero_documento,
                nombre,
                apellidos,
                telefono,
                email,
                direccion,
                sector,
                municipio,
                provincia,
                fecha_nacimiento,
                genero,
                foto_url,
                estado,
                activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', 1)`,
            [
                empresaId,
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
                null
            ]
        );

        const clienteId = resultadoCliente.insertId;

        // 5️⃣ Procesar imagen si existe
        let imagenFinal = null;
        if (datos.cliente.imagen_base64) {
            try {
                imagenFinal = await guardarImagenCliente(datos.cliente.imagen_base64, clienteId);
                await connection.execute(
                    `UPDATE clientes SET foto_url = ? WHERE id = ? AND empresa_id = ?`,
                    [imagenFinal, clienteId, empresaId]
                );
            } catch (error) {
                await connection.rollback();
                connection.release();
                return { success: false, mensaje: "Error al guardar la imagen: " + error.message };
            }
        }

        // 6️⃣ Crear crédito obligatorio
        const limiteCredito = datos.credito?.limite ?? reglas.LIMITE_DEFAULT ?? 0;
        const frecuenciaPago = datos.credito?.frecuencia_pago ?? reglas.FRECUENCIA_DEFAULT ?? 'mensual';
        const diasPlazo = datos.credito?.dias_plazo ?? reglas.DIAS_PLAZO_DEFAULT ?? 30;
        const clasificacion = datos.credito?.clasificacion ?? 'C';
        const scoreInicial = calcularScoreInicial(clasificacion, datos.cliente.puntosFidelidad || 0);

        const [resultadoCredito] = await connection.execute(
            `INSERT INTO credito_clientes (
                cliente_id,
                empresa_id,
                limite_credito,
                saldo_utilizado,
                saldo_disponible,
                frecuencia_pago,
                dias_plazo,
                estado_credito,
                clasificacion,
                score_crediticio,
                activo,
                creado_por
            ) VALUES (?, ?, ?, 0, ?, ?, ?, 'normal', ?, ?, TRUE, ?)`,
            [
                clienteId,
                empresaId,
                limiteCredito,
                limiteCredito,  // saldo_disponible inicial = limite
                frecuenciaPago,
                diasPlazo,
                clasificacion,
                scoreInicial,
                userId
            ]
        );

        const creditoId = resultadoCredito.insertId;

        // 7️⃣ Registrar historial de crédito usando JSON
        await registrarHistorialCredito(connection, {
            credito_cliente_id: creditoId,
            cliente_id: clienteId,
            empresa_id: empresaId,
            tipo_evento: 'creacion_credito',
            datos_anteriores: null,
            datos_nuevos: {
                limite_credito: limiteCredito,
                saldo_utilizado: 0,
                saldo_disponible: limiteCredito,
                frecuencia_pago: frecuenciaPago,
                dias_plazo: diasPlazo,
                estado_credito: 'normal',
                clasificacion: clasificacion,
                score_crediticio: scoreInicial,
                activo: true
            },
            clasificacion_momento: clasificacion,
            score_momento: scoreInicial,
            observaciones: datos.credito?.observacion ?? 'Crédito inicial asignado automáticamente',
            usuario_id: userId
        });

        await connection.commit();
        connection.release();

        return {
            success: true,
            mensaje: "Cliente y perfil crediticio creados exitosamente",
            clienteId,
            creditoId,
            cliente: {
                id: clienteId,
                nombre: datos.cliente.nombre,
                apellidos: datos.cliente.apellidos,
                numero_documento: datos.cliente.numero_documento,
                foto_url: imagenFinal,
                credito: {
                    id: creditoId,
                    limite: limiteCredito,
                    clasificacion,
                    score: scoreInicial
                }
            }
        };

    } catch (error) {
        console.error("Error al crear cliente con crédito:", error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        return { success: false, mensaje: "Error al crear el cliente" };
    }
}
