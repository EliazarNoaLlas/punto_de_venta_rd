"use client"
import {useState, useEffect} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {asignarTrabajador, obtenerTrabajadores, obtenerObrasYServicios} from '../servidor'
import estilos from '../personal.module.css'

export default function AsignarPersonal() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const trabajadorIdParam = searchParams.get('trabajador')

    const [trabajadores, setTrabajadores] = useState([])
    const [obras, setObras] = useState([])
    const [servicios, setServicios] = useState([])
    const [formData, setFormData] = useState({
        trabajador_id: trabajadorIdParam || '',
        tipo_destino: 'obra',
        destino_id: '',
        fecha_asignacion: new Date().toISOString().split('T')[0],
        hora_inicio: '',
        hora_fin: '',
        actividad: '',
        zona_trabajo: ''
    })
    const [errors, setErrors] = useState({})
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        setCargando(true)

        const [resTrabajadores, resDestinos] = await Promise.all([
            obtenerTrabajadores({estado: 'activo'}),
            obtenerObrasYServicios()
        ])

        if (resTrabajadores.success) {
            setTrabajadores(resTrabajadores.trabajadores)
        }

        if (resDestinos.success) {
            setObras(resDestinos.obras)
            setServicios(resDestinos.servicios)
        }

        setCargando(false)
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData(prev => ({...prev, [name]: value}))
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setProcesando(true)

        const res = await asignarTrabajador(formData)
        setProcesando(false)

        if (res.success) {
            router.push('/admin/personal')
        } else {
            if (res.errores) {
                setErrors(res.errores)
            } else {
                alert(res.mensaje || 'Error al asignar trabajador')
            }
        }
    }

    const destinosDisponibles = formData.tipo_destino === 'obra' ? obras : servicios

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Asignar Personal</h1>
                    <p className={estilos.subtitulo}>Asignar trabajador a obra o servicio</p>
                </div>
                <button className={estilos.btnNuevo} onClick={() => router.back()}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    <span>Volver</span>
                </button>
            </div>

            {cargando ? (
                <div className={estilos.cargando}>Cargando...</div>
            ) : (
                <form onSubmit={handleSubmit} className={estilos.form}>
                    <section className={estilos.seccion}>
                        <h3>Trabajador</h3>
                        <div className={estilos.grupo}>
                            <label>Seleccionar Trabajador *</label>
                            <select
                                name="trabajador_id"
                                value={formData.trabajador_id}
                                onChange={handleChange}
                                required
                                className={errors.trabajador_id ? estilos.error : ''}
                            >
                                <option value="">Seleccione un trabajador...</option>
                                {trabajadores.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre} {t.apellidos} - {t.rol_especialidad}
                                    </option>
                                ))}
                            </select>
                            {errors.trabajador_id && <span className={estilos.errorMsg}>{errors.trabajador_id}</span>}
                        </div>
                    </section>

                    <section className={estilos.seccion}>
                        <h3>Tipo de Destino</h3>
                        <div className={estilos.gridTipos}>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({...prev, tipo_destino: 'obra', destino_id: ''}))
                                }}
                                className={`${estilos.tipoDestino} ${formData.tipo_destino === 'obra' ? estilos.tipoDestinoActivo : ''}`}
                            >
                                <span style={{fontSize: '32px'}}>🏗️</span>
                                <span>Obra</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({...prev, tipo_destino: 'servicio', destino_id: ''}))
                                }}
                                className={`${estilos.tipoDestino} ${formData.tipo_destino === 'servicio' ? estilos.tipoDestinoActivo : ''}`}
                            >
                                <span style={{fontSize: '32px'}}>⚡</span>
                                <span>Servicio</span>
                            </button>
                        </div>
                    </section>

                    <section className={estilos.seccion}>
                        <h3>Destino</h3>
                        <div className={estilos.grupo}>
                            <label>{formData.tipo_destino === 'obra' ? 'Obra' : 'Servicio'} *</label>
                            <select
                                name="destino_id"
                                value={formData.destino_id}
                                onChange={handleChange}
                                required
                                className={errors.destino_id ? estilos.error : ''}
                            >
                                <option value="">Seleccione...</option>
                                {destinosDisponibles.map(destino => (
                                    <option key={destino.id} value={destino.id}>
                                        {destino.codigo_obra || ''} {destino.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.destino_id && <span className={estilos.errorMsg}>{errors.destino_id}</span>}
                        </div>
                    </section>

                    <section className={estilos.seccion}>
                        <h3>Fecha y Horario</h3>
                        <div className={estilos.fila}>
                            <div className={estilos.grupo}>
                                <label>Fecha de Asignación *</label>
                                <input
                                    type="date"
                                    name="fecha_asignacion"
                                    value={formData.fecha_asignacion}
                                    onChange={handleChange}
                                    required
                                    className={errors.fecha_asignacion ? estilos.error : ''}
                                />
                                {errors.fecha_asignacion &&
                                    <span className={estilos.errorMsg}>{errors.fecha_asignacion}</span>}
                            </div>
                            <div className={estilos.grupo}>
                                <label>Hora Inicio</label>
                                <input
                                    type="time"
                                    name="hora_inicio"
                                    value={formData.hora_inicio}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={estilos.grupo}>
                                <label>Hora Fin</label>
                                <input
                                    type="time"
                                    name="hora_fin"
                                    value={formData.hora_fin}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={estilos.seccion}>
                        <h3>Detalles</h3>
                        <div className={estilos.grupo}>
                            <label>Actividad</label>
                            <input
                                type="text"
                                name="actividad"
                                value={formData.actividad}
                                onChange={handleChange}
                                placeholder="Ej. Instalación eléctrica, Reparación, etc."
                            />
                        </div>
                        <div className={estilos.grupo}>
                            <label>Zona de Trabajo</label>
                            <input
                                type="text"
                                name="zona_trabajo"
                                value={formData.zona_trabajo}
                                onChange={handleChange}
                                placeholder="Ej. Segundo piso, Área frontal, etc."
                            />
                        </div>
                    </section>

                    <div className={estilos.modalFooter}>
                        <button type="button" onClick={() => router.back()} disabled={procesando}>
                            Cancelar
                        </button>
                        <button type="submit" className={estilos.btnGuardar} disabled={procesando}>
                            {procesando ? 'Asignando...' : 'Confirmar Asignación'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

