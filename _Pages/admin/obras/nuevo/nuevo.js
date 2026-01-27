"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearObra } from './servidor'
import { TIPOS_OBRA, formatearTipoObra } from '../../core/construction/estados'
import estilos from './nuevo.module.css'

export default function NuevaObra() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        zona: '',
        municipio: '',
        provincia: '',
        tipo_obra: TIPOS_OBRA.CONSTRUCCION,
        presupuesto_aprobado: '',
        fecha_inicio: '',
        fecha_fin_estimada: '',
        cliente_id: '',
        responsable_id: '',
        descripcion: '',
        max_trabajadores: 50
    })

    const [errors, setErrors] = useState({})
    const [step, setStep] = useState(1)
    const [procesando, setProcesando] = useState(false)

    const tiposObra = [
        { value: TIPOS_OBRA.CONSTRUCCION, label: 'Construcción', icon: '🏗️', ionIcon: 'construct-outline' },
        { value: TIPOS_OBRA.REMODELACION, label: 'Remodelación', icon: '🔨', ionIcon: 'hammer-outline' },
        { value: TIPOS_OBRA.REPARACION, label: 'Reparación', icon: '🔧', ionIcon: 'build-outline' },
        { value: TIPOS_OBRA.MANTENIMIENTO, label: 'Mantenimiento', icon: '⚙️', ionIcon: 'settings-outline' },
        { value: TIPOS_OBRA.OTRO, label: 'Otro', icon: '📋', ionIcon: 'document-text-outline' }
    ]

    const provincias = [
        'Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal', 'Puerto Plata',
        'San Pedro de Macorís', 'La Romana', 'San Francisco de Macorís', 'Moca', 'Baní'
    ]

    // ========================================
    // Cargar tema y escuchar cambios
    // ========================================
    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)

        const manejarCambioTema = () => setTema(localStorage.getItem('tema') || 'light')

        window.addEventListener('temaChange', manejarCambioTema)
        window.addEventListener('storage', manejarCambioTema)

        return () => {
            window.removeEventListener('temaChange', manejarCambioTema)
            window.removeEventListener('storage', manejarCambioTema)
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (currentStep) => {
        const newErrors = {}

        if (currentStep === 1) {
            if (!formData.nombre || formData.nombre.trim() === '') {
                newErrors.nombre = 'El nombre de la obra es obligatorio'
            }
            if (!formData.ubicacion || formData.ubicacion.trim() === '') {
                newErrors.ubicacion = 'La ubicación es obligatoria'
            }
        }

        if (currentStep === 2) {
            if (!formData.presupuesto_aprobado || parseFloat(formData.presupuesto_aprobado) <= 0) {
                newErrors.presupuesto_aprobado = 'El presupuesto debe ser mayor a 0'
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
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateStep(step)) return

        setProcesando(true)
        const datos = {
            ...formData,
            presupuesto_aprobado: parseFloat(formData.presupuesto_aprobado),
            cliente_id: formData.cliente_id || null,
            responsable_id: formData.responsable_id || null,
        }

        try {
            const res = await crearObra(datos)
            setProcesando(false)

            if (res.success) {
                alert(`✅ ${res.mensaje || 'Obra creada exitosamente'}\n\nObra ID: ${res.obraId || 'N/A'}`)
                router.push('/admin/obras')
            } else {
                if (res.errores) {
                    setErrors(res.errores)
                } else {
                    alert(`❌ ${res.mensaje || 'Error al crear la obra'}`)
                }
            }
        } catch (error) {
            console.error('Error al crear obra:', error)
            alert('Error al procesar la solicitud')
            setProcesando(false)
        }
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    const pasos = [
        { numero: 1, label: 'Información General', icon: 'information-circle-outline' },
        { numero: 2, label: 'Presupuesto y Fechas', icon: 'calendar-outline' },
        { numero: 3, label: 'Responsables', icon: 'people-outline' }
    ]

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* HEADER */}
            <div className={estilos.header}>
                <div className={estilos.headerLeft}>
                    <h1 className={estilos.titulo}>
                        <ion-icon name="construct-outline"></ion-icon>
                        Nueva Obra
                    </h1>
                    <p className={estilos.subtitulo}>Registro completo de obra con información detallada</p>
                </div>
                <button
                    type="button"
                    className={estilos.btnCancelar}
                    onClick={() => router.push('/admin/obras')}
                    disabled={procesando}
                    aria-label="Cancelar creación de obra"
                >
                    <ion-icon name="close-outline"></ion-icon>
                    <span>Cancelar</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className={estilos.formulario}>
                {/* Indicador de Pasos */}
                <div className={estilos.pasoIndicador}>
                    {pasos.map((paso) => (
                        <div
                            key={paso.numero}
                            className={`${estilos.pasoItem} ${
                                step === paso.numero ? estilos.activo : step > paso.numero ? estilos.completado : ''
                            }`}
                        >
                            <div className={estilos.pasoNumero}>
                                {step > paso.numero ? (
                                    <ion-icon name="checkmark"></ion-icon>
                                ) : (
                                    paso.numero
                                )}
                            </div>
                            <span className={estilos.pasoLabel}>{paso.label}</span>
                        </div>
                    ))}
                </div>

                <div className={estilos.layoutPrincipal}>
                    {/* Step 1: Información General */}
                    {step === 1 && (
                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="information-circle-outline"></ion-icon>
                                <span>Información General</span>
                            </h3>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="document-text-outline"></ion-icon>
                                    Nombre de la Obra *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej. Construcción Casa Familia Pérez"
                                    className={`${estilos.input} ${errors.nombre ? estilos.error : ''}`}
                                    disabled={procesando}
                                />
                                {errors.nombre && (
                                    <span className={estilos.errorMsg}>
                                        <ion-icon name="alert-circle-outline"></ion-icon>
                                        {errors.nombre}
                                    </span>
                                )}
                            </div>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="construct-outline"></ion-icon>
                                    Tipo de Obra *
                                </label>
                                <div className={estilos.gridTipos}>
                                    {tiposObra.map(tipo => (
                                        <button
                                            key={tipo.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tipo_obra: tipo.value }))}
                                            className={`${estilos.tipoObra} ${formData.tipo_obra === tipo.value ? estilos.tipoObraActivo : ''}`}
                                            disabled={procesando}
                                        >
                                            <span className={estilos.tipoIcon}>{tipo.icon}</span>
                                            <span>{tipo.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="location-outline"></ion-icon>
                                    Ubicación / Dirección *
                                </label>
                                <input
                                    type="text"
                                    name="ubicacion"
                                    value={formData.ubicacion}
                                    onChange={handleChange}
                                    placeholder="Ej. Zona Norte - Lote 24"
                                    className={`${estilos.input} ${errors.ubicacion ? estilos.error : ''}`}
                                    disabled={procesando}
                                />
                                {errors.ubicacion && (
                                    <span className={estilos.errorMsg}>
                                        <ion-icon name="alert-circle-outline"></ion-icon>
                                        {errors.ubicacion}
                                    </span>
                                )}
                            </div>

                            <div className={estilos.gridDosColumnas}>
                                <div className={estilos.grupoInput}>
                                    <label>
                                        <ion-icon name="map-outline"></ion-icon>
                                        Zona / Sector
                                    </label>
                                    <input
                                        type="text"
                                        name="zona"
                                        value={formData.zona}
                                        onChange={handleChange}
                                        placeholder="Ej. Los Jardines"
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>
                                <div className={estilos.grupoInput}>
                                    <label>
                                        <ion-icon name="business-outline"></ion-icon>
                                        Municipio
                                    </label>
                                    <input
                                        type="text"
                                        name="municipio"
                                        value={formData.municipio}
                                        onChange={handleChange}
                                        placeholder="Ej. Santo Domingo Este"
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>
                            </div>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="globe-outline"></ion-icon>
                                    Provincia
                                </label>
                                <select
                                    name="provincia"
                                    value={formData.provincia}
                                    onChange={handleChange}
                                    className={estilos.select}
                                    disabled={procesando}
                                >
                                    <option value="">Seleccione una provincia...</option>
                                    {provincias.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="document-text-outline"></ion-icon>
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Descripción detallada de la obra, características especiales, requerimientos..."
                                    className={estilos.textarea}
                                    disabled={procesando}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Presupuesto y Fechas */}
                    {step === 2 && (
                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="calendar-outline"></ion-icon>
                                <span>Presupuesto y Fechas</span>
                            </h3>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="cash-outline"></ion-icon>
                                    Presupuesto Aprobado (RD$) *
                                </label>
                                <div className={estilos.inputMoneda}>
                                    <span>RD$</span>
                                    <input
                                        type="number"
                                        name="presupuesto_aprobado"
                                        value={formData.presupuesto_aprobado}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`${estilos.input} ${errors.presupuesto_aprobado ? estilos.error : ''}`}
                                        disabled={procesando}
                                    />
                                </div>
                                {errors.presupuesto_aprobado && (
                                    <span className={estilos.errorMsg}>
                                        <ion-icon name="alert-circle-outline"></ion-icon>
                                        {errors.presupuesto_aprobado}
                                    </span>
                                )}
                            </div>

                            <div className={estilos.gridDosColumnas}>
                                <div className={estilos.grupoInput}>
                                    <label>
                                        <ion-icon name="calendar-outline"></ion-icon>
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha_inicio"
                                        value={formData.fecha_inicio}
                                        onChange={handleChange}
                                        className={`${estilos.input} ${errors.fecha_inicio ? estilos.error : ''}`}
                                        disabled={procesando}
                                    />
                                    {errors.fecha_inicio && (
                                        <span className={estilos.errorMsg}>
                                            <ion-icon name="alert-circle-outline"></ion-icon>
                                            {errors.fecha_inicio}
                                        </span>
                                    )}
                                </div>
                                <div className={estilos.grupoInput}>
                                    <label>
                                        <ion-icon name="calendar-clear-outline"></ion-icon>
                                        Fecha de Fin Estimada *
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha_fin_estimada"
                                        value={formData.fecha_fin_estimada}
                                        onChange={handleChange}
                                        min={formData.fecha_inicio || ''}
                                        className={`${estilos.input} ${errors.fecha_fin_estimada ? estilos.error : ''}`}
                                        disabled={procesando}
                                    />
                                    {errors.fecha_fin_estimada && (
                                        <span className={estilos.errorMsg}>
                                            <ion-icon name="alert-circle-outline"></ion-icon>
                                            {errors.fecha_fin_estimada}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="people-outline"></ion-icon>
                                    Máximo de Trabajadores Permitidos
                                </label>
                                <input
                                    type="number"
                                    name="max_trabajadores"
                                    value={formData.max_trabajadores}
                                    onChange={handleChange}
                                    min="1"
                                    max="200"
                                    className={estilos.input}
                                    disabled={procesando}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Responsables */}
                    {step === 3 && (
                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="people-outline"></ion-icon>
                                <span>Responsables</span>
                            </h3>

                            <div className={estilos.gridDosColumnas}>
                                <div className={estilos.grupoInput}>
                                    <label>
                                        <ion-icon name="person-outline"></ion-icon>
                                        Cliente (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        name="cliente_id"
                                        value={formData.cliente_id}
                                        onChange={handleChange}
                                        placeholder="ID del cliente"
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>
                                <div className={estilos.grupoInput}>
                                    <label>
                                        <ion-icon name="person-circle-outline"></ion-icon>
                                        Responsable de la Obra (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        name="responsable_id"
                                        value={formData.responsable_id}
                                        onChange={handleChange}
                                        placeholder="ID del responsable"
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>
                            </div>

                            {/* Resumen */}
                            <div className={estilos.resumen}>
                                <h3>
                                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                                    Resumen de la Obra
                                </h3>
                                <div className={estilos.gridResumen}>
                                    <div>
                                        <p className={estilos.resumenLabel}>Nombre</p>
                                        <p className={estilos.resumenValor}>{formData.nombre || '-'}</p>
                                    </div>
                                    <div>
                                        <p className={estilos.resumenLabel}>Tipo</p>
                                        <p className={estilos.resumenValor}>{formatearTipoObra(formData.tipo_obra)}</p>
                                    </div>
                                    <div>
                                        <p className={estilos.resumenLabel}>Ubicación</p>
                                        <p className={estilos.resumenValor}>{formData.ubicacion || '-'}</p>
                                    </div>
                                    <div>
                                        <p className={estilos.resumenLabel}>Presupuesto</p>
                                        <p className={estilos.resumenValor}>
                                            {formData.presupuesto_aprobado ? formatearMoneda(formData.presupuesto_aprobado) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={estilos.resumenLabel}>Fecha Inicio</p>
                                        <p className={estilos.resumenValor}>
                                            {formData.fecha_inicio ? new Date(formData.fecha_inicio).toLocaleDateString('es-DO') : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={estilos.resumenLabel}>Fecha Fin Estimada</p>
                                        <p className={estilos.resumenValor}>
                                            {formData.fecha_fin_estimada ? new Date(formData.fecha_fin_estimada).toLocaleDateString('es-DO') : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className={estilos.footer}>
                    <div className={estilos.pasoInfo}>
                        Paso {step} de 3
                    </div>
                    <div className={estilos.botonesForm}>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className={estilos.btnAnterior}
                                disabled={procesando}
                            >
                                <ion-icon name="arrow-back-outline"></ion-icon>
                                <span>Anterior</span>
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className={estilos.btnSiguiente}
                                disabled={procesando}
                            >
                                <span>Siguiente</span>
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
                                        <span>Creando Obra...</span>
                                    </>
                                ) : (
                                    <>
                                        <ion-icon name="checkmark-circle-outline"></ion-icon>
                                        <span>Crear Obra</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
