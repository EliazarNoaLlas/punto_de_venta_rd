"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerDashboardConstructora } from './servidor'
import { formatearEstadoObra, formatearPrioridad } from '../core/construction/estados'
import { calcularPorcentajeEjecutado, calcularDiasRestantes } from '../core/construction/calculos'
import { obtenerSeveridadAlerta } from '../core/construction/reglas'
import estilos from './constructora.module.css'

export default function ConstructoraAdmin() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [dashboard, setDashboard] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [vistaActiva, setVistaActiva] = useState('resumen') // resumen, gantt, horarios

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

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 0
        }).format(monto || 0)
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A'
        return new Date(fecha).toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const calcularPorcentajes = () => {
        if (!dashboard) return { obras: 0, servicios: 0, personal: 0 }
        
        const total = dashboard.estadisticas.obras_activas + 
                      dashboard.estadisticas.servicios_pendientes + 
                      dashboard.estadisticas.personal_campo
        
        if (total === 0) return { obras: 33, servicios: 33, personal: 34 }
        
        return {
            obras: ((dashboard.estadisticas.obras_activas / total) * 100).toFixed(1),
            servicios: ((dashboard.estadisticas.servicios_pendientes / total) * 100).toFixed(1),
            personal: ((dashboard.estadisticas.personal_campo / total) * 100).toFixed(1)
        }
    }

    // Función para generar timeline de Gantt
    const generarGanttData = () => {
        if (!dashboard || !dashboard.obras_activas) return []
        
        return dashboard.obras_activas.map(obra => {
            const inicio = obra.fecha_inicio ? new Date(obra.fecha_inicio) : new Date()
            const fin = obra.fecha_fin_estimada ? new Date(obra.fecha_fin_estimada) : new Date()
            const hoy = new Date()
            
            const totalDias = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)))
            const diasTranscurridos = Math.ceil((hoy - inicio) / (1000 * 60 * 60 * 24))
            const progreso = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100))
            
            return {
                id: obra.id,
                nombre: obra.nombre,
                codigo: obra.codigo_obra,
                inicio: formatearFecha(obra.fecha_inicio),
                fin: formatearFecha(obra.fecha_fin_estimada),
                progreso: progreso.toFixed(0),
                estado: obra.estado
            }
        }).slice(0, 6) // Mostrar solo 6 para no saturar
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <h3>Cargando dashboard...</h3>
                    <p>Obteniendo información actualizada</p>
                </div>
            </div>
        )
    }

    if (!dashboard) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.vacio}>
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    <h3>Error al cargar el dashboard</h3>
                    <p>No se pudo obtener la información. Intenta recargar la página.</p>
                    <button className={estilos.btnNuevo} onClick={() => window.location.reload()}>
                        <ion-icon name="refresh-outline"></ion-icon>
                        <span>Recargar</span>
                    </button>
                </div>
            </div>
        )
    }

    const porcentajes = calcularPorcentajes()
    const ganttData = generarGanttData()

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header Principal */}
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <h1 className={estilos.titulo}>
                        <ion-icon name="hammer-outline"></ion-icon>
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
                <div className={estilos.headerAcciones}>
                    <Link href="/admin/servicios/nuevo" className={estilos.btnSecundario}>
                        <ion-icon name="flash-outline"></ion-icon>
                        <span>Nuevo Servicio</span>
                    </Link>
                    <Link href="/admin/obras/nuevo" className={estilos.btnNuevo}>
                        <ion-icon name="add-circle-outline"></ion-icon>
                        <span>Nueva Obra</span>
                    </Link>
                </div>
            </div>

            {/* Tarjetas de Estadísticas Principales */}
            <div className={estilos.estadisticas}>
                <div className={`${estilos.estadCard} ${estilos.primary}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.primary}`}>
                            <ion-icon name="business-outline"></ion-icon>
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Obras Activas</span>
                        <span className={estilos.estadValor}>{dashboard.estadisticas.obras_activas || 0}</span>
                        <span className={estilos.estadTendencia}>
                            <ion-icon name="trending-up-outline"></ion-icon>
                            En construcción
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${estilos.success}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.success}`}>
                            <ion-icon name="people-outline"></ion-icon>
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Personal en Campo</span>
                        <span className={estilos.estadValor}>{dashboard.estadisticas.personal_campo || 0}</span>
                        <span className={estilos.estadTendencia}>
                            <ion-icon name="pulse-outline"></ion-icon>
                            Trabajando hoy
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${estilos.info}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.info}`}>
                            <ion-icon name="flash-outline"></ion-icon>
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Servicios Pendientes</span>
                        <span className={estilos.estadValor}>{dashboard.estadisticas.servicios_pendientes || 0}</span>
                        <span className={estilos.estadTendencia}>
                            <ion-icon name="time-outline"></ion-icon>
                            Programados
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${estilos.warning}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.warning}`}>
                            <ion-icon name="cash-outline"></ion-icon>
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Presupuesto Total</span>
                        <span className={estilos.estadValor}>
                            {formatearMoneda(
                                dashboard.obras_activas?.reduce((sum, obra) => 
                                    sum + parseFloat(obra.presupuesto_aprobado || 0), 0
                                ) || 0
                            )}
                        </span>
                        <span className={estilos.estadTendencia}>
                            <ion-icon name="wallet-outline"></ion-icon>
                            Obras activas
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${dashboard.estadisticas.alertas_activas > 0 ? estilos.danger : estilos.secondary}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${dashboard.estadisticas.alertas_activas > 0 ? estilos.danger : estilos.secondary}`}>
                            <ion-icon name="warning-outline"></ion-icon>
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Alertas Activas</span>
                        <span className={estilos.estadValor}>{dashboard.estadisticas.alertas_activas || 0}</span>
                        <span className={estilos.estadTendencia}>
                            <ion-icon name={dashboard.estadisticas.alertas_activas > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}></ion-icon>
                            {dashboard.estadisticas.alertas_activas > 0 ? 'Requieren atención' : 'Todo OK'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navegación de Vistas */}
            <div className={estilos.navVistas}>
                <button 
                    className={`${estilos.btnVista} ${vistaActiva === 'resumen' ? estilos.vistaActiva : ''}`}
                    onClick={() => setVistaActiva('resumen')}
                >
                    <ion-icon name="analytics-outline"></ion-icon>
                    <span>Resumen</span>
                </button>
                <button 
                    className={`${estilos.btnVista} ${vistaActiva === 'gantt' ? estilos.vistaActiva : ''}`}
                    onClick={() => setVistaActiva('gantt')}
                >
                    <ion-icon name="calendar-outline"></ion-icon>
                    <span>Timeline (Gantt)</span>
                </button>
                <button 
                    className={`${estilos.btnVista} ${vistaActiva === 'horarios' ? estilos.vistaActiva : ''}`}
                    onClick={() => setVistaActiva('horarios')}
                >
                    <ion-icon name="time-outline"></ion-icon>
                    <span>Horarios</span>
                </button>
            </div>

            {/* Vista: Resumen */}
            {vistaActiva === 'resumen' && (
                <>
                    {/* Alertas de Presupuesto */}
                    {dashboard.alertas_presupuesto && dashboard.alertas_presupuesto.length > 0 && (
                        <div className={`${estilos.seccionAlertas} ${estilos[tema]}`}>
                            <div className={estilos.alertasHeader}>
                                <ion-icon name="alert-circle-outline"></ion-icon>
                                <h2>Alertas de Presupuesto</h2>
                                <span className={estilos.badgeCount}>{dashboard.alertas_presupuesto.length}</span>
                            </div>
                            <div className={estilos.listaAlertas}>
                                {dashboard.alertas_presupuesto.slice(0, 3).map(alerta => {
                                    const severidad = obtenerSeveridadAlerta(alerta.porcentaje_ejecutado)
                                    return (
                                        <div key={alerta.id} className={`${estilos.alertaCard} ${estilos[`severidad_${severidad}`]}`}>
                                            <div className={estilos.alertaIcono}>
                                                <ion-icon name={severidad === 'critico' ? 'alert-circle' : 'warning'}></ion-icon>
                                            </div>
                                            <div className={estilos.alertaInfo}>
                                                <h4>{alerta.obra_nombre || 'Obra'}</h4>
                                                <p>
                                                    {alerta.tipo_alerta === 'umbral_70' ? 'Ha alcanzado el 70% del presupuesto' :
                                                     alerta.tipo_alerta === 'umbral_90' ? 'Ha alcanzado el 90% del presupuesto' :
                                                     alerta.tipo_alerta === 'excedido' ? 'Ha excedido el presupuesto' :
                                                     'Proyección de sobrecosto'}
                                                </p>
                                                <span className={estilos.porcentajeAlerta}>{alerta.porcentaje_ejecutado?.toFixed(1)}% ejecutado</span>
                                            </div>
                                            <Link 
                                                href={`/admin/presupuesto?obra=${alerta.destino_id}`}
                                                className={estilos.btnAlerta}
                                            >
                                                <ion-icon name="eye-outline"></ion-icon>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Grid Principal: Distribución y Obras */}
                    <div className={estilos.gridPrincipal}>
                        {/* Gráfica de Distribución */}
                        <div className={`${estilos.cardGrafica} ${estilos[tema]}`}>
                            <div className={estilos.cardGraficaHeader}>
                                <div>
                                    <h3 className={estilos.cardGraficaTitulo}>Distribución de Recursos</h3>
                                    <p className={estilos.cardGraficaSubtitulo}>Vista general de actividades</p>
                                </div>
                            </div>

                            <div className={estilos.graficaCircular}>
                                <svg className={estilos.donaChart} viewBox="0 0 200 200">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke={tema === 'light' ? '#f1f5f9' : '#1e293b'}
                                        strokeWidth="40"
                                    />
                                    {/* Obras - Azul */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="40"
                                        strokeDasharray={`${(porcentajes.obras * 5.024).toFixed(2)} 502.4`}
                                        strokeDashoffset="0"
                                        className={estilos.donaSegmento}
                                    />
                                    {/* Personal - Verde */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="40"
                                        strokeDasharray={`${(porcentajes.personal * 5.024).toFixed(2)} 502.4`}
                                        strokeDashoffset={`-${(porcentajes.obras * 5.024).toFixed(2)}`}
                                        className={estilos.donaSegmento}
                                    />
                                    {/* Servicios - Naranja */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="40"
                                        strokeDasharray={`${(porcentajes.servicios * 5.024).toFixed(2)} 502.4`}
                                        strokeDashoffset={`-${((parseFloat(porcentajes.obras) + parseFloat(porcentajes.personal)) * 5.024).toFixed(2)}`}
                                        className={estilos.donaSegmento}
                                    />
                                    <text x="100" y="95" textAnchor="middle" className={estilos.donaTextoValor}>
                                        {dashboard.estadisticas.obras_activas + dashboard.estadisticas.personal_campo + dashboard.estadisticas.servicios_pendientes}
                                    </text>
                                    <text x="100" y="115" textAnchor="middle" className={estilos.donaTextoLabel}>
                                        Total
                                    </text>
                                </svg>

                                <div className={estilos.leyendaCircular}>
                                    <div className={estilos.leyendaItem}>
                                        <div className={`${estilos.leyendaDot} ${estilos.obras}`}></div>
                                        <div className={estilos.leyendaInfo}>
                                            <span className={estilos.leyendaLabel}>Obras Activas</span>
                                            <span className={estilos.leyendaValor}>{dashboard.estadisticas.obras_activas || 0}</span>
                                        </div>
                                        <span className={estilos.leyendaPorcentaje}>{porcentajes.obras}%</span>
                                    </div>
                                    <div className={estilos.leyendaItem}>
                                        <div className={`${estilos.leyendaDot} ${estilos.personal}`}></div>
                                        <div className={estilos.leyendaInfo}>
                                            <span className={estilos.leyendaLabel}>Personal</span>
                                            <span className={estilos.leyendaValor}>{dashboard.estadisticas.personal_campo || 0}</span>
                                        </div>
                                        <span className={estilos.leyendaPorcentaje}>{porcentajes.personal}%</span>
                                    </div>
                                    <div className={estilos.leyendaItem}>
                                        <div className={`${estilos.leyendaDot} ${estilos.servicios}`}></div>
                                        <div className={estilos.leyendaInfo}>
                                            <span className={estilos.leyendaLabel}>Servicios</span>
                                            <span className={estilos.leyendaValor}>{dashboard.estadisticas.servicios_pendientes || 0}</span>
                                        </div>
                                        <span className={estilos.leyendaPorcentaje}>{porcentajes.servicios}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ilustración decorativa */}
                            <div className={estilos.ilustracionGrafica}>
                                <img
                                    src="/lustracion_reparaciones/Hammer_3D.svg"
                                    alt="Construcción"
                                    width={120}
                                    height={120}
                                    className={estilos.ilustracion3D}
                                />
                            </div>
                        </div>

                        {/* Obras Activas */}
                        <div className={`${estilos.cardObrasActivas} ${estilos[tema]}`}>
                            <div className={estilos.cardObrasHeader}>
                                <div>
                                    <h3 className={estilos.cardObrasTitulo}>
                                        <ion-icon name="business-outline"></ion-icon>
                                        Obras Activas
                                    </h3>
                                    <p className={estilos.cardObrasSubtitulo}>Proyectos en construcción</p>
                                </div>
                                <Link href="/admin/obras" className={estilos.verTodosLink}>
                                    Ver todas
                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                </Link>
                            </div>

                            {!dashboard.obras_activas || dashboard.obras_activas.length === 0 ? (
                                <div className={estilos.obrasVacio}>
                                    <img
                                        src="/illustrations3D/_0001.svg"
                                        alt="Sin obras"
                                        width={200}
                                        height={200}
                                        className={estilos.ilustracionVacio}
                                    />
                                    <h4>No hay obras activas</h4>
                                    <p>Crea tu primera obra para comenzar</p>
                                    <Link href="/admin/obras/nuevo" className={estilos.btnNuevoVacio}>
                                        <ion-icon name="add-outline"></ion-icon>
                                        <span>Nueva Obra</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className={estilos.listaObras}>
                                    {dashboard.obras_activas.slice(0, 4).map(obra => {
                                        const porcentajeEjecutado = calcularPorcentajeEjecutado(
                                            obra.costo_ejecutado || 0,
                                            obra.presupuesto_aprobado || 0
                                        )
                                        const diasRestantes = obra.fecha_fin_estimada 
                                            ? calcularDiasRestantes(obra.fecha_fin_estimada)
                                            : null
                                        
                                        return (
                                            <Link 
                                                key={obra.id} 
                                                href={`/admin/obras/ver/${obra.id}`}
                                                className={estilos.tarjetaObra}
                                            >
                                                <div className={estilos.obraHeader}>
                                                    <div className={estilos.obraTitulo}>
                                                        <span className={estilos.codigoObra}>{obra.codigo_obra}</span>
                                                        <h4>{obra.nombre}</h4>
                                                        <p className={estilos.ubicacion}>
                                                            <ion-icon name="location-outline"></ion-icon>
                                                            <span>{obra.ubicacion}</span>
                                                        </p>
                                                    </div>
                                                    {porcentajeEjecutado > 0 && (
                                                        <div className={`${estilos.badgeProgreso} ${
                                                            porcentajeEjecutado >= 90 ? estilos.critico :
                                                            porcentajeEjecutado >= 70 ? estilos.atencion :
                                                            estilos.normal
                                                        }`}>
                                                            {porcentajeEjecutado.toFixed(0)}%
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={estilos.obraBody}>
                                                    <div className={estilos.infoObra}>
                                                        <div className={estilos.infoItem}>
                                                            <ion-icon name="cash-outline"></ion-icon>
                                                            <div>
                                                                <span>Presupuesto</span>
                                                                <strong>{formatearMoneda(obra.presupuesto_aprobado)}</strong>
                                                            </div>
                                                        </div>
                                                        {obra.costo_ejecutado > 0 && (
                                                            <div className={estilos.infoItem}>
                                                                <ion-icon name="trending-up-outline"></ion-icon>
                                                                <div>
                                                                    <span>Ejecutado</span>
                                                                    <strong>{formatearMoneda(obra.costo_ejecutado)}</strong>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {porcentajeEjecutado > 0 && (
                                                        <div className={estilos.progresoObra}>
                                                            <div className={estilos.barraProgreso}>
                                                                <div 
                                                                    className={`${estilos.progresoFill} ${
                                                                        porcentajeEjecutado >= 90 ? estilos.critico :
                                                                        porcentajeEjecutado >= 70 ? estilos.atencion :
                                                                        estilos.normal
                                                                    }`}
                                                                    style={{ width: `${Math.min(porcentajeEjecutado, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {diasRestantes !== null && (
                                                    <div className={estilos.obraFooter}>
                                                        <ion-icon name="calendar-outline"></ion-icon>
                                                        <span className={diasRestantes < 0 ? estilos.diasVencidos : ''}>
                                                            {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencida'}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de Personal y Servicios */}
                    <div className={estilos.gridSecundario}>
                        {/* Personal en Campo */}
                        <div className={`${estilos.cardPersonal} ${estilos[tema]}`}>
                            <div className={estilos.cardPersonalHeader}>
                                <h3>
                                    <ion-icon name="people-outline"></ion-icon>
                                    Personal en Campo
                                </h3>
                                <Link href="/admin/personal" className={estilos.verTodosLink}>
                                    Ver todos
                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                </Link>
                            </div>

                            {!dashboard.personal_campo || dashboard.personal_campo.length === 0 ? (
                                <div className={estilos.personalVacio}>
                                    <img
                                        src="/illustrations3D/_0008.svg"
                                        alt="Sin personal"
                                        width={150}
                                        height={150}
                                        className={estilos.ilustracionVacio}
                                    />
                                    <p>No hay personal activo hoy</p>
                                </div>
                            ) : (
                                <div className={estilos.listaPersonal}>
                                    {dashboard.personal_campo.slice(0, 5).map(persona => (
                                        <div key={persona.id} className={estilos.itemPersonal}>
                                            <div className={estilos.avatarPersonal}>
                                                {persona.nombre?.charAt(0)}{persona.apellidos?.charAt(0)}
                                            </div>
                                            <div className={estilos.personalInfo}>
                                                <h5>{persona.nombre} {persona.apellidos}</h5>
                                                <p className={estilos.rolPersonal}>
                                                    <ion-icon name="construct-outline"></ion-icon>
                                                    {persona.rol}
                                                </p>
                                                <p className={estilos.asignacion}>
                                                    <ion-icon name="location-outline"></ion-icon>
                                                    {persona.obra_nombre || persona.servicio_nombre}
                                                </p>
                                            </div>
                                            <div className={estilos.estadoPersonal}>
                                                <div className={estilos.indicadorActivo}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Servicios del Día */}
                        <div className={`${estilos.cardServicios} ${estilos[tema]}`}>
                            <div className={estilos.cardServiciosHeader}>
                                <h3>
                                    <ion-icon name="flash-outline"></ion-icon>
                                    Servicios del Día
                                </h3>
                                <Link href="/admin/servicios" className={estilos.verTodosLink}>
                                    Ver todos
                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                </Link>
                            </div>

                            {!dashboard.servicios_hoy || dashboard.servicios_hoy.length === 0 ? (
                                <div className={estilos.serviciosVacio}>
                                    <img
                                        src="/lustracion_reparaciones/Electric drill_3D.svg"
                                        alt="Sin servicios"
                                        width={120}
                                        height={120}
                                        className={estilos.ilustracionVacio}
                                    />
                                    <p>No hay servicios programados hoy</p>
                                </div>
                            ) : (
                                <div className={estilos.listaServicios}>
                                    {dashboard.servicios_hoy.slice(0, 4).map(servicio => {
                                        const prioridadFormateada = formatearPrioridad(servicio.prioridad)
                                        return (
                                            <Link
                                                key={servicio.id}
                                                href={`/admin/servicios/ver/${servicio.id}`}
                                                className={estilos.itemServicio}
                                            >
                                                <div className={estilos.servicioIcono}>
                                                    <ion-icon name="flash-outline"></ion-icon>
                                                </div>
                                                <div className={estilos.servicioInfo}>
                                                    <h5>{servicio.nombre}</h5>
                                                    <p>
                                                        <ion-icon name="person-outline"></ion-icon>
                                                        {servicio.cliente_nombre || 'Sin cliente'}
                                                    </p>
                                                </div>
                                                <div className={`${estilos.prioridadBadge} ${estilos[`prioridad_${prioridadFormateada.color}`]}`}>
                                                    {prioridadFormateada.texto}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Vista: Gantt */}
            {vistaActiva === 'gantt' && (
                <div className={`${estilos.seccionGantt} ${estilos[tema]}`}>
                    <div className={estilos.ganttHeader}>
                        <div>
                            <h2>
                                <ion-icon name="calendar-outline"></ion-icon>
                                Timeline de Proyectos (Diagrama de Gantt)
                            </h2>
                            <p>Visualización temporal de obras en ejecución</p>
                        </div>
                        <div className={estilos.ilustracionGantt}>
                            <img
                                src="/lustracion_reparaciones/Meter_3D.svg"
                                alt="Timeline"
                                width={80}
                                height={80}
                                className={estilos.ilustracion3D}
                            />
                        </div>
                    </div>

                    {ganttData.length === 0 ? (
                        <div className={estilos.ganttVacio}>
                            <img
                                src="/illustrations3D/_0015.svg"
                                alt="Sin proyectos"
                                width={250}
                                height={250}
                                className={estilos.ilustracionVacio}
                            />
                            <h3>No hay proyectos programados</h3>
                            <p>Crea una obra para visualizar su timeline</p>
                        </div>
                    ) : (
                        <div className={estilos.ganttContainer}>
                            <div className={estilos.ganttTimeline}>
                                {ganttData.map(proyecto => (
                                    <div key={proyecto.id} className={estilos.ganttRow}>
                                        <div className={estilos.ganttInfo}>
                                            <span className={estilos.ganttCodigo}>{proyecto.codigo}</span>
                                            <h4 className={estilos.ganttNombre}>{proyecto.nombre}</h4>
                                            <div className={estilos.ganttFechas}>
                                                <span>
                                                    <ion-icon name="play-outline"></ion-icon>
                                                    {proyecto.inicio}
                                                </span>
                                                <span>
                                                    <ion-icon name="flag-outline"></ion-icon>
                                                    {proyecto.fin}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={estilos.ganttBarra}>
                                            <div className={estilos.ganttBarraContainer}>
                                                <div 
                                                    className={`${estilos.ganttBarraFill} ${estilos[proyecto.estado]}`}
                                                    style={{ width: `${proyecto.progreso}%` }}
                                                >
                                                    <span className={estilos.ganttProgreso}>{proyecto.progreso}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vista: Horarios */}
            {vistaActiva === 'horarios' && (
                <div className={`${estilos.seccionHorarios} ${estilos[tema]}`}>
                    <div className={estilos.horariosHeader}>
                        <div>
                            <h2>
                                <ion-icon name="time-outline"></ion-icon>
                                Horarios y Asignaciones
                            </h2>
                            <p>Programación semanal del personal</p>
                        </div>
                        <div className={estilos.ilustracionHorarios}>
                            <img
                                src="/lustracion_reparaciones/Spirit Level_3D.svg"
                                alt="Horarios"
                                width={80}
                                height={80}
                                className={estilos.ilustracion3D}
                            />
                        </div>
                    </div>

                    {!dashboard.personal_campo || dashboard.personal_campo.length === 0 ? (
                        <div className={estilos.horariosVacio}>
                            <img
                                src="/illustrations3D/_0011.svg"
                                alt="Sin horarios"
                                width={250}
                                height={250}
                                className={estilos.ilustracionVacio}
                            />
                            <h3>No hay personal asignado</h3>
                            <p>Asigna personal a obras o servicios para visualizar horarios</p>
                            <Link href="/admin/personal/asignar" className={estilos.btnNuevoVacio}>
                                <ion-icon name="add-outline"></ion-icon>
                                <span>Asignar Personal</span>
                            </Link>
                        </div>
                    ) : (
                        <div className={estilos.gridHorarios}>
                            {dashboard.personal_campo.map(persona => (
                                <div key={persona.id} className={estilos.cardHorario}>
                                    <div className={estilos.horarioHeader}>
                                        <div className={estilos.avatarHorario}>
                                            {persona.nombre?.charAt(0)}{persona.apellidos?.charAt(0)}
                                        </div>
                                        <div className={estilos.horarioInfo}>
                                            <h4>{persona.nombre} {persona.apellidos}</h4>
                                            <p>{persona.rol}</p>
                                        </div>
                                    </div>
                                    <div className={estilos.horarioBody}>
                                        <div className={estilos.horarioItem}>
                                            <ion-icon name="business-outline"></ion-icon>
                                            <div>
                                                <span>Asignado a:</span>
                                                <strong>{persona.obra_nombre || persona.servicio_nombre}</strong>
                                            </div>
                                        </div>
                                        <div className={estilos.horarioItem}>
                                            <ion-icon name="time-outline"></ion-icon>
                                            <div>
                                                <span>Horario:</span>
                                                <strong>8:00 AM - 5:00 PM</strong>
                                            </div>
                                        </div>
                                        <div className={estilos.horarioItem}>
                                            <ion-icon name="calendar-outline"></ion-icon>
                                            <div>
                                                <span>Fecha:</span>
                                                <strong>Hoy</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={estilos.horarioEstado}>
                                        <div className={estilos.estadoActivo}>
                                            <div className={estilos.pulsoActivo}></div>
                                            <span>Activo</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
