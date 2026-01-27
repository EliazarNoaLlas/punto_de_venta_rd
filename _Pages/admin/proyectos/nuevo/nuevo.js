"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearProyecto } from '../servidor'
import { obtenerClientes } from '../../clientes/servidor'
import estilos from '../proyectos.module.css'

export default function NuevoProyecto() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin_estimada: '',
        presupuesto_total: '',
        cliente_id: '',
        responsable_id: ''
    })
    const [clientes, setClientes] = useState([])
    const [errors, setErrors] = useState({})
    const [procesando, setProcesando] = useState(false)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarClientes()
    }, [])

    async function cargarClientes() {
        const res = await obtenerClientes()
        if (res.success) {
            setClientes(res.clientes || [])
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
            newErrors.nombre = 'El nombre del proyecto es obligatorio'
        }
        
        if (!formData.fecha_inicio) {
            newErrors.fecha_inicio = 'La fecha de inicio es obligatoria'
        }
        
        if (!formData.fecha_fin_estimada) {
            newErrors.fecha_fin_estimada = 'La fecha de fin estimada es obligatoria'
        }
        
        if (formData.fecha_inicio && formData.fecha_fin_estimada) {
            if (new Date(formData.fecha_fin_estimada) <= new Date(formData.fecha_inicio)) {
                newErrors.fecha_fin_estimada = 'La fecha de fin debe ser posterior a la fecha de inicio'
            }
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
                presupuesto_total: formData.presupuesto_total ? parseFloat(formData.presupuesto_total) : null,
                cliente_id: formData.cliente_id || null,
                responsable_id: formData.responsable_id || null
            }
            
            const res = await crearProyecto(datos)
            if (res.success) {
                alert('Proyecto creado exitosamente')
                router.push('/admin/proyectos')
            } else {
                alert(res.mensaje || 'Error al crear proyecto')
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
                <h1 className={estilos.titulo}>Nuevo Proyecto</h1>
                <button onClick={() => router.back()} className={estilos.btnVolver}>
                    ← Volver
                </button>
            </div>

            <form onSubmit={handleSubmit} className={estilos.formulario}>
                <div className={estilos.grupo}>
                    <label className={estilos.label}>
                        Nombre del Proyecto <span className={estilos.requerido}>*</span>
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`${estilos.input} ${errors.nombre ? estilos.inputError : ''}`}
                        placeholder="Ej: Construcción Residencial Los Pinos"
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
                        placeholder="Descripción detallada del proyecto..."
                    />
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Fecha de Inicio <span className={estilos.requerido}>*</span>
                        </label>
                        <input
                            type="date"
                            name="fecha_inicio"
                            value={formData.fecha_inicio}
                            onChange={handleChange}
                            className={`${estilos.input} ${errors.fecha_inicio ? estilos.inputError : ''}`}
                        />
                        {errors.fecha_inicio && <span className={estilos.error}>{errors.fecha_inicio}</span>}
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Fecha de Fin Estimada <span className={estilos.requerido}>*</span>
                        </label>
                        <input
                            type="date"
                            name="fecha_fin_estimada"
                            value={formData.fecha_fin_estimada}
                            onChange={handleChange}
                            className={`${estilos.input} ${errors.fecha_fin_estimada ? estilos.inputError : ''}`}
                        />
                        {errors.fecha_fin_estimada && <span className={estilos.error}>{errors.fecha_fin_estimada}</span>}
                    </div>
                </div>

                <div className={estilos.grupo}>
                    <label className={estilos.label}>Presupuesto Total</label>
                    <input
                        type="number"
                        name="presupuesto_total"
                        value={formData.presupuesto_total}
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
                        <label className={estilos.label}>Responsable</label>
                        <input
                            type="text"
                            name="responsable_id"
                            value={formData.responsable_id}
                            onChange={handleChange}
                            className={estilos.input}
                            placeholder="ID del responsable (opcional)"
                        />
                    </div>
                </div>

                <div className={estilos.acciones}>
                    <button type="button" onClick={() => router.back()} className={estilos.btnCancelar}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={procesando} className={estilos.btnGuardar}>
                        {procesando ? 'Guardando...' : 'Guardar Proyecto'}
                    </button>
                </div>
            </form>
        </div>
    )
}

