"use server"

/**
 * Barrel file para compatibilidad hacia atrás
 * Wraps todas las funciones de los casos de uso como async functions
 */

// Listar
export async function obtenerObras(filtros) {
    const { obtenerObras: obtenerObrasImpl } = await import('./listar/servidor')
    return await obtenerObrasImpl(filtros)
}

// Nuevo
export async function crearObra(datos) {
    const { crearObra: crearObraImpl } = await import('./nuevo/servidor')
    return await crearObraImpl(datos)
}

// Editar
export async function obtenerObraPorIdEditar(obraId) {
    const { obtenerObraPorId } = await import('./editar/servidor')
    return await obtenerObraPorId(obraId)
}

export async function actualizarObra(obraId, datos) {
    const { actualizarObra: actualizarObraImpl } = await import('./editar/servidor')
    return await actualizarObraImpl(obraId, datos)
}

// Ver
export async function obtenerObraPorId(obraId) {
    const { obtenerObraPorId: obtenerObraPorIdImpl } = await import('./ver/servidor')
    return await obtenerObraPorIdImpl(obraId)
}

// Estado
export async function cambiarEstadoObra(obraId, nuevoEstado, razon) {
    const { cambiarEstadoObra: cambiarEstadoObraImpl } = await import('./estado/servidor')
    return await cambiarEstadoObraImpl(obraId, nuevoEstado, razon)
}

// Estadísticas
export async function obtenerEstadisticasObra(obraId) {
    const { obtenerEstadisticasObra: obtenerEstadisticasObraImpl } = await import('./estadisticas/servidor')
    return await obtenerEstadisticasObraImpl(obraId)
}

// Formulario
export async function obtenerDatosFormulario() {
    const { obtenerDatosFormulario: obtenerDatosFormularioImpl } = await import('./formulario/servidor')
    return await obtenerDatosFormularioImpl()
}

// Bitácora
export async function obtenerTrabajadoresAsignados(obraId) {
    const { obtenerTrabajadoresAsignados: obtenerTrabajadoresAsignadosImpl } = await import('./bitacora/servidor')
    return await obtenerTrabajadoresAsignadosImpl(obraId)
}

export async function registrarBitacora(datos) {
    const { registrarBitacora: registrarBitacoraImpl } = await import('./bitacora/servidor')
    return await registrarBitacoraImpl(datos)
}

// Mantener funciones legacy para compatibilidad
export async function guardarObra(datos) {
    const { crearObra: crearObraImpl } = await import('./nuevo/servidor')
    return await crearObraImpl(datos)
}
