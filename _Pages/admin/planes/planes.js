"use client"
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
    CreditCard, 
    TrendingUp, 
    Calendar, 
    DollarSign, 
    AlertCircle, 
    Clock, 
    Plus, 
    Search, 
    Eye, 
    Edit, 
    FileText,
    Sparkles,
    Loader2
} from 'lucide-react'
import { obtenerPlanesFinanciamiento } from './servidor'
import estilos from './planes.module.css'

export default function PlanesFinanciamiento() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [planes, setPlanes] = useState([])
    const [filtroActivo, setFiltroActivo] = useState('')
    const [buscar, setBuscar] = useState('')

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

    const cargarPlanes = useCallback(async () => {
        setCargando(true)
        try {
            const resultado = await obtenerPlanesFinanciamiento({
                activo: filtroActivo === 'activo' ? true : filtroActivo === 'inactivo' ? false : undefined,
                buscar: buscar || undefined
            })

            if (resultado.success) {
                setPlanes(resultado.planes)
            } else {
                alert(resultado.mensaje || 'Error al cargar planes')
            }
        } catch (error) {
            console.error('Error al cargar planes:', error)
            alert('Error al cargar planes')
        } finally {
            setCargando(false)
        }
    }, [filtroActivo, buscar])

    useEffect(() => {
        cargarPlanes()
    }, [cargarPlanes])

    const navegarANuevo = () => {
        router.push('/admin/planes/nuevo')
    }

    const navegarAEditar = (planId) => {
        router.push(`/admin/planes/editar/${planId}`)
    }

    const navegarAVer = (planId) => {
        router.push(`/admin/planes/ver/${planId}`)
    }
    const planesFiltrados = planes.filter(plan => {
        if (filtroActivo === 'activo' && plan.activo !== 1) return false
        if (filtroActivo === 'inactivo' && plan.activo !== 0) return false
        if (buscar && !plan.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
            !plan.codigo.toLowerCase().includes(buscar.toLowerCase())) return false
        return true
    })

    // Calcular estadísticas
    const estadisticas = {
        total: planes.length,
        activos: planes.filter(p => p.activo === 1).length,
        inactivos: planes.filter(p => p.activo === 0).length,
        tasaPromedio: planes.length > 0 
            ? (planes.reduce((sum, p) => sum + parseFloat(p.tasa_interes_anual || 0), 0) / planes.length).toFixed(2)
            : 0
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <Loader2 className={estilos.iconoCargando} />
                    <span>Cargando planes...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <div className={estilos.header}>
                <div className={estilos.headerTitulo}>
                    <div className={estilos.tituloWrapper}>
                        <CreditCard className={estilos.tituloIcono} />
                        <div>
                            <h1 className={estilos.titulo}>Planes de Financiamiento</h1>
                            <p className={estilos.subtitulo}>Gestiona los planes disponibles para financiamiento</p>
                        </div>
                    </div>
                </div>
                <button className={estilos.btnPrimario} onClick={navegarANuevo}>
                    <Plus className={estilos.btnIcono} />
                    <span>Nuevo Plan</span>
                </button>
            </div>

            {/* Estadísticas */}
            <div className={estilos.estadisticas}>
                <div className={`${estilos.estadCard} ${estilos.primary}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.primary}`}>
                            <FileText className={estilos.estadIconoSvg} />
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Total Planes</span>
                        <span className={estilos.estadValor}>{estadisticas.total}</span>
                        <span className={estilos.estadTendencia}>
                            <TrendingUp className={estilos.tendenciaIcono} />
                            Planes disponibles
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${estilos.success}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.success}`}>
                            <Sparkles className={estilos.estadIconoSvg} />
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Planes Activos</span>
                        <span className={estilos.estadValor}>{estadisticas.activos}</span>
                        <span className={estilos.estadTendencia}>
                            <TrendingUp className={estilos.tendenciaIcono} />
                            En uso
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${estilos.info}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.info}`}>
                            <TrendingUp className={estilos.estadIconoSvg} />
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Tasa Promedio</span>
                        <span className={estilos.estadValor}>{estadisticas.tasaPromedio}%</span>
                        <span className={estilos.estadTendencia}>
                            <DollarSign className={estilos.tendenciaIcono} />
                            Interés anual
                        </span>
                    </div>
                </div>

                <div className={`${estilos.estadCard} ${estilos.warning}`}>
                    <div className={estilos.estadIconoWrapper}>
                        <div className={`${estilos.estadIcono} ${estilos.warning}`}>
                            <AlertCircle className={estilos.estadIconoSvg} />
                        </div>
                    </div>
                    <div className={estilos.estadInfo}>
                        <span className={estilos.estadLabel}>Inactivos</span>
                        <span className={estilos.estadValor}>{estadisticas.inactivos}</span>
                        <span className={estilos.estadTendencia}>
                            <Clock className={estilos.tendenciaIcono} />
                            Deshabilitados
                        </span>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className={estilos.filtros}>
                <div className={estilos.buscarWrapper}>
                    <Search className={estilos.buscarIcono} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className={estilos.inputBuscar}
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                    />
                </div>
                <select
                    className={estilos.selectFiltro}
                    value={filtroActivo}
                    onChange={(e) => setFiltroActivo(e.target.value)}
                >
                    <option value="">Todos los planes</option>
                    <option value="activo">Solo activos</option>
                    <option value="inactivo">Solo inactivos</option>
                </select>
            </div>

            {/* Lista de planes */}
            <div className={estilos.listaPlanes}>
                {planesFiltrados.length === 0 ? (
                    <div className={estilos.sinDatos}>
                        <FileText className={estilos.sinDatosIcono} />
                        <p>No hay planes para mostrar</p>
                        <button className={estilos.btnPrimario} onClick={navegarANuevo}>
                            <Plus className={estilos.btnIcono} />
                            <span>Crear primer plan</span>
                        </button>
                    </div>
                ) : (
                    planesFiltrados.map(plan => (
                        <div key={plan.id} className={`${estilos.planCard} ${plan.activo === 0 ? estilos.inactivo : ''}`}>
                            <div className={estilos.planCardHeader}>
                                <div className={estilos.planHeader}>
                                    <div className={estilos.planHeaderInfo}>
                                        <div className={estilos.planIconoWrapper}>
                                            <CreditCard className={estilos.planIcono} />
                                        </div>
                                        <div>
                                            <h3 className={estilos.planNombre}>{plan.nombre}</h3>
                                            <span className={estilos.planCodigo}>{plan.codigo}</span>
                                        </div>
                                    </div>
                                    <div className={estilos.planBadges}>
                                        {plan.activo === 1 ? (
                                            <span className={`${estilos.badge} ${estilos.success}`}>
                                                <Sparkles className={estilos.badgeIcono} />
                                                Activo
                                            </span>
                                        ) : (
                                            <span className={`${estilos.badge} ${estilos.secondary}`}>
                                                <Clock className={estilos.badgeIcono} />
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {plan.descripcion && (
                                    <p className={estilos.planDescripcion}>{plan.descripcion}</p>
                                )}
                            </div>

                            <div className={estilos.planDetalles}>
                                <div className={estilos.detalleItem}>
                                    <div className={estilos.detalleIconoWrapper}>
                                        <Calendar className={estilos.detalleIcono} />
                                    </div>
                                    <div className={estilos.detalleContent}>
                                        <span className={estilos.detalleLabel}>Plazo</span>
                                        <span className={estilos.detalleValor}>{plan.plazo_meses} meses</span>
                                    </div>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <div className={estilos.detalleIconoWrapper}>
                                        <TrendingUp className={estilos.detalleIcono} />
                                    </div>
                                    <div className={estilos.detalleContent}>
                                        <span className={estilos.detalleLabel}>Tasa Anual</span>
                                        <span className={estilos.detalleValor}>{plan.tasa_interes_anual}%</span>
                                    </div>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <div className={estilos.detalleIconoWrapper}>
                                        <DollarSign className={estilos.detalleIcono} />
                                    </div>
                                    <div className={estilos.detalleContent}>
                                        <span className={estilos.detalleLabel}>Inicial Mínimo</span>
                                        <span className={estilos.detalleValor}>{plan.pago_inicial_minimo_pct}%</span>
                                    </div>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <div className={estilos.detalleIconoWrapper}>
                                        <AlertCircle className={estilos.detalleIcono} />
                                    </div>
                                    <div className={estilos.detalleContent}>
                                        <span className={estilos.detalleLabel}>Mora</span>
                                        <span className={estilos.detalleValor}>{plan.penalidad_mora_pct}%</span>
                                    </div>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <div className={estilos.detalleIconoWrapper}>
                                        <Clock className={estilos.detalleIcono} />
                                    </div>
                                    <div className={estilos.detalleContent}>
                                        <span className={estilos.detalleLabel}>Días Gracia</span>
                                        <span className={estilos.detalleValor}>{plan.dias_gracia}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={estilos.planAcciones}>
                                <button
                                    className={estilos.btnVer}
                                    onClick={() => navegarAVer(plan.id)}
                                >
                                    <Eye className={estilos.btnAccionIcono} />
                                    <span>Ver</span>
                                </button>
                                <button
                                    className={estilos.btnEditar}
                                    onClick={() => navegarAEditar(plan.id)}
                                >
                                    <Edit className={estilos.btnAccionIcono} />
                                    <span>Editar</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

