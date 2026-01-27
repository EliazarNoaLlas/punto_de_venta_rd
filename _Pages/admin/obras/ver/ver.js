"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerObraPorId } from './servidor'
import { formatearEstadoObra, formatearTipoObra } from '../../core/construction/estados'
import { calcularPorcentajeEjecutado, calcularDiasRestantes } from '../../core/construction/calculos'
import estilos from '../listar/listar.module.css'

export default function VerObra({ id }) {
    const router = useRouter()
    const [obra, setObra] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarObra()
    }, [id])

    async function cargarObra() {
        setCargando(true)
        const res = await obtenerObraPorId(id)
        if (res.success && res.obra) {
            setObra(res.obra)
        } else {
            alert(res.mensaje || 'Error al cargar la obra')
            router.push('/admin/obras')
        }
        setCargando(false)
    }

    if (cargando) {
        return (
            <div className={estilos.contenedor}>
                <div className={estilos.cargando}>Cargando obra...</div>
            </div>
        )
    }

    if (!obra) {
        return (
            <div className={estilos.contenedor}>
                <div className={estilos.cargando}>Obra no encontrada</div>
            </div>
        )
    }

    const estadoFormateado = formatearEstadoObra(obra.estado)
    const porcentajeEjecutado = calcularPorcentajeEjecutado(
        obra.costo_ejecutado || 0,
        obra.presupuesto_aprobado || 0
    )
    const diasRestantes = obra.fecha_fin_estimada 
        ? calcularDiasRestantes(obra.fecha_fin_estimada)
        : null

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>{obra.nombre}</h1>
                    <p className={estilos.subtitulo}>
                        {obra.codigo_obra && <span className={estilos.codigoObra}>{obra.codigo_obra}</span>}
                        <span className={`${estilos.estado} ${estilos[estadoFormateado.color]}`}>
                            {estadoFormateado.texto}
                        </span>
                    </p>
                </div>
                <div className={estilos.botonesAccion}>
                    <button className={estilos.btnNuevo} onClick={() => router.push(`/admin/obras/editar/${id}`)}>
                        <ion-icon name="create-outline"></ion-icon>
                        <span>Editar</span>
                    </button>
                    <button className={estilos.btnNuevo} onClick={() => router.back()}>
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        <span>Volver</span>
                    </button>
                </div>
            </div>

            <div className={estilos.detalleObra}>
                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Información General</h2>
                    <div className={estilos.gridInfo}>
                        <div className={estilos.itemInfo}>
                            <label>Tipo de Obra</label>
                            <p>{formatearTipoObra(obra.tipo_obra)}</p>
                        </div>
                        <div className={estilos.itemInfo}>
                            <label>Ubicación</label>
                            <p>{obra.ubicacion}</p>
                        </div>
                        {obra.zona && (
                            <div className={estilos.itemInfo}>
                                <label>Zona</label>
                                <p>{obra.zona}</p>
                            </div>
                        )}
                        {obra.municipio && (
                            <div className={estilos.itemInfo}>
                                <label>Municipio</label>
                                <p>{obra.municipio}</p>
                            </div>
                        )}
                        {obra.provincia && (
                            <div className={estilos.itemInfo}>
                                <label>Provincia</label>
                                <p>{obra.provincia}</p>
                            </div>
                        )}
                        {obra.descripcion && (
                            <div className={estilos.itemInfo}>
                                <label>Descripción</label>
                                <p>{obra.descripcion}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Presupuesto y Costos</h2>
                    <div className={estilos.gridInfo}>
                        <div className={estilos.itemInfo}>
                            <label>Presupuesto Aprobado</label>
                            <p className={estilos.presupuesto}>
                                RD$ {parseFloat(obra.presupuesto_aprobado || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className={estilos.itemInfo}>
                            <label>Costo Ejecutado</label>
                            <p>RD$ {parseFloat(obra.costo_ejecutado || 0).toLocaleString()}</p>
                        </div>
                        <div className={estilos.itemInfo}>
                            <label>Porcentaje Ejecutado</label>
                            <p className={porcentajeEjecutado >= 90 ? estilos.alertaCritica : 
                                          porcentajeEjecutado >= 70 ? estilos.alertaPreventiva : ''}>
                                {porcentajeEjecutado.toFixed(1)}%
                            </p>
                        </div>
                        <div className={estilos.itemInfo}>
                            <label>Saldo Restante</label>
                            <p>RD$ {parseFloat((obra.presupuesto_aprobado || 0) - (obra.costo_ejecutado || 0)).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Fechas</h2>
                    <div className={estilos.gridInfo}>
                        <div className={estilos.itemInfo}>
                            <label>Fecha de Inicio</label>
                            <p>{obra.fecha_inicio ? new Date(obra.fecha_inicio).toLocaleDateString() : '-'}</p>
                        </div>
                        <div className={estilos.itemInfo}>
                            <label>Fecha de Fin Estimada</label>
                            <p>{obra.fecha_fin_estimada ? new Date(obra.fecha_fin_estimada).toLocaleDateString() : '-'}</p>
                        </div>
                        {diasRestantes !== null && (
                            <div className={estilos.itemInfo}>
                                <label>Días Restantes</label>
                                <p className={diasRestantes < 0 ? estilos.diasVencidos : ''}>
                                    {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}
                                </p>
                            </div>
                        )}
                        {obra.fecha_creacion && (
                            <div className={estilos.itemInfo}>
                                <label>Fecha de Creación</label>
                                <p>{new Date(obra.fecha_creacion).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>

                {(obra.cliente_nombre || obra.responsable_nombre) && (
                    <div className={estilos.seccion}>
                        <h2 className={estilos.seccionTitulo}>Responsables</h2>
                        <div className={estilos.gridInfo}>
                            {obra.cliente_nombre && (
                                <div className={estilos.itemInfo}>
                                    <label>Cliente</label>
                                    <p>{obra.cliente_nombre}</p>
                                </div>
                            )}
                            {obra.responsable_nombre && (
                                <div className={estilos.itemInfo}>
                                    <label>Responsable</label>
                                    <p>{obra.responsable_nombre}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

