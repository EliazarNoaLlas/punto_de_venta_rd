"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearServicio, obtenerObrasParaServicio } from '../servidor'
import { obtenerClientes } from '../../clientes/servidor'
import { obtenerObras } from '../../obras/servidor'
import { TIPOS_SERVICIO, PRIORIDADES, formatearTipoServicio, formatearPrioridad } from '../../core/construction/estados'
import estilos from '../servicios.module.css'

export default function NuevoServicio() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_servicio: TIPOS_SERVICIO.OTRO,
        ubicacion: '',
        zona: '',
        costo_estimado: '',
        fecha_solicitud: new Date().toISOString().split('T')[0],
        fecha_programada: '',
        duracion_estimada_horas: '',
        prioridad: PRIORIDADES.MEDIA,
        cliente_id: '',
        obra_id: '',
        proyecto_id: '',
        responsable_id: ''
    })
    const [clientes, setClientes] = useState([])
    const [obras, setObras] = useState([])
    const [errors, setErrors] = useState({})
    const [procesando, setProcesando] = useState(false)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        const [resClientes, resObras] = await Promise.all([
            obtenerClientes(),
            obtenerObras({ estado: 'activa' })
        ])
        
        if (resClientes.success) {
            setClientes(resClientes.clientes || [])
        }
        if (resObras.success) {
            setObras(resObras.obras || [])
        }
        setCargando(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        
        if (!formData.nombre || formData.nombre.trim() === '') {
            newErrors.nombre = 'El nombre del servicio es obligatorio'
        }
        
        if (!formData.ubicacion || formData.ubicacion.trim() === '') {
            newErrors.ubicacion = 'La ubicación es obligatoria'
        }
        
        if (!formData.fecha_programada) {
            newErrors.fecha_programada = 'La fecha programada es obligatoria'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setProcesando(true)
        try {
            const datos = {
                ...formData,
                costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : null,
                duracion_estimada_horas: formData.duracion_estimada_horas ? parseFloat(formData.duracion_estimada_horas) : null,
                cliente_id: formData.cliente_id || null,
                obra_id: formData.obra_id || null,
                proyecto_id: formData.proyecto_id || null,
                responsable_id: formData.responsable_id || null
            }
            
            const res = await crearServicio(datos)
            if (res.success) {
                alert('Servicio creado exitosamente')
                router.push('/admin/servicios')
            } else {
                alert(res.mensaje || 'Error al crear servicio')
                if (res.errores) {
                    setErrors(res.errores)
                }
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al procesar la solicitud')
        } finally {
            setProcesando(false)
        }
    }

    if (cargando) {
        return <div className={estilos.cargando}>Cargando...</div>
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <h1 className={estilos.titulo}>Nuevo Servicio</h1>
                <button onClick={() => router.back()} className={estilos.btnVolver}>
                    ← Volver
                </button>
            </div>

            <form onSubmit={handleSubmit} className={estilos.formulario}>
                <div className={estilos.grupo}>
                    <label className={estilos.label}>
                        Nombre del Servicio <span className={estilos.requerido}>*</span>
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`${estilos.input} ${errors.nombre ? estilos.inputError : ''}`}
                        placeholder="Ej: Reparación eléctrica urgente"
                    />
                    {errors.nombre && <span className={estilos.error}>{errors.nombre}</span>}
                </div>

                <div className={estilos.grupo}>
                    <label className={estilos.label}>Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className={estilos.textarea}
                        rows="4"
                        placeholder="Descripción detallada del servicio..."
                    />
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Tipo de Servicio <span className={estilos.requerido}>*</span>
                        </label>
                        <select
                            name="tipo_servicio"
                            value={formData.tipo_servicio}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            {Object.values(TIPOS_SERVICIO).map(tipo => (
                                <option key={tipo} value={tipo}>
                                    {formatearTipoServicio(tipo)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Prioridad <span className={estilos.requerido}>*</span>
                        </label>
                        <select
                            name="prioridad"
                            value={formData.prioridad}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            {Object.values(PRIORIDADES).map(prioridad => (
                                <option key={prioridad} value={prioridad}>
                                    {formatearPrioridad(prioridad).texto}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Ubicación <span className={estilos.requerido}>*</span>
                        </label>
                        <input
                            type="text"
                            name="ubicacion"
                            value={formData.ubicacion}
                            onChange={handleChange}
                            className={`${estilos.input} ${errors.ubicacion ? estilos.inputError : ''}`}
                            placeholder="Dirección completa"
                        />
                        {errors.ubicacion && <span className={estilos.error}>{errors.ubicacion}</span>}
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Zona</label>
                        <input
                            type="text"
                            name="zona"
                            value={formData.zona}
                            onChange={handleChange}
                            className={estilos.input}
                            placeholder="Zona o sector"
                        />
                    </div>
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Fecha Programada <span className={estilos.requerido}>*</span>
                        </label>
                        <input
                            type="date"
                            name="fecha_programada"
                            value={formData.fecha_programada}
                            onChange={handleChange}
                            className={`${estilos.input} ${errors.fecha_programada ? estilos.inputError : ''}`}
                        />
                        {errors.fecha_programada && <span className={estilos.error}>{errors.fecha_programada}</span>}
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Duración Estimada (horas)</label>
                        <input
                            type="number"
                            name="duracion_estimada_horas"
                            value={formData.duracion_estimada_horas}
                            onChange={handleChange}
                            className={estilos.input}
                            placeholder="0.00"
                            step="0.5"
                            min="0"
                        />
                    </div>
                </div>

                <div className={estilos.grupo}>
                    <label className={estilos.label}>Costo Estimado</label>
                    <input
                        type="number"
                        name="costo_estimado"
                        value={formData.costo_estimado}
                        onChange={handleChange}
                        className={estilos.input}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                    />
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Cliente</label>
                        <select
                            name="cliente_id"
                            value={formData.cliente_id}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombreCompleto || `${cliente.nombre} ${cliente.apellidos}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Obra Asociada</label>
                        <select
                            name="obra_id"
                            value={formData.obra_id}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            <option value="">Ninguna (servicio independiente)</option>
                            {obras.map(obra => (
                                <option key={obra.id} value={obra.id}>
                                    {obra.codigo_obra} - {obra.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={estilos.acciones}>
                    <button type="button" onClick={() => router.back()} className={estilos.btnCancelar}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={procesando} className={estilos.btnGuardar}>
                        {procesando ? 'Guardando...' : 'Guardar Servicio'}
                    </button>
                </div>
            </form>
        </div>
    )
}

