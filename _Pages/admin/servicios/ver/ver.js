"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { obtenerServicioPorId } from '../servidor'
import { formatearEstadoServicio, formatearTipoServicio, formatearPrioridad } from '../../core/construction/estados'
import estilos from '../servicios.module.css'

export default function VerServicio() {
    const router = useRouter()
    const params = useParams()
    const [servicio, setServicio] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarServicio()
    }, [params.id])

    async function cargarServicio() {
        const res = await obtenerServicioPorId(params.id)
        if (res.success) {
            setServicio(res.servicio)
        } else {
            alert(res.mensaje || 'Error al cargar servicio')
            router.push('/admin/servicios')
        }
        setCargando(false)
    }

    if (cargando) {
        return <div className={estilos.cargando}>Cargando...</div>
    }

    if (!servicio) {
        return <div className={estilos.vacio}>Servicio no encontrado</div>
    }

    const estadoFormateado = formatearEstadoServicio(servicio.estado)
    const prioridadFormateada = formatearPrioridad(servicio.prioridad)

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>{servicio.nombre}</h1>
                    {servicio.codigo_servicio && (
                        <span className={estilos.codigo}>{servicio.codigo_servicio}</span>
                    )}
                </div>
                <button onClick={() => router.back()} className={estilos.btnVolver}>
                    ← Volver
                </button>
            </div>

            <div className={estilos.detalle}>
                <div className={estilos.seccion}>
                    <h2>Información General</h2>
                    <div className={estilos.infoGrid}>
                        <div>
                            <label>Estado</label>
                            <span className={`${estilos.badge} ${estilos[estadoFormateado.color]}`}>
                                {estadoFormateado.texto}
                            </span>
                        </div>
                        <div>
                            <label>Prioridad</label>
                            <span className={`${estilos.badge} ${estilos[`prioridad_${prioridadFormateada.color}`]}`}>
                                {prioridadFormateada.texto}
                            </span>
                        </div>
                        <div>
                            <label>Tipo de Servicio</label>
                            <span>{formatearTipoServicio(servicio.tipo_servicio)}</span>
                        </div>
                        {servicio.ubicacion && (
                            <div>
                                <label>Ubicación</label>
                                <span>{servicio.ubicacion}</span>
                            </div>
                        )}
                        {servicio.zona && (
                            <div>
                                <label>Zona</label>
                                <span>{servicio.zona}</span>
                            </div>
                        )}
                        {servicio.fecha_solicitud && (
                            <div>
                                <label>Fecha de Solicitud</label>
                                <span>{new Date(servicio.fecha_solicitud).toLocaleDateString()}</span>
                            </div>
                        )}
                        {servicio.fecha_programada && (
                            <div>
                                <label>Fecha Programada</label>
                                <span>{new Date(servicio.fecha_programada).toLocaleDateString()}</span>
                            </div>
                        )}
                        {servicio.duracion_estimada_horas && (
                            <div>
                                <label>Duración Estimada</label>
                                <span>{servicio.duracion_estimada_horas} horas</span>
                            </div>
                        )}
                        {servicio.costo_estimado > 0 && (
                            <div>
                                <label>Costo Estimado</label>
                                <span>RD$ {parseFloat(servicio.costo_estimado).toLocaleString()}</span>
                            </div>
                        )}
                        {servicio.cliente_nombre && (
                            <div>
                                <label>Cliente</label>
                                <span>{servicio.cliente_nombre}</span>
                            </div>
                        )}
                        {servicio.obra_nombre && (
                            <div>
                                <label>Obra Asociada</label>
                                <span>{servicio.codigo_obra} - {servicio.obra_nombre}</span>
                            </div>
                        )}
                        {servicio.responsable_nombre && (
                            <div>
                                <label>Responsable</label>
                                <span>{servicio.responsable_nombre}</span>
                            </div>
                        )}
                    </div>
                </div>

                {servicio.descripcion && (
                    <div className={estilos.seccion}>
                        <h2>Descripción</h2>
                        <p>{servicio.descripcion}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

