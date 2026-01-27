"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerDashboardConstructora } from './servidor'
import { formatearEstadoObra, formatearPrioridad } from '../core/construction/estados'
import { calcularPorcentajeEjecutado, calcularDiasRestantes } from '../core/construction/calculos'
import { obtenerSeveridadAlerta } from '../core/construction/reglas'
import estilos from './constructora.module.css'

export default function ConstructoraAdmin() {
    const router = useRouter()
    const [dashboard, setDashboard] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarDashboard()
    }, [])

    async function cargarDashboard() {
        setCargando(true)
        const res = await obtenerDashboardConstructora()
        if (res.success) {
            setDashboard(res.dashboard)
        }
        setCargando(false)
    }

    if (cargando) {
        return (
            <div className={estilos.contenedor}>
                <div className={estilos.cargando}>Cargando dashboard...</div>
            </div>
        )
    }

    if (!dashboard) {
        return (
            <div className={estilos.contenedor}>
                <div className={estilos.vacio}>Error al cargar el dashboard</div>
            </div>
        )
    }

    const getEstadoColor = (porcentaje) => {
        if (porcentaje >= 90) return 'bg-red-500'
        if (porcentaje >= 70) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getPrioridadColor = (prioridad) => {
        const colores = {
            urgente: 'bg-red-100 text-red-800 border-red-300',
            alta: 'bg-orange-100 text-orange-800 border-orange-300',
            media: 'bg-blue-100 text-blue-800 border-blue-300',
            baja: 'bg-gray-100 text-gray-800 border-gray-300'
        }
        return colores[prioridad] || colores.media
    }

    return (
        <div className={estilos.contenedor}>
            {/* Header */}
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <h1 className={estilos.titulo}>
                        <ion-icon name="construct-outline"></ion-icon>
                        Control de Obras y Costos
                    </h1>
                    <p className={estilos.subtitulo}>
                        {new Date().toLocaleDateString('es-DO', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className={estilos.botonesHeader}>
                    <button 
                        className={estilos.btnNuevo}
                        onClick={() => router.push('/admin/obras/nuevo')}
                    >
                        <ion-icon name="add-outline"></ion-icon>
                        <span>Nueva Obra</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={estilos.stats}>
                <div className={estilos.statCard}>
                    <div className={`${estilos.statIcon} ${estilos.primary}`}>
                        <ion-icon name="business-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Obras Activas</p>
                        <p className={estilos.statValue}>{dashboard.estadisticas.obras_activas}</p>
                    </div>
                </div>
                <div className={estilos.statCard}>
                    <div className={`${estilos.statIcon} ${estilos.success}`}>
                        <ion-icon name="people-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Personal en Campo</p>
                        <p className={estilos.statValue}>{dashboard.estadisticas.personal_campo}</p>
                    </div>
                </div>
                <div className={estilos.statCard}>
                    <div className={`${estilos.statIcon} ${estilos.primary}`}>
                        <ion-icon name="flash-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Servicios Hoy</p>
                        <p className={estilos.statValue}>{dashboard.estadisticas.servicios_pendientes}</p>
                    </div>
                </div>
                <div className={estilos.statCard}>
                    <div className={`${estilos.statIcon} ${estilos.danger}`}>
                        <ion-icon name="warning-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Alertas Activas</p>
                        <p className={estilos.statValue}>{dashboard.estadisticas.alertas_activas}</p>
                    </div>
                </div>
            </div>

            {/* Alertas de Presupuesto */}
            {dashboard.alertas_presupuesto.length > 0 && (
                <div className={estilos.alertas}>
                    <h2>
                        <ion-icon name="alert-circle-outline"></ion-icon>
                        Alertas de Presupuesto
                    </h2>
                    {dashboard.alertas_presupuesto.map(alerta => {
                        const severidad = obtenerSeveridadAlerta(alerta.porcentaje_ejecutado)
                        return (
                            <div key={alerta.id} className={`${estilos.alerta} ${estilos[`alerta_${severidad}`]}`}>
                                <div>
                                    <strong>{alerta.obra_nombre || 'Obra'}</strong>
                                    <p>
                                        {alerta.tipo_alerta === 'umbral_70' ? 'Ha alcanzado el 70% del presupuesto' :
                                         alerta.tipo_alerta === 'umbral_90' ? 'Ha alcanzado el 90% del presupuesto' :
                                         alerta.tipo_alerta === 'excedido' ? 'Ha excedido el presupuesto' :
                                         'Proyección de sobrecosto'}
                                    </p>
                                </div>
                                <button onClick={() => router.push(`/admin/presupuesto?obra=${alerta.destino_id}`)}>
                                    Ver Detalle
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className={estilos.grid}>
                {/* Obras Activas */}
                <div className={estilos.seccion}>
                    <div className={estilos.seccionHeader}>
                        <h2>
                            <ion-icon name="business-outline"></ion-icon>
                            Obras Activas
                        </h2>
                        <button onClick={() => router.push('/admin/obras')}>
                            <span>Ver todas</span>
                            <ion-icon name="arrow-forward-outline"></ion-icon>
                        </button>
                    </div>
                    {dashboard.obras_activas.length === 0 ? (
                        <div className={estilos.vacio}>No hay obras activas</div>
                    ) : (
                        <div className={estilos.listaObras}>
                            {dashboard.obras_activas.map(obra => {
                                const porcentajeEjecutado = calcularPorcentajeEjecutado(
                                    obra.costo_ejecutado || 0,
                                    obra.presupuesto_aprobado || 0
                                )
                                const diasRestantes = obra.fecha_fin_estimada 
                                    ? calcularDiasRestantes(obra.fecha_fin_estimada)
                                    : null
                                
                                return (
                                    <div key={obra.id} className={estilos.tarjetaObra}>
                                        <div className={estilos.obraHeader}>
                                            <div>
                                                <span className={estilos.codigoObra}>{obra.codigo_obra}</span>
                                                <h3>{obra.nombre}</h3>
                                                <p className={estilos.ubicacion}>
                                            <ion-icon name="location-outline"></ion-icon>
                                            <span>{obra.ubicacion}</span>
                                        </p>
                                            </div>
                                            {obra.costo_ejecutado > 0 && (
                                                <div className={estilos.badgeAlerta}>
                                                    {porcentajeEjecutado >= 90 ? '🔴' : 
                                                     porcentajeEjecutado >= 70 ? '🟡' : '🟢'}
                                                </div>
                                            )}
                                        </div>
                                        <div className={estilos.obraBody}>
                                            <div className={estilos.infoObra}>
                                                <div>
                                                    <span>Presupuesto</span>
                                                    <strong>RD$ {parseFloat(obra.presupuesto_aprobado || 0).toLocaleString()}</strong>
                                                </div>
                                                {obra.costo_ejecutado > 0 && (
                                                    <div>
                                                        <span>Ejecutado</span>
                                                        <strong>RD$ {parseFloat(obra.costo_ejecutado).toLocaleString()}</strong>
                                                    </div>
                                                )}
                                            </div>
                                            {obra.costo_ejecutado > 0 && (
                                                <div className={estilos.progresoObra}>
                                                    <div className={estilos.progresoHeader}>
                                                        <span>Avance</span>
                                                        <span className={porcentajeEjecutado >= 90 ? estilos.critico : 
                                                                      porcentajeEjecutado >= 70 ? estilos.atencion : estilos.normal}>
                                                            {porcentajeEjecutado.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className={estilos.barraProgreso}>
                                                        <div 
                                                            className={estilos[getEstadoColor(porcentajeEjecutado)]}
                                                            style={{ width: `${Math.min(porcentajeEjecutado, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className={estilos.obraFooter}>
                                                {diasRestantes !== null && (
                                                    <span className={diasRestantes < 0 ? estilos.diasVencidos : ''}>
                                                        {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencido'}
                                                    </span>
                                                )}
                                                <button onClick={() => router.push(`/admin/obras/ver/${obra.id}`)}>
                                                    <span>Ver detalles</span>
                                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className={estilos.sidebar}>
                    {/* Personal en Campo */}
                    <div className={estilos.cardSidebar}>
                        <h3>
                            <ion-icon name="people-outline"></ion-icon>
                            Personal en Campo
                        </h3>
                        {dashboard.personal_campo.length === 0 ? (
                            <p className={estilos.vacio}>No hay personal activo hoy</p>
                        ) : (
                            <div className={estilos.listaPersonal}>
                                {dashboard.personal_campo.map(persona => (
                                    <div key={persona.id} className={estilos.itemPersonal}>
                                        <div className={estilos.avatar}>
                                            {persona.nombre.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <strong>{persona.nombre} {persona.apellidos}</strong>
                                            <p>{persona.rol}</p>
                                            <p className={estilos.obraNombre}>{persona.obra_nombre || persona.servicio_nombre}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => router.push('/admin/personal')}>
                            <span>Ver todos</span>
                            <ion-icon name="arrow-forward-outline"></ion-icon>
                        </button>
                    </div>

                    {/* Servicios Hoy */}
                    {dashboard.servicios_hoy.length > 0 && (
                        <div className={estilos.cardSidebar}>
                            <h3>
                                <ion-icon name="flash-outline"></ion-icon>
                                Servicios del Día
                            </h3>
                            <div className={estilos.listaServicios}>
                                {dashboard.servicios_hoy.map(servicio => {
                                    const prioridadFormateada = formatearPrioridad(servicio.prioridad)
                                    return (
                                        <div key={servicio.id} className={`${estilos.itemServicio} ${estilos[getPrioridadColor(servicio.prioridad)]}`}>
                                            <strong>{servicio.nombre}</strong>
                                            <p>{servicio.cliente_nombre || 'Sin cliente'}</p>
                                            <span>{prioridadFormateada.texto}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <button onClick={() => router.push('/admin/servicios')}>
                                <span>Ver todos</span>
                                <ion-icon name="arrow-forward-outline"></ion-icon>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

