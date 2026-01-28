/**
 * Cálculos financieros del dominio Financiamiento
 * 
 * Este archivo contiene todas las funciones de cálculo financiero:
 * amortización, mora, scoring crediticio, conversiones de tasas, etc.
 * 
 * Movido desde utils/financiamientoUtils.js para centralizar la lógica
 * del dominio compartido.
 */

/**
 * Calcula la amortización usando el método francés
 * @param {number} monto - Monto a financiar
 * @param {number} tasaMensual - Tasa de interés mensual (ej: 0.015 para 1.5%)
 * @param {number} cuotas - Número de cuotas
 * @returns {Object} Objeto con cuota mensual y desglose
 */
export function calcularAmortizacionFrancesa(monto, tasaMensual, cuotas) {
  if (monto <= 0 || cuotas <= 0) {
    return {
      cuotaMensual: 0,
      totalIntereses: 0,
      totalPagar: 0,
      cronograma: []
    }
  }

  // Si la tasa es 0, cuota fija sin intereses
  if (tasaMensual === 0) {
    const cuotaMensual = monto / cuotas
    const cronograma = []
    let saldoRestante = monto

    // Generar cronograma sin intereses
    for (let i = 1; i <= cuotas; i++) {
      const capital = cuotaMensual
      saldoRestante -= capital

      cronograma.push({
        numero: i,
        capital: Math.round(capital * 100) / 100,
        interes: 0,
        cuota: Math.round(cuotaMensual * 100) / 100,
        saldoRestante: Math.round(Math.max(0, saldoRestante) * 100) / 100
      })
    }

    return {
      cuotaMensual: Math.round(cuotaMensual * 100) / 100,
      totalIntereses: 0,
      totalPagar: monto,
      cronograma
    }
  }

  // Fórmula del método francés: Cuota = P * [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + tasaMensual, cuotas)
  const cuotaMensual = monto * (tasaMensual * factor) / (factor - 1)

  // Generar cronograma
  const cronograma = []
  let saldoRestante = monto

  for (let i = 1; i <= cuotas; i++) {
    const interes = saldoRestante * tasaMensual
    const capital = cuotaMensual - interes
    saldoRestante -= capital

    cronograma.push({
      numero: i,
      capital: Math.round(capital * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      cuota: Math.round(cuotaMensual * 100) / 100,
      saldoRestante: Math.round(Math.max(0, saldoRestante) * 100) / 100
    })
  }

  const totalIntereses = cronograma.reduce((sum, c) => sum + c.interes, 0)
  const totalPagar = monto + totalIntereses

  return {
    cuotaMensual: Math.round(cuotaMensual * 100) / 100,
    totalIntereses: Math.round(totalIntereses * 100) / 100,
    totalPagar: Math.round(totalPagar * 100) / 100,
    cronograma
  }
}

/**
 * Calcula la mora acumulada
 * @param {number} montoCuota - Monto de la cuota
 * @param {number} diasAtraso - Días de atraso
 * @param {number} tasaMora - Tasa de mora mensual (ej: 0.05 para 5%)
 * @param {number} diasGracia - Días de gracia antes de aplicar mora
 * @returns {number} Monto de mora
 */
export function calcularMora(montoCuota, diasAtraso, tasaMora, diasGracia = 5) {
  if (diasAtraso <= diasGracia) {
    return 0
  }

  const diasMora = diasAtraso - diasGracia
  const moraDiaria = (montoCuota * tasaMora) / 30 // Tasa mensual dividida por 30 días
  const moraTotal = moraDiaria * diasMora

  return Math.round(moraTotal * 100) / 100
}

/**
 * Genera el cronograma completo de cuotas para un contrato
 * @param {Object} contrato - Objeto con datos del contrato
 * @returns {Array} Array de cuotas con fechas y montos
 */
export function generarCronograma(contrato) {
  const {
    monto_financiado,
    numero_cuotas,
    fecha_primer_pago,
    tasa_interes_mensual,
    dias_gracia = 5
  } = contrato

  const amortizacion = calcularAmortizacionFrancesa(
    monto_financiado,
    tasa_interes_mensual,
    numero_cuotas
  )

  const cuotas = []
  const fechaInicio = new Date(fecha_primer_pago)

  amortizacion.cronograma.forEach((item, index) => {
    const fechaVencimiento = new Date(fechaInicio)
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + index)

    // Calcular fecha fin de gracia
    const fechaFinGracia = new Date(fechaVencimiento)
    fechaFinGracia.setDate(fechaFinGracia.getDate() + dias_gracia)

    cuotas.push({
      numero_cuota: item.numero,
      fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
      fecha_fin_gracia: fechaFinGracia.toISOString().split('T')[0],
      monto_capital: item.capital,
      monto_interes: item.interes,
      monto_cuota: item.cuota,
      saldo_restante: item.saldoRestante,
      monto_pagado: 0,
      monto_mora: 0,
      total_a_pagar: item.cuota,
      estado: 'pendiente',
      dias_atraso: 0
    })
  })

  return cuotas
}

/**
 * Calcula el score crediticio de un cliente (0-100)
 * @param {Object} cliente - Datos del cliente con historial crediticio
 * @returns {Object} Score y clasificación
 */
export function calcularScoreCrediticio(cliente) {
  let score = 100 // Base

  // Factor 1: Historial de pagos (40 puntos)
  const totalCreditos = cliente.total_creditos_otorgados || 0
  const creditosPagadosTiempo = cliente.total_creditos_pagados || 0
  
  if (totalCreditos > 0) {
    const paymentRatio = creditosPagadosTiempo / totalCreditos
    const paymentScore = paymentRatio * 40
    score = score - 40 + paymentScore
  }

  // Factor 2: Días promedio de atraso (-30 puntos máx)
  const avgDelay = cliente.promedio_dias_pago || 0
  const delayPenalty = Math.min(avgDelay * 1.5, 30)
  score -= delayPenalty

  // Factor 3: Uso de crédito (20 puntos)
  const limiteCredito = cliente.limite_credito || 1
  const saldoUtilizado = cliente.saldo_utilizado || 0
  const usageRatio = saldoUtilizado / limiteCredito
  
  let usageScore = 0
  if (usageRatio < 0.3) {
    usageScore = 20
  } else if (usageRatio < 0.7) {
    usageScore = 15
  } else if (usageRatio < 0.9) {
    usageScore = 10
  } else {
    usageScore = 5
  }
  score = score - 20 + usageScore

  // Factor 4: Antigüedad (10 puntos)
  if (cliente.fecha_creacion) {
    const fechaCreacion = new Date(cliente.fecha_creacion)
    const ahora = new Date()
    const mesesDiff = (ahora.getFullYear() - fechaCreacion.getFullYear()) * 12 +
                     (ahora.getMonth() - fechaCreacion.getMonth())
    const seniorityScore = Math.min((mesesDiff / 12) * 10, 10)
    score = score - 10 + seniorityScore
  }

  // Factor 5: Créditos vencidos actuales (-50 puntos máx)
  const creditosVencidos = cliente.total_creditos_vencidos || 0
  const overduePenalty = Math.min(creditosVencidos * 25, 50)
  score -= overduePenalty

  // Normalizar score entre 0 y 100
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Determinar clasificación
  let clasificacion = 'D'
  if (score >= 90) {
    clasificacion = 'A'
  } else if (score >= 75) {
    clasificacion = 'B'
  } else if (score >= 50) {
    clasificacion = 'C'
  }

  return {
    score,
    clasificacion
  }
}

/**
 * Convierte tasa anual a tasa mensual
 * @param {number} tasaAnual - Tasa de interés anual (ej: 18 para 18%)
 * @returns {number} Tasa mensual (ej: 0.015 para 1.5%)
 */
export function tasaAnualAMensual(tasaAnual) {
  if (typeof tasaAnual !== 'number' || isNaN(tasaAnual)) {
    return 0
  }
  
  // Fórmula: (1 + tasa_anual/100)^(1/12) - 1
  // Para tasas pequeñas, aproximación: tasa_anual / 12 / 100
  return tasaAnual / 12 / 100
}

/**
 * Convierte tasa mensual a tasa anual
 * @param {number} tasaMensual - Tasa de interés mensual (ej: 0.015 para 1.5%)
 * @returns {number} Tasa anual (ej: 18 para 18%)
 */
export function tasaMensualAAnual(tasaMensual) {
  if (typeof tasaMensual !== 'number' || isNaN(tasaMensual)) {
    return 0
  }
  
  // Fórmula: ((1 + tasa_mensual)^12 - 1) * 100
  // Para tasas pequeñas, aproximación: tasa_mensual * 12 * 100
  return tasaMensual * 12 * 100
}

/**
 * Calcula los días de atraso desde la fecha de vencimiento
 * @param {string|Date} fechaVencimiento - Fecha de vencimiento
 * @returns {number} Días de atraso (0 si no está vencida)
 */
export function calcularDiasAtraso(fechaVencimiento) {
  if (!fechaVencimiento) {
    return 0
  }
  
  const fechaVenc = new Date(fechaVencimiento)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fechaVenc.setHours(0, 0, 0, 0)

  const diffTime = hoy - fechaVenc
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

/**
 * Formatea el número de contrato
 * @param {number} empresaId - ID de la empresa
 * @param {number} secuencia - Número secuencial
 * @returns {string} Número de contrato formateado (ej: FIN-2025-00001)
 */
export function formatearNumeroContrato(empresaId, secuencia) {
  const año = new Date().getFullYear()
  const numero = String(secuencia).padStart(5, '0')
  return `FIN-${año}-${numero}`
}

/**
 * Formatea el número de recibo
 * @param {number} empresaId - ID de la empresa
 * @param {number} secuencia - Número secuencial
 * @returns {string} Número de recibo formateado (ej: REC-2025-00001)
 */
export function formatearNumeroRecibo(empresaId, secuencia) {
  const año = new Date().getFullYear()
  const numero = String(secuencia).padStart(5, '0')
  return `REC-${año}-${numero}`
}

/**
 * Distribuye un pago entre mora, interés y capital
 * @param {number} montoPago - Monto total del pago
 * @param {number} montoMoraPendiente - Mora pendiente
 * @param {number} montoInteresPendiente - Interés pendiente
 * @param {number} montoCapitalPendiente - Capital pendiente
 * @returns {Object} Distribución del pago
 */
export function distribuirPago(montoPago, montoMoraPendiente, montoInteresPendiente, montoCapitalPendiente) {
  let restante = montoPago
  const distribucion = {
    aplicado_mora: 0,
    aplicado_interes: 0,
    aplicado_capital: 0,
    aplicado_futuro: 0
  }

  // 1. Primero se paga la mora
  if (restante > 0 && montoMoraPendiente > 0) {
    distribucion.aplicado_mora = Math.min(restante, montoMoraPendiente)
    restante -= distribucion.aplicado_mora
  }

  // 2. Luego se paga el interés
  if (restante > 0 && montoInteresPendiente > 0) {
    distribucion.aplicado_interes = Math.min(restante, montoInteresPendiente)
    restante -= distribucion.aplicado_interes
  }

  // 3. Después se paga el capital
  if (restante > 0 && montoCapitalPendiente > 0) {
    distribucion.aplicado_capital = Math.min(restante, montoCapitalPendiente)
    restante -= distribucion.aplicado_capital
  }

  // 4. Lo que sobra va a pagos futuros
  if (restante > 0) {
    distribucion.aplicado_futuro = restante
  }

  // Redondear a 2 decimales
  distribucion.aplicado_mora = Math.round(distribucion.aplicado_mora * 100) / 100
  distribucion.aplicado_interes = Math.round(distribucion.aplicado_interes * 100) / 100
  distribucion.aplicado_capital = Math.round(distribucion.aplicado_capital * 100) / 100
  distribucion.aplicado_futuro = Math.round(distribucion.aplicado_futuro * 100) / 100

  return distribucion
}

