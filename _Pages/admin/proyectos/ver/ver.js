"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { obtenerProyectoPorId } from '../servidor'
import { formatearEstadoProyecto } from '../../core/construction/estados'
import estilos from '../proyectos.module.css'

export default function VerProyecto() {
    const router = useRouter()
    const params = useParams()
    const [proyecto, setProyecto] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarProyecto()
    }, [params.id])

    async function cargarProyecto() {
        const res = await obtenerProyectoPorId(params.id)
        if (res.success) {
            setProyecto(res.proyecto)
        } else {
            alert(res.mensaje || 'Error al cargar proyecto')
            router.push('/admin/proyectos')
        }
        setCargando(false)
    }

    if (cargando) {
        return <div className={estilos.cargando}>Cargando...</div>
    }

    if (!proyecto) {
        return <div className={estilos.vacio}>Proyecto no encontrado</div>
    }

    const estadoFormateado = formatearEstadoProyecto(proyecto.estado)

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>{proyecto.nombre}</h1>
                    {proyecto.codigo_proyecto && (
                        <span className={estilos.codigo}>{proyecto.codigo_proyecto}</span>
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
                        {proyecto.fecha_inicio && (
                            <div>
                                <label>Fecha de Inicio</label>
                                <span>{new Date(proyecto.fecha_inicio).toLocaleDateString()}</span>
                            </div>
                        )}
                        {proyecto.fecha_fin_estimada && (
                            <div>
                                <label>Fecha de Fin Estimada</label>
                                <span>{new Date(proyecto.fecha_fin_estimada).toLocaleDateString()}</span>
                            </div>
                        )}
                        {proyecto.presupuesto_total > 0 && (
                            <div>
                                <label>Presupuesto Total</label>
                                <span>RD$ {parseFloat(proyecto.presupuesto_total).toLocaleString()}</span>
                            </div>
                        )}
                        {proyecto.cliente_nombre && (
                            <div>
                                <label>Cliente</label>
                                <span>{proyecto.cliente_nombre}</span>
                            </div>
                        )}
                        {proyecto.responsable_nombre && (
                            <div>
                                <label>Responsable</label>
                                <span>{proyecto.responsable_nombre}</span>
                            </div>
                        )}
                    </div>
                </div>

                {proyecto.descripcion && (
                    <div className={estilos.seccion}>
                        <h2>Descripción</h2>
                        <p>{proyecto.descripcion}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

