"use client"
import { useState, useEffect } from 'react'
import { obtenerObras, guardarObra } from './servidor'
import estilos from './obras.module.css'

export default function ObrasAdmin() {
    const [obras, setObras] = useState([])
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [mostrarModal, setMostrarModal] = useState(false)
    const [tema, setTema] = useState('light')

    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        presupuesto_aprobado: '',
        fecha_inicio: '',
        fecha_fin_estimada: ''
    })

    useEffect(() => {
        const t = localStorage.getItem('tema') || 'light'
        setTema(t)
        cargarObras()
    }, [])

    async function cargarObras() {
        setCargando(true)
        const res = await obtenerObras()
        if (res.success) setObras(res.obras)
        setCargando(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setProcesando(true)
        const res = await guardarObra(formData)
        if (res.success) {
            setMostrarModal(false)
            setFormData({
                nombre: '',
                ubicacion: '',
                presupuesto_aprobado: '',
                fecha_inicio: '',
                fecha_fin_estimada: ''
            })
            cargarObras()
        } else {
            alert(res.mensaje)
        }
        setProcesando(false)
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Obras y Proyectos</h1>
                    <p className={estilos.subtitulo}>Control de obras activas y presupuestos</p>
                </div>
                <button className={estilos.btnNuevo} onClick={() => setMostrarModal(true)}>
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Nueva Obra</span>
                </button>
            </div>

            {cargando ? (
                <div className={estilos.cargando}>Cargando proyectos...</div>
            ) : (
                <div className={estilos.grid}>
                    {obras.map(o => (
                        <div key={o.id} className={estilos.tarjeta}>
                            <div className={estilos.tarjetaHeader}>
                                <h3>{o.nombre}</h3>
                                <div className={`${estilos.estado} ${estilos[o.estado.toLowerCase()]}`}>
                                    {o.estado}
                                </div>
                            </div>
                            <div className={estilos.info}>
                                <div className={estilos.itemInfo}>
                                    <ion-icon name="location-outline"></ion-icon>
                                    <span>{o.ubicacion}</span>
                                </div>
                                <div className={estilos.itemInfo}>
                                    <ion-icon name="cash-outline"></ion-icon>
                                    <span className={estilos.presupuesto}>
                                        RD$ {parseFloat(o.presupuesto_aprobado).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className={estilos.footerCards}>
                                <div className={estilos.fechas}>
                                    <small>Inicio: {new Date(o.fecha_inicio).toLocaleDateString()}</small>
                                </div>
                                <button className={estilos.btnVer} onClick={() => alert('Próximamente: Detalle de Obra')}>
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mostrarModal && (
                <div className={estilos.modalOverlay}>
                    <div className={estilos.modal}>
                        <div className={estilos.modalHeader}>
                            <h2>Registrar Nueva Obra</h2>
                            <button onClick={() => setMostrarModal(false)}>
                                <ion-icon name="close-outline"></ion-icon>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className={estilos.modalBody}>
                            <div className={estilos.grupo}>
                                <label>Nombre del Proyecto</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Residencial Las Palmas"
                                />
                            </div>
                            <div className={estilos.grupo}>
                                <label>Ubicación</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.ubicacion}
                                    onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                                    placeholder="Ej: Santo Domingo, D.N."
                                />
                            </div>
                            <div className={estilos.grupo}>
                                <label>Presupuesto Aprobado (RD$)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.presupuesto_aprobado}
                                    onChange={e => setFormData({ ...formData, presupuesto_aprobado: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className={estilos.filaForm}>
                                <div className={estilos.grupo}>
                                    <label>Fecha Inicio</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha_inicio}
                                        onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    />
                                </div>
                                <div className={estilos.grupo}>
                                    <label>Fin Estimado</label>
                                    <input
                                        type="date"
                                        value={formData.fecha_fin_estimada}
                                        onChange={e => setFormData({ ...formData, fecha_fin_estimada: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={estilos.modalFooter}>
                                <button type="button" onClick={() => setMostrarModal(false)} disabled={procesando}>
                                    Cancelar
                                </button>
                                <button type="submit" className={estilos.btnGuardar} disabled={procesando}>
                                    {procesando ? 'Guardando...' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
