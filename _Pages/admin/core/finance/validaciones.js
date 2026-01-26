/**
 * Validaciones compartidas del dominio Financiamiento
 * 
 * Este archivo contiene funciones de validación que pueden ser
 * reutilizadas por múltiples módulos del sistema de financiamiento.
 */

import { REGLAS_NEGOCIO, validarTasaInteres, validarPlazo, validarMontoFinanciable, validarMontoInicial } from './reglas.js'

/**
 * Valida los datos básicos de un plan de financiamiento
 * @param {Object} datos - Datos del plan a validar
 * @returns {Object} { valido: boolean, errores: string[] }
 */
export function validarDatosPlan(datos) {
  const errores = []
  
  // Validar código
  if (!datos.codigo || typeof datos.codigo !== 'string' || datos.codigo.trim().length === 0) {
    errores.push('El código del plan es requerido')
  } else if (datos.codigo.length > 20) {
    errores.push('El código no puede exceder 20 caracteres')
  }
  
  // Validar nombre
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length === 0) {
    errores.push('El nombre del plan es requerido')
  } else if (datos.nombre.length > 100) {
    errores.push('El nombre no puede exceder 100 caracteres')
  }
  
  // Validar plazo
  const validacionPlazo = validarPlazo(datos.plazo_meses)
  if (!validacionPlazo.valido) {
    errores.push(validacionPlazo.error)
  }
  
  // Validar tasa de interés
  const validacionTasa = validarTasaInteres(datos.tasa_interes_anual)
  if (!validacionTasa.valido) {
    errores.push(validacionTasa.error)
  }
  
  // Validar pago inicial mínimo (si se proporciona)
  if (datos.pago_inicial_minimo_pct !== undefined) {
    if (datos.pago_inicial_minimo_pct < 0 || datos.pago_inicial_minimo_pct > 100) {
      errores.push('El porcentaje de pago inicial debe estar entre 0 y 100')
    }
  }
  
  // Validar monto mínimo (si se proporciona)
  if (datos.monto_minimo !== undefined && datos.monto_minimo !== null) {
    if (datos.monto_minimo < 0) {
      errores.push('El monto mínimo no puede ser negativo')
    }
  }
  
  // Validar monto máximo (si se proporciona)
  if (datos.monto_maximo !== undefined && datos.monto_maximo !== null) {
    if (datos.monto_maximo < 0) {
      errores.push('El monto máximo no puede ser negativo')
    }
    if (datos.monto_minimo && datos.monto_maximo && datos.monto_maximo < datos.monto_minimo) {
      errores.push('El monto máximo no puede ser menor al monto mínimo')
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  }
}

/**
 * Valida los datos de un contrato de financiamiento
 * @param {Object} datos - Datos del contrato a validar
 * @returns {Object} { valido: boolean, errores: string[] }
 */
export function validarDatosContrato(datos) {
  const errores = []
  
  // Validar cliente
  if (!datos.cliente_id || typeof datos.cliente_id !== 'number') {
    errores.push('El cliente es requerido')
  }
  
  // Validar plan
  if (!datos.plan_id || typeof datos.plan_id !== 'number') {
    errores.push('El plan de financiamiento es requerido')
  }
  
  // Validar venta asociada
  if (!datos.venta_id || typeof datos.venta_id !== 'number') {
    errores.push('La venta asociada es requerida')
  }
  
  // Validar NCF
  if (!datos.ncf || typeof datos.ncf !== 'string' || datos.ncf.trim().length === 0) {
    errores.push('El NCF es requerido')
  }
  
  // Validar precio del producto
  if (!datos.precio_producto || typeof datos.precio_producto !== 'number' || datos.precio_producto <= 0) {
    errores.push('El precio del producto debe ser mayor a cero')
  }
  
  // Validar pago inicial
  if (datos.pago_inicial === undefined || typeof datos.pago_inicial !== 'number' || datos.pago_inicial < 0) {
    errores.push('El pago inicial debe ser un número válido mayor o igual a cero')
  }
  
  // Validar monto financiado
  const montoFinanciado = datos.precio_producto - (datos.pago_inicial || 0)
  if (montoFinanciado <= 0) {
    errores.push('El monto financiado debe ser mayor a cero')
  }
  
  const validacionMonto = validarMontoFinanciable(montoFinanciado)
  if (!validacionMonto.valido) {
    errores.push(validacionMonto.error)
  }
  
  // Validar fechas
  if (!datos.fecha_contrato) {
    errores.push('La fecha del contrato es requerida')
  }
  
  if (!datos.fecha_primer_pago) {
    errores.push('La fecha del primer pago es requerida')
  }
  
  // Validar que fecha_primer_pago sea posterior a fecha_contrato
  if (datos.fecha_contrato && datos.fecha_primer_pago) {
    const fechaContrato = new Date(datos.fecha_contrato)
    const fechaPrimerPago = new Date(datos.fecha_primer_pago)
    if (fechaPrimerPago < fechaContrato) {
      errores.push('La fecha del primer pago debe ser posterior a la fecha del contrato')
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  }
}

/**
 * Valida los datos de un pago
 * @param {Object} datos - Datos del pago a validar
 * @returns {Object} { valido: boolean, errores: string[] }
 */
export function validarDatosPago(datos) {
  const errores = []
  
  // Validar cuota
  if (!datos.cuota_id || typeof datos.cuota_id !== 'number') {
    errores.push('La cuota es requerida')
  }
  
  // Validar monto del pago
  if (!datos.monto_pago || typeof datos.monto_pago !== 'number' || datos.monto_pago <= 0) {
    errores.push('El monto del pago debe ser mayor a cero')
  }
  
  // Validar método de pago
  if (!datos.metodo_pago) {
    errores.push('El método de pago es requerido')
  }
  
  // Validar fecha de pago
  if (!datos.fecha_pago) {
    errores.push('La fecha del pago es requerida')
  }
  
  // Validar distribución del pago (suma debe ser igual al monto)
  const sumaDistribucion = (datos.aplicado_mora || 0) +
                          (datos.aplicado_interes || 0) +
                          (datos.aplicado_capital || 0) +
                          (datos.aplicado_futuro || 0)
  
  if (Math.abs(sumaDistribucion - datos.monto_pago) > 0.01) {
    errores.push('La distribución del pago no coincide con el monto total')
  }
  
  // Validar que no haya valores negativos en la distribución
  if (datos.aplicado_mora < 0 || datos.aplicado_interes < 0 || 
      datos.aplicado_capital < 0 || datos.aplicado_futuro < 0) {
    errores.push('Los montos de distribución no pueden ser negativos')
  }
  
  return {
    valido: errores.length === 0,
    errores
  }
}

/**
 * Valida que un número de contrato tenga el formato correcto
 * @param {string} numeroContrato - Número de contrato a validar
 * @returns {Object} { valido: boolean, error?: string }
 */
export function validarFormatoNumeroContrato(numeroContrato) {
  if (!numeroContrato || typeof numeroContrato !== 'string') {
    return { valido: false, error: 'El número de contrato es requerido' }
  }
  
  // Formato esperado: FIN-YYYY-NNNNN
  const formato = /^FIN-\d{4}-\d{5}$/
  
  if (!formato.test(numeroContrato)) {
    return { valido: false, error: 'El formato del número de contrato es inválido (esperado: FIN-YYYY-NNNNN)' }
  }
  
  return { valido: true }
}

/**
 * Valida que un número de recibo tenga el formato correcto
 * @param {string} numeroRecibo - Número de recibo a validar
 * @returns {Object} { valido: boolean, error?: string }
 */
export function validarFormatoNumeroRecibo(numeroRecibo) {
  if (!numeroRecibo || typeof numeroRecibo !== 'string') {
    return { valido: false, error: 'El número de recibo es requerido' }
  }
  
  // Formato esperado: REC-YYYY-NNNNN
  const formato = /^REC-\d{4}-\d{5}$/
  
  if (!formato.test(numeroRecibo)) {
    return { valido: false, error: 'El formato del número de recibo es inválido (esperado: REC-YYYY-NNNNN)' }
  }
  
  return { valido: true }
}

/**
 * Valida los datos de refinanciación
 * @param {Object} datos - Datos de refinanciación
 * @returns {Object} { valido: boolean, errores: string[] }
 */
export function validarDatosRefinanciacion(datos) {
  const errores = []
  
  // Validar contrato original
  if (!datos.contrato_id || typeof datos.contrato_id !== 'number') {
    errores.push('El contrato original es requerido')
  }
  
  // Validar nuevo plan
  if (!datos.nuevo_plan_id || typeof datos.nuevo_plan_id !== 'number') {
    errores.push('El nuevo plan de financiamiento es requerido')
  }
  
  // Validar nuevo plazo
  const validacionPlazo = validarPlazo(datos.nuevo_plazo_meses)
  if (!validacionPlazo.valido) {
    errores.push(validacionPlazo.error)
  }
  
  // Validar motivo
  if (!datos.motivo || typeof datos.motivo !== 'string' || datos.motivo.trim().length === 0) {
    errores.push('El motivo de la refinanciación es requerido')
  }
  
  return {
    valido: errores.length === 0,
    errores
  }
}

/**
 * Valida los datos de un contrato de financiamiento.
 * @param {object} contrato - Objeto con los datos del contrato.
 * @returns {{valido: boolean, errores: string[]}} Resultado de la validación.
 */
export function validarDatosContrato(contrato) {
    const errores = [];

    if (!contrato.cliente_id) {
        errores.push('El cliente es obligatorio.');
    }
    if (!contrato.plan_id) {
        errores.push('El plan de financiamiento es obligatorio.');
    }
    if (!contrato.venta_id) {
        errores.push('La venta asociada es obligatoria.');
    }
    if (!contrato.ncf) {
        errores.push('El NCF es obligatorio.');
    }
    if (!contrato.precio_producto || contrato.precio_producto <= 0) {
        errores.push('El precio del producto debe ser mayor a 0.');
    }
    if (!contrato.monto_financiado || contrato.monto_financiado <= 0) {
        errores.push('El monto financiado debe ser mayor a 0.');
    }
    if (!contrato.numero_cuotas || contrato.numero_cuotas <= 0) {
        errores.push('El número de cuotas debe ser mayor a 0.');
    }
    if (!contrato.fecha_primer_pago) {
        errores.push('La fecha del primer pago es obligatoria.');
    }

    // Validar que el monto financiado no sea mayor al precio
    if (contrato.precio_producto && contrato.monto_financiado && 
        contrato.monto_financiado > contrato.precio_producto) {
        errores.push('El monto financiado no puede ser mayor al precio del producto.');
    }

    // Validar que el pago inicial + monto financiado = precio producto
    const pagoInicial = contrato.pago_inicial || 0;
    const suma = pagoInicial + contrato.monto_financiado;
    const diferencia = Math.abs(suma - contrato.precio_producto);
    if (diferencia > 0.01) { // Tolerancia para decimales
        errores.push(`La suma del pago inicial (${pagoInicial}) y el monto financiado (${contrato.monto_financiado}) debe ser igual al precio del producto (${contrato.precio_producto}).`);
    }

    return {
        valido: errores.length === 0,
        errores: errores
    };
}

