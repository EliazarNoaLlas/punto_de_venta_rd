/**
 * Validaciones compartidas del dominio Construction
 * 
 * Este archivo contiene funciones de validación que son compartidas
 * por todos los módulos de construcción.
 */

import { REGLAS_NEGOCIO } from './reglas'

/**
 * Valida los datos de una obra
 * @param {Object} datos - Datos de la obra a validar
 * @returns {Object} { valido: boolean, errores: Object }
 */
export function validarObra(datos) {
  const errores = {}
  
  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.nombre = 'El nombre de la obra es obligatorio'
  }
  
  if (!datos.ubicacion || datos.ubicacion.trim() === '') {
    errores.ubicacion = 'La ubicación es obligatoria'
  }
  
  if (!datos.presupuesto_aprobado || datos.presupuesto_aprobado <= 0) {
    errores.presupuesto_aprobado = 'El presupuesto debe ser mayor a 0'
  }
  
  if (!datos.fecha_inicio) {
    errores.fecha_inicio = 'La fecha de inicio es obligatoria'
  }
  
  if (!datos.fecha_fin_estimada) {
    errores.fecha_fin_estimada = 'La fecha de fin estimada es obligatoria'
  }
  
  if (datos.fecha_inicio && datos.fecha_fin_estimada) {
    if (new Date(datos.fecha_fin_estimada) <= new Date(datos.fecha_inicio)) {
      errores.fecha_fin_estimada = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  }
}

/**
 * Valida los datos de una bitácora
 * @param {Object} datos - Datos de la bitácora a validar
 * @returns {Object} { valido: boolean, errores: Object }
 */
export function validarBitacora(datos) {
  const errores = {}
  
  if (!datos.trabajo_realizado || datos.trabajo_realizado.trim() === '') {
    errores.trabajo_realizado = 'La descripción del trabajo es obligatoria'
  }
  
  if (!datos.fecha_bitacora) {
    errores.fecha_bitacora = 'La fecha de la bitácora es obligatoria'
  }
  
  if (!datos.obra_id) {
    errores.obra_id = 'Debe seleccionar una obra'
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  }
}

/**
 * Valida los datos de un servicio
 * @param {Object} datos - Datos del servicio a validar
 * @returns {Object} { valido: boolean, errores: Object }
 */
export function validarServicio(datos) {
  const errores = {}
  
  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.nombre = 'El nombre del servicio es obligatorio'
  }
  
  if (!datos.tipo_servicio) {
    errores.tipo_servicio = 'Debe seleccionar un tipo de servicio'
  }
  
  if (!datos.fecha_programada) {
    errores.fecha_programada = 'La fecha programada es obligatoria'
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  }
}

/**
 * Valida los datos de un proyecto
 * @param {Object} datos - Datos del proyecto a validar
 * @returns {Object} { valido: boolean, errores: Object }
 */
export function validarProyecto(datos) {
  const errores = {}
  
  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.nombre = 'El nombre del proyecto es obligatorio'
  }
  
  if (!datos.fecha_inicio) {
    errores.fecha_inicio = 'La fecha de inicio es obligatoria'
  }
  
  if (!datos.fecha_fin_estimada) {
    errores.fecha_fin_estimada = 'La fecha de fin estimada es obligatoria'
  }
  
  if (datos.fecha_inicio && datos.fecha_fin_estimada) {
    if (new Date(datos.fecha_fin_estimada) <= new Date(datos.fecha_inicio)) {
      errores.fecha_fin_estimada = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  }
}

/**
 * Valida los datos de una orden de trabajo
 * @param {Object} datos - Datos de la orden a validar
 * @returns {Object} { valido: boolean, errores: Object }
 */
export function validarOrdenTrabajo(datos) {
  const errores = {}
  
  if (!datos.descripcion || datos.descripcion.trim() === '') {
    errores.descripcion = 'La descripción de la orden es obligatoria'
  }
  
  if (!datos.obra_id && !datos.servicio_id) {
    errores.obra_id = 'Debe seleccionar una obra o servicio'
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  }
}

