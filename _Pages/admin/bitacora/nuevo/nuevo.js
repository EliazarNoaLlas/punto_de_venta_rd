"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearBitacora, obtenerTrabajadoresAsignados, obtenerObrasActivas } from '../servidor'
import { validarBitacora } from '../../core/construction/validaciones'
import estilos from '../bitacora.module.css'

export default function NuevaBitacora() {
    const router = useRouter()
    const [obras, setObras] = useState([])
    const [trabajadores, setTrabajadores] = useState([])
    const [formData, setFormData] = useState({
        obra_id: '',
        fecha_bitacora: new Date().toISOString().split('T')[0],
        zona: '',
        trabajo_realizado: '',
        observaciones: '',
        condiciones_clima: ''
    })
    const [trabajadoresPresentes, setTrabajadoresPresentes] = useState([])
    const [errors, setErrors] = useState({})
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)

    const trabajosComunes = [
        'Instalación eléctrica',
        'Mezcla de cemento',
        'Remodelación',
        'Reparación',
        'Plomería',
        'Pintura',
        'Estructura'
    ]

    const condicionesClimaticas = [
        { value: 'soleado', label: '☀️ Soleado' },
        { value: 'nublado', label: '☁️ Nublado' },
        { value: 'lluvioso', label: '🌧️ Lluvioso' },
        { value: 'tormenta', label: '⛈️ Tormenta' }
    ]

    useEffect(() => {
        cargarObras()
    }, [])

    useEffect(() => {
        if (formData.obra_id) {
            cargarTrabajadores()
        } else {
            setTrabajadores([])
            setTrabajadoresPresentes([])
        }
    }, [formData.obra_id])

    async function cargarObras() {
        setCargando(true)
        const res = await obtenerObrasActivas()
        if (res.success) {
            setObras(res.obras)
        }
        setCargando(false)
    }

    async function cargarTrabajadores() {
        const res = await obtenerTrabajadoresAsignados(formData.obra_id)
        if (res.success) {
            setTrabajadores(res.trabajadores)
            // Por defecto, todos presentes
            setTrabajadoresPresentes(res.trabajadores.map(t => t.id))
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const toggleTrabajador = (id) => {
        setTrabajadoresPresentes(prev => 
            prev.includes(id) 
                ? prev.filter(tId => tId !== id)
                : [...prev, id]
        )
    }

    const handleTrabajoComun = (trabajo) => {
        const newValue = formData.trabajo_realizado 
            ? `${formData.trabajo_realizado}\n• ${trabajo}`
            : `• ${trabajo}`
        setFormData(prev => ({ ...prev, trabajo_realizado: newValue }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const datos = {
            ...formData,
            trabajadores: trabajadoresPresentes.map(id => ({ id }))
        }
        
        const validacion = validarBitacora(datos)
        if (!validacion.valido) {
            setErrors(validacion.errores)
            return
        }

        if (trabajadoresPresentes.length === 0) {
            setErrors({ trabajadores: 'Debe seleccionar al menos un trabajador presente' })
            return
        }

        setProcesando(true)
        const res = await crearBitacora(datos)
        setProcesando(false)

        if (res.success) {
            router.push('/admin/bitacora')
        } else {
            if (res.errores) {
                setErrors(res.errores)
            } else {
                alert(res.mensaje || 'Error al crear la bitácora')
            }
        }
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Nueva Bitácora Diaria</h1>
                    <p className={estilos.subtitulo}>Registro de actividades y personal</p>
                </div>
                <button className={estilos.btnNuevo} onClick={() => router.back()}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    <span>Volver</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className={estilos.form}>
                <section className={estilos.seccion}>
                    <h3>Obra</h3>
                    <div className={estilos.grupo}>
                        <label>Seleccionar Obra *</label>
                        <select
                            name="obra_id"
                            value={formData.obra_id}
                            onChange={handleChange}
                            required
                            className={errors.obra_id ? estilos.error : ''}
                        >
                            <option value="">Seleccione una obra...</option>
                            {obras.map(obra => (
                                <option key={obra.id} value={obra.id}>
                                    {obra.codigo_obra} - {obra.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.obra_id && <span className={estilos.errorMsg}>{errors.obra_id}</span>}
                    </div>
                </section>

                <section className={estilos.seccion}>
                    <h3>Datos Generales</h3>
                    <div className={estilos.fila}>
                        <div className={estilos.grupo}>
                            <label>Fecha *</label>
                            <input
                                type="date"
                                name="fecha_bitacora"
                                value={formData.fecha_bitacora}
                                onChange={handleChange}
                                required
                                className={errors.fecha_bitacora ? estilos.error : ''}
                            />
                            {errors.fecha_bitacora && <span className={estilos.errorMsg}>{errors.fecha_bitacora}</span>}
                        </div>
                        <div className={estilos.grupo}>
                            <label>Zona / Sitio</label>
                            <input
                                type="text"
                                name="zona"
                                value={formData.zona}
                                onChange={handleChange}
                                placeholder="Ej. Frente, Techo, Apto 2B"
                            />
                        </div>
                    </div>
                    <div className={estilos.grupo}>
                        <label>Condiciones Climáticas</label>
                        <div className={estilos.gridClima}>
                            {condicionesClimaticas.map(clima => (
                                <button
                                    key={clima.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, condiciones_clima: clima.value }))}
                                    className={`${estilos.btnClima} ${formData.condiciones_clima === clima.value ? estilos.btnClimaActivo : ''}`}
                                >
                                    {clima.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {formData.obra_id && (
                    <section className={estilos.seccion}>
                        <h3>Trabajadores Presentes</h3>
                        {trabajadores.length === 0 ? (
                            <p>No hay trabajadores asignados a esta obra</p>
                        ) : (
                            <div className={estilos.listaTrabajadores}>
                                {trabajadores.map(trabajador => (
                                    <div
                                        key={trabajador.id}
                                        onClick={() => toggleTrabajador(trabajador.id)}
                                        className={`${estilos.trabajadorRow} ${trabajadoresPresentes.includes(trabajador.id) ? estilos.presente : estilos.ausente}`}
                                    >
                                        <div className={estilos.trabajadorInfo}>
                                            <strong>{trabajador.nombre}</strong>
                                            <span>{trabajador.rol}</span>
                                        </div>
                                        <div className={estilos.checkAsistencia}>
                                            <ion-icon name={trabajadoresPresentes.includes(trabajador.id) ? "checkmark-circle" : "close-circle"}></ion-icon>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.trabajadores && <span className={estilos.errorMsg}>{errors.trabajadores}</span>}
                    </section>
                )}

                <section className={estilos.seccion}>
                    <h3>Trabajo Realizado</h3>
                    <div className={estilos.grupo}>
                        <label>Agregar actividades comunes:</label>
                        <div className={estilos.trabajosComunes}>
                            {trabajosComunes.map(trabajo => (
                                <button
                                    key={trabajo}
                                    type="button"
                                    onClick={() => handleTrabajoComun(trabajo)}
                                    className={estilos.btnTrabajoComun}
                                >
                                    + {trabajo}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={estilos.grupo}>
                        <label>Descripción del Trabajo *</label>
                        <textarea
                            name="trabajo_realizado"
                            value={formData.trabajo_realizado}
                            onChange={handleChange}
                            rows="8"
                            required
                            placeholder="Describa el trabajo realizado hoy..."
                            className={errors.trabajo_realizado ? estilos.error : ''}
                        />
                        {errors.trabajo_realizado && <span className={estilos.errorMsg}>{errors.trabajo_realizado}</span>}
                    </div>
                    <div className={estilos.grupo}>
                        <label>Observaciones</label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Algo fuera de lo normal hoy..."
                        />
                    </div>
                </section>

                <div className={estilos.modalFooter}>
                    <button type="button" onClick={() => router.back()} disabled={procesando}>
                        Cancelar
                    </button>
                    <button type="submit" className={estilos.btnGuardar} disabled={procesando}>
                        {procesando ? 'Guardando...' : 'Guardar Bitácora'}
                    </button>
                </div>
            </form>
        </div>
    )
}

