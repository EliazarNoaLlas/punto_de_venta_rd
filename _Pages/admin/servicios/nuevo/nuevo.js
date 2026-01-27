"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { crearServicio } from '../servidor'
import { obtenerClientes } from '../../clientes/servidor'
import { obtenerObras } from '../../obras/servidor'
import { TIPOS_SERVICIO, PRIORIDADES, formatearTipoServicio, formatearPrioridad } from '../../core/construction/estados'
import estilos from './nuevo.module.css'

export default function NuevoServicio() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [paso, setPaso] = useState(1)
    const [procesando, setProcesando] = useState(false)
    const [errors, setErrors] = useState({})
    const [cargando, setCargando] = useState(true)
    
    const [clientes, setClientes] = useState([])
    const [obras, setObras] = useState([])
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_servicio: '',
        ubicacion: '',
        zona: '',
        costo_estimado: '',
        fecha_solicitud: new Date().toISOString().split('T')[0],
        fecha_programada: '',
        duracion_estimada_horas: '',
        prioridad: PRIORIDADES.MEDIA,
        cliente_id: '',
        obra_id: '',
        notas_tecnicas: '',
        materiales_necesarios: ''
    })

    const tiposServicio = [
        { value: 'reparacion', label: 'Reparación', emoji: '🔧', descripcion: 'Reparaciones y arreglos', color: '#ef4444' },
        { value: 'mantenimiento', label: 'Mantenimiento', emoji: '🛠️', descripcion: 'Mantenimiento preventivo', color: '#3b82f6' },
        { value: 'instalacion', label: 'Instalación', emoji: '⚡', descripcion: 'Instalación de equipos', color: '#f59e0b' },
        { value: 'inspeccion', label: 'Inspección', emoji: '🔍', descripcion: 'Inspección y diagnóstico', color: '#8b5cf6' },
        { value: 'limpieza', label: 'Limpieza', emoji: '🧹', descripcion: 'Servicios de limpieza', color: '#10b981' },
        { value: 'pintura', label: 'Pintura', emoji: '🎨', descripcion: 'Trabajos de pintura', color: '#ec4899' },
        { value: 'electricidad', label: 'Electricidad', emoji: '💡', descripcion: 'Servicios eléctricos', color: '#f59e0b' },
        { value: 'plomeria', label: 'Plomería', emoji: '🚰', descripcion: 'Trabajos de plomería', color: '#0ea5e9' },
        { value: 'carpinteria', label: 'Carpintería', emoji: '🪚', descripcion: 'Trabajos en madera', color: '#92400e' },
        { value: 'albanileria', label: 'Albañilería', emoji: '🧱', descripcion: 'Trabajos de construcción', color: '#64748b' }
    ]

    const prioridades = [
        { value: 'baja', label: 'Baja', color: '#10b981', descripcion: 'Puede esperar' },
        { value: 'media', label: 'Media', color: '#3b82f6', descripcion: 'Prioridad normal' },
        { value: 'alta', label: 'Alta', color: '#f59e0b', descripcion: 'Requiere atención pronto' },
        { value: 'urgente', label: 'Urgente', color: '#ef4444', descripcion: 'Atención inmediata' }
    ]

    const pasos = [
        { numero: 1, label: 'Tipo de Servicio', descripcion: 'Selecciona el tipo', icono: 'construct-outline' },
        { numero: 2, label: 'Información Básica', descripcion: 'Datos del servicio', icono: 'document-text-outline' },
        { numero: 3, label: 'Ubicación y Programación', descripcion: 'Dónde y cuándo', icono: 'location-outline' },
        { numero: 4, label: 'Detalles Adicionales', descripcion: 'Cliente y obra', icono: 'people-outline' },
        { numero: 5, label: 'Confirmación', descripcion: 'Revisar y crear', icono: 'checkmark-done-outline' }
    ]

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)

        const manejarCambioTema = () => {
            const nuevoTema = localStorage.getItem('tema') || 'light'
            setTema(nuevoTema)
        }

        window.addEventListener('temaChange', manejarCambioTema)
        window.addEventListener('storage', manejarCambioTema)

        return () => {
            window.removeEventListener('temaChange', manejarCambioTema)
            window.removeEventListener('storage', manejarCambioTema)
        }
    }, [])

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        setCargando(true)
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

    const seleccionarTipo = (tipo) => {
        setFormData(prev => ({ ...prev, tipo_servicio: tipo }))
        if (errors.tipo_servicio) {
            setErrors(prev => ({ ...prev, tipo_servicio: '' }))
        }
    }

    const seleccionarPrioridad = (prioridad) => {
        setFormData(prev => ({ ...prev, prioridad }))
    }

    const validarPaso1 = () => {
        const nuevosErrores = {}
        if (!formData.tipo_servicio) {
            nuevosErrores.tipo_servicio = 'Debe seleccionar un tipo de servicio'
        }
        setErrors(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const validarPaso2 = () => {
        const nuevosErrores = {}
        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre del servicio es obligatorio'
        }
        setErrors(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const validarPaso3 = () => {
        const nuevosErrores = {}
        if (!formData.ubicacion.trim()) {
            nuevosErrores.ubicacion = 'La ubicación es obligatoria'
        }
        if (!formData.fecha_programada) {
            nuevosErrores.fecha_programada = 'La fecha programada es obligatoria'
        }
        setErrors(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const siguientePaso = () => {
        if (paso === 1 && validarPaso1()) {
            setPaso(2)
        } else if (paso === 2 && validarPaso2()) {
            setPaso(3)
        } else if (paso === 3 && validarPaso3()) {
            setPaso(4)
        } else if (paso === 4) {
            setPaso(5)
        }
    }

    const pasoAnterior = () => {
        if (paso > 1) {
            setPaso(paso - 1)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        setProcesando(true)
        try {
            const datos = {
                ...formData,
                costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : null,
                duracion_estimada_horas: formData.duracion_estimada_horas ? parseFloat(formData.duracion_estimada_horas) : null,
                cliente_id: formData.cliente_id || null,
                obra_id: formData.obra_id || null
            }
            
            const res = await crearServicio(datos)
            if (res.success) {
                alert('✅ Servicio creado exitosamente')
                router.push('/admin/servicios')
            } else {
                alert(res.mensaje || 'Error al crear servicio')
                if (res.errores) {
                    setErrors(res.errores)
                    setPaso(1)
                }
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al procesar la solicitud')
        } finally {
            setProcesando(false)
        }
    }

    const tipoSeleccionado = tiposServicio.find(t => t.value === formData.tipo_servicio)
    const prioridadSeleccionada = prioridades.find(p => p.value === formData.prioridad)

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <p>Cargando información...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Nuevo Servicio</h1>
                    <p className={estilos.subtitulo}>Crea un nuevo servicio en {5 - paso + 1} pasos</p>
                </div>
                <button className={estilos.btnCancelar} onClick={() => router.back()}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    <span>Cancelar</span>
                </button>
            </div>

            {/* Indicador de Progreso */}
            <div className={estilos.progresoContainer}>
                <div className={estilos.pasos}>
                    {pasos.map((p, index) => (
                        <div key={p.numero}>
                            <div className={`${estilos.paso} ${paso >= p.numero ? estilos.pasoActivo : ''}`}>
                                <div className={estilos.pasoNumero}>
                                    {paso > p.numero ? (
                                        <ion-icon name="checkmark-outline"></ion-icon>
                                    ) : (
                                        <ion-icon name={p.icono}></ion-icon>
                                    )}
                                </div>
                                <div className={estilos.pasoInfo}>
                                    <p className={estilos.pasoTitulo}>{p.label}</p>
                                    <p className={estilos.pasoDesc}>{p.descripcion}</p>
                                </div>
                            </div>
                            {index < pasos.length - 1 && (
                                <div className={`${estilos.lineaProgreso} ${paso > p.numero ? estilos.lineaActiva : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className={estilos.formulario}>
                {/* PASO 1: Tipo de Servicio */}
                {paso === 1 && (
                    <div className={estilos.layoutPrincipal}>
                        <div className={estilos.columnaIzquierda}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <h3 className={estilos.tituloSeccion}>
                                    <ion-icon name="construct-outline"></ion-icon>
                                    Selecciona el Tipo de Servicio
                                </h3>
                                
                                <div className={estilos.gridTipos}>
                                    {tiposServicio.map(tipo => (
                                        <div
                                            key={tipo.value}
                                            onClick={() => seleccionarTipo(tipo.value)}
                                            className={`${estilos.cardTipo} ${estilos[tema]} ${
                                                formData.tipo_servicio === tipo.value ? estilos.cardTipoActivo : ''
                                            }`}
                                            style={{ '--tipo-color': tipo.color }}
                                        >
                                            <div className={estilos.emojiTipo}>{tipo.emoji}</div>
                                            <h4>{tipo.label}</h4>
                                            <p>{tipo.descripcion}</p>
                                            {formData.tipo_servicio === tipo.value && (
                                                <div className={estilos.checkTipo}>
                                                    <ion-icon name="checkmark-circle"></ion-icon>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {errors.tipo_servicio && (
                                    <span className={estilos.errorMsg}>
                                        <ion-icon name="alert-circle-outline"></ion-icon>
                                        {errors.tipo_servicio}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={estilos.columnaDerecha}>
                            {tipoSeleccionado ? (
                                <div className={`${estilos.seccionDestacada} ${estilos[tema]}`}>
                                    <h3>Tipo Seleccionado</h3>
                                    <div className={estilos.tipoPreview}>
                                        <div className={estilos.emojiGrande}>{tipoSeleccionado.emoji}</div>
                                        <h2>{tipoSeleccionado.label}</h2>
                                        <p>{tipoSeleccionado.descripcion}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                    <div className={estilos.ilustracionCard}>
                                        <Image
                                            src="/ilustracion_servicios/диагностика.svg"
                                            alt="Seleccionar tipo"
                                            width={250}
                                            height={250}
                                            className={estilos.ilustracion}
                                        />
                                        <h4>Selecciona un Tipo</h4>
                                        <p>Elige el tipo de servicio que deseas crear</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 2: Información Básica */}
                {paso === 2 && (
                    <div className={estilos.layoutPrincipal}>
                        <div className={estilos.columnaIzquierda}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <h3 className={estilos.tituloSeccion}>
                                    <ion-icon name="document-text-outline"></ion-icon>
                                    Información Básica del Servicio
                                </h3>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>
                                        Nombre del Servicio *
                                        <span className={estilos.required}>Requerido</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className={`${estilos.input} ${estilos[tema]} ${errors.nombre ? estilos.inputError : ''}`}
                                        placeholder="Ej: Reparación de sistema eléctrico"
                                    />
                                    {errors.nombre && (
                                        <span className={estilos.errorMsg}>
                                            <ion-icon name="alert-circle-outline"></ion-icon>
                                            {errors.nombre}
                                        </span>
                                    )}
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Descripción Detallada</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        className={`${estilos.textarea} ${estilos[tema]}`}
                                        rows="4"
                                        placeholder="Describe los detalles del servicio, qué incluye, objetivos, etc."
                                    />
                                    <span className={estilos.ayuda}>Proporciona una descripción clara del servicio</span>
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Notas Técnicas</label>
                                    <textarea
                                        name="notas_tecnicas"
                                        value={formData.notas_tecnicas}
                                        onChange={handleChange}
                                        className={`${estilos.textarea} ${estilos[tema]}`}
                                        rows="3"
                                        placeholder="Especificaciones técnicas, requerimientos especiales..."
                                    />
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Materiales Necesarios</label>
                                    <textarea
                                        name="materiales_necesarios"
                                        value={formData.materiales_necesarios}
                                        onChange={handleChange}
                                        className={`${estilos.textarea} ${estilos[tema]}`}
                                        rows="3"
                                        placeholder="Lista de materiales o equipos necesarios..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={estilos.columnaDerecha}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <div className={estilos.ilustracionCard}>
                                    <Image
                                        src="/ilustracion_servicios/документы.svg"
                                        alt="Información"
                                        width={200}
                                        height={200}
                                        className={estilos.ilustracion}
                                    />
                                    <h4>Información del Servicio</h4>
                                    <p>Proporciona los detalles básicos del servicio</p>
                                </div>
                            </div>

                            {tipoSeleccionado && (
                                <div className={`${estilos.seccionInfo} ${estilos[tema]}`}>
                                    <div className={estilos.infoHeader}>
                                        <div className={estilos.emojiInfo}>{tipoSeleccionado.emoji}</div>
                                        <div>
                                            <h4>Tipo de Servicio</h4>
                                            <p>{tipoSeleccionado.label}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 3: Ubicación y Programación */}
                {paso === 3 && (
                    <div className={estilos.layoutPrincipal}>
                        <div className={estilos.columnaIzquierda}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <h3 className={estilos.tituloSeccion}>
                                    <ion-icon name="location-outline"></ion-icon>
                                    Ubicación del Servicio
                                </h3>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>
                                        Ubicación Completa *
                                        <span className={estilos.required}>Requerido</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        className={`${estilos.input} ${estilos[tema]} ${errors.ubicacion ? estilos.inputError : ''}`}
                                        placeholder="Calle, número, sector, ciudad"
                                    />
                                    {errors.ubicacion && (
                                        <span className={estilos.errorMsg}>
                                            <ion-icon name="alert-circle-outline"></ion-icon>
                                            {errors.ubicacion}
                                        </span>
                                    )}
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Zona o Sector</label>
                                    <input
                                        type="text"
                                        name="zona"
                                        value={formData.zona}
                                        onChange={handleChange}
                                        className={`${estilos.input} ${estilos[tema]}`}
                                        placeholder="Ej: Zona Colonial, Piantini, etc."
                                    />
                                </div>
                            </div>

                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <h3 className={estilos.tituloSeccion}>
                                    <ion-icon name="calendar-outline"></ion-icon>
                                    Programación
                                </h3>

                                <div className={estilos.grid2}>
                                    <div className={estilos.grupo}>
                                        <label className={estilos.label}>
                                            Fecha Programada *
                                            <span className={estilos.required}>Requerido</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_programada"
                                            value={formData.fecha_programada}
                                            onChange={handleChange}
                                            className={`${estilos.input} ${estilos[tema]} ${errors.fecha_programada ? estilos.inputError : ''}`}
                                        />
                                        {errors.fecha_programada && (
                                            <span className={estilos.errorMsg}>
                                                <ion-icon name="alert-circle-outline"></ion-icon>
                                                {errors.fecha_programada}
                                            </span>
                                        )}
                                    </div>

                                    <div className={estilos.grupo}>
                                        <label className={estilos.label}>Duración Estimada (horas)</label>
                                        <input
                                            type="number"
                                            name="duracion_estimada_horas"
                                            value={formData.duracion_estimada_horas}
                                            onChange={handleChange}
                                            className={`${estilos.input} ${estilos[tema]}`}
                                            placeholder="0.0"
                                            step="0.5"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Costo Estimado (RD$)</label>
                                    <div className={estilos.inputConIcono}>
                                        <ion-icon name="cash-outline"></ion-icon>
                                        <input
                                            type="number"
                                            name="costo_estimado"
                                            value={formData.costo_estimado}
                                            onChange={handleChange}
                                            className={`${estilos.input} ${estilos[tema]}`}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Prioridad</label>
                                    <div className={estilos.gridPrioridad}>
                                        {prioridades.map(prioridad => (
                                            <div
                                                key={prioridad.value}
                                                onClick={() => seleccionarPrioridad(prioridad.value)}
                                                className={`${estilos.cardPrioridad} ${estilos[tema]} ${
                                                    formData.prioridad === prioridad.value ? estilos.cardPrioridadActiva : ''
                                                }`}
                                                style={{ '--prioridad-color': prioridad.color }}
                                            >
                                                <ion-icon name="flag-outline"></ion-icon>
                                                <h4>{prioridad.label}</h4>
                                                <p>{prioridad.descripcion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={estilos.columnaDerecha}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <div className={estilos.ilustracionCard}>
                                    <Image
                                        src="/illustrations3D/_0015.svg"
                                        alt="Ubicación"
                                        width={200}
                                        height={200}
                                        className={estilos.ilustracion}
                                    />
                                    <h4>Ubicación y Fecha</h4>
                                    <p>Define dónde y cuándo se realizará el servicio</p>
                                </div>
                            </div>

                            {prioridadSeleccionada && (
                                <div className={`${estilos.seccionInfo} ${estilos[tema]}`}>
                                    <div className={estilos.infoHeader}>
                                        <ion-icon name="flag-outline" style={{ color: prioridadSeleccionada.color }}></ion-icon>
                                        <div>
                                            <h4>Prioridad Seleccionada</h4>
                                            <p>{prioridadSeleccionada.label}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 4: Cliente y Obra */}
                {paso === 4 && (
                    <div className={estilos.layoutPrincipal}>
                        <div className={estilos.columnaIzquierda}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <h3 className={estilos.tituloSeccion}>
                                    <ion-icon name="people-outline"></ion-icon>
                                    Detalles Adicionales (Opcional)
                                </h3>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Cliente Asociado</label>
                                    <select
                                        name="cliente_id"
                                        value={formData.cliente_id}
                                        onChange={handleChange}
                                        className={`${estilos.input} ${estilos[tema]}`}
                                    >
                                        <option value="">Ninguno</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombreCompleto || `${cliente.nombre} ${cliente.apellidos || ''}`}
                                            </option>
                                        ))}
                                    </select>
                                    <span className={estilos.ayuda}>Selecciona el cliente para este servicio (opcional)</span>
                                </div>

                                <div className={estilos.grupo}>
                                    <label className={estilos.label}>Obra Asociada</label>
                                    <select
                                        name="obra_id"
                                        value={formData.obra_id}
                                        onChange={handleChange}
                                        className={`${estilos.input} ${estilos[tema]}`}
                                    >
                                        <option value="">Ninguna (servicio independiente)</option>
                                        {obras.map(obra => (
                                            <option key={obra.id} value={obra.id}>
                                                {obra.codigo_obra ? `${obra.codigo_obra} - ` : ''}{obra.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <span className={estilos.ayuda}>Asocia el servicio a una obra existente (opcional)</span>
                                </div>
                            </div>
                        </div>

                        <div className={estilos.columnaDerecha}>
                            <div className={`${estilos.seccion} ${estilos[tema]}`}>
                                <div className={estilos.ilustracionCard}>
                                    <Image
                                        src="/illustrations3D/_0008.svg"
                                        alt="Cliente"
                                        width={200}
                                        height={200}
                                        className={estilos.ilustracion}
                                    />
                                    <h4>Cliente y Obra</h4>
                                    <p>Asocia el servicio a un cliente o proyecto (opcional)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 5: Confirmación */}
                {paso === 5 && (
                    <div className={estilos.vistaPrevia}>
                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="checkmark-done-outline"></ion-icon>
                                Confirmar Nuevo Servicio
                            </h3>

                            <div className={estilos.resumenCompleto}>
                                {/* Tipo y Nombre */}
                                <div className={estilos.resumenCard}>
                                    <div className={estilos.resumenHeader}>
                                        <div className={estilos.emojiResumen}>{tipoSeleccionado?.emoji}</div>
                                        <div>
                                            <h4>Tipo de Servicio</h4>
                                            <h2>{tipoSeleccionado?.label}</h2>
                                        </div>
                                    </div>
                                    <div className={estilos.resumenBody}>
                                        <h3>{formData.nombre}</h3>
                                        {formData.descripcion && <p>{formData.descripcion}</p>}
                                    </div>
                                </div>

                                {/* Detalles */}
                                <div className={estilos.detallesFinales}>
                                    <div className={estilos.detalleCardFinal}>
                                        <ion-icon name="location-outline"></ion-icon>
                                        <div>
                                            <p className={estilos.detalleLabel}>Ubicación</p>
                                            <p className={estilos.detalleValor}>{formData.ubicacion}</p>
                                            {formData.zona && <small>{formData.zona}</small>}
                                        </div>
                                    </div>

                                    <div className={estilos.detalleCardFinal}>
                                        <ion-icon name="calendar-outline"></ion-icon>
                                        <div>
                                            <p className={estilos.detalleLabel}>Fecha Programada</p>
                                            <p className={estilos.detalleValor}>
                                                {new Date(formData.fecha_programada).toLocaleDateString('es-DO')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={estilos.detalleCardFinal}>
                                        <ion-icon name="flag-outline"></ion-icon>
                                        <div>
                                            <p className={estilos.detalleLabel}>Prioridad</p>
                                            <p className={estilos.detalleValor}>{prioridadSeleccionada?.label}</p>
                                        </div>
                                    </div>

                                    {formData.duracion_estimada_horas > 0 && (
                                        <div className={estilos.detalleCardFinal}>
                                            <ion-icon name="time-outline"></ion-icon>
                                            <div>
                                                <p className={estilos.detalleLabel}>Duración</p>
                                                <p className={estilos.detalleValor}>{formData.duracion_estimada_horas}h</p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.costo_estimado > 0 && (
                                        <div className={estilos.detalleCardFinal}>
                                            <ion-icon name="cash-outline"></ion-icon>
                                            <div>
                                                <p className={estilos.detalleLabel}>Costo Estimado</p>
                                                <p className={estilos.detalleValor}>
                                                    RD$ {parseFloat(formData.costo_estimado).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.cliente_id && (
                                        <div className={estilos.detalleCardFinal}>
                                            <ion-icon name="person-outline"></ion-icon>
                                            <div>
                                                <p className={estilos.detalleLabel}>Cliente</p>
                                                <p className={estilos.detalleValor}>
                                                    {clientes.find(c => c.id === parseInt(formData.cliente_id))?.nombreCompleto || 'Cliente'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.obra_id && (
                                        <div className={estilos.detalleCardFinal}>
                                            <ion-icon name="business-outline"></ion-icon>
                                            <div>
                                                <p className={estilos.detalleLabel}>Obra</p>
                                                <p className={estilos.detalleValor}>
                                                    {obras.find(o => o.id === parseInt(formData.obra_id))?.nombre || 'Obra'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer con botones de navegación */}
                <div className={`${estilos.footerFijo} ${estilos[tema]}`}>
                    <div className={estilos.footerContenido}>
                        <div className={estilos.footerIzquierda}>
                            {paso > 1 && (
                                <button
                                    type="button"
                                    onClick={pasoAnterior}
                                    className={`${estilos.btnSecundario} ${estilos[tema]}`}
                                    disabled={procesando}
                                >
                                    <ion-icon name="arrow-back-outline"></ion-icon>
                                    Anterior
                                </button>
                            )}
                        </div>

                        <div className={estilos.footerDerecha}>
                            {paso < 5 ? (
                                <button
                                    type="button"
                                    onClick={siguientePaso}
                                    className={estilos.btnPrimario}
                                >
                                    Siguiente
                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className={estilos.btnGuardar}
                                    disabled={procesando}
                                >
                                    {procesando ? (
                                        <>
                                            <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                                            Creando Servicio...
                                        </>
                                    ) : (
                                        <>
                                            <ion-icon name="checkmark-circle-outline"></ion-icon>
                                            Crear Servicio
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
