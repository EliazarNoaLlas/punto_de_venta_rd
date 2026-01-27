"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { obtenerServicios } from './servidor'
import { formatearEstadoServicio, formatearTipoServicio, formatearPrioridad } from '../core/construction/estados'
import estilos from './servicios.module.css'

export default function ServiciosAdmin() {
    const router = useRouter()
    const [servicios, setServicios] = useState([])
    const [serviciosFiltrados, setServiciosFiltrados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [tema, setTema] = useState('light')
    const [vista, setVista] = useState('grid') // grid, lista
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: 'todos',
        tipo_servicio: '',
        prioridad: ''
    })
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        pendientes: 0,
        en_ejecucion: 0,
        finalizados: 0,
        costo_total: 0
    })

    useEffect(() => {
        const t = localStorage.getItem('tema') || 'light'
        setTema(t)
        cargarServicios()
    }, [])

    useEffect(() => {
        filtrarServicios()
    }, [servicios, filtros])

    async function cargarServicios() {
        setCargando(true)
        const res = await obtenerServicios({})
        if (res.success) {
            setServicios(res.servicios)
            calcularEstadisticas(res.servicios)
        }
        setCargando(false)
    }

    function calcularEstadisticas(data) {
        const stats = {
            total: data.length,
            pendientes: data.filter(s => s.estado === 'pendiente').length,
            en_ejecucion: data.filter(s => s.estado === 'en_ejecucion').length,
            finalizados: data.filter(s => s.estado === 'finalizado').length,
            costo_total: data.reduce((sum, s) => sum + parseFloat(s.costo_estimado || 0), 0)
        }
        setEstadisticas(stats)
    }

    function filtrarServicios() {
        let filtrados = servicios

        // Filtro por estado
        if (filtros.estado !== 'todos') {
            filtrados = filtrados.filter(s => s.estado === filtros.estado)
        }

        // Filtro por tipo de servicio
        if (filtros.tipo_servicio) {
            filtrados = filtrados.filter(s => s.tipo_servicio === filtros.tipo_servicio)
        }

        // Filtro por prioridad
        if (filtros.prioridad) {
            filtrados = filtrados.filter(s => s.prioridad === filtros.prioridad)
        }

        // Filtro por búsqueda
        if (filtros.busqueda) {
            const busquedaLower = filtros.busqueda.toLowerCase()
            filtrados = filtrados.filter(s =>
                s.nombre?.toLowerCase().includes(busquedaLower) ||
                s.codigo_servicio?.toLowerCase().includes(busquedaLower) ||
                s.ubicacion?.toLowerCase().includes(busquedaLower) ||
                s.cliente_nombre?.toLowerCase().includes(busquedaLower)
            )
        }

        setServiciosFiltrados(filtrados)
    }

    const getIconoTipoServicio = (tipo) => {
        const iconos = {
            'reparacion': '🔧',
            'mantenimiento': '🛠️',
            'instalacion': '⚡',
            'inspeccion': '🔍',
            'limpieza': '🧹',
            'pintura': '🎨',
            'electricidad': '💡',
            'plomeria': '🚰',
            'carpinteria': '🪚',
            'albanileria': '🧱'
        }
        return iconos[tipo] || '🔧'
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <h1 className={estilos.titulo}>
                        <ion-icon name="construct-outline"></ion-icon>
                        Servicios
                    </h1>
                    <p className={estilos.subtitulo}>Gestión de servicios e intervenciones puntuales</p>
                </div>
                <div className={estilos.headerButtons}>
                    <button className={estilos.btnNuevo} onClick={() => router.push('/admin/servicios/nuevo')}>
                        <ion-icon name="add-outline"></ion-icon>
                        <span>Nuevo Servicio</span>
                    </button>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className={estilos.estadisticas}>
                <div className={`${estilos.statCard} ${estilos.statTotal}`}>
                    <div className={estilos.statIcono}>
                        <ion-icon name="briefcase-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Total Servicios</p>
                        <h3 className={estilos.statValor}>{estadisticas.total}</h3>
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.statPendiente}`}>
                    <div className={estilos.statIcono}>
                        <ion-icon name="time-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Pendientes</p>
                        <h3 className={estilos.statValor}>{estadisticas.pendientes}</h3>
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.statEjecucion}`}>
                    <div className={estilos.statIcono}>
                        <ion-icon name="play-circle-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>En Ejecución</p>
                        <h3 className={estilos.statValor}>{estadisticas.en_ejecucion}</h3>
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.statFinalizado}`}>
                    <div className={estilos.statIcono}>
                        <ion-icon name="checkmark-done-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Finalizados</p>
                        <h3 className={estilos.statValor}>{estadisticas.finalizados}</h3>
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.statCosto}`}>
                    <div className={estilos.statIcono}>
                        <ion-icon name="cash-outline"></ion-icon>
                    </div>
                    <div className={estilos.statInfo}>
                        <p className={estilos.statLabel}>Costo Total Estimado</p>
                        <h3 className={estilos.statValor}>RD$ {estadisticas.costo_total.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Controles de Búsqueda y Filtros */}
            <div className={estilos.controles}>
                <div className={estilos.barraHerramientas}>
                    <div className={estilos.busqueda}>
                        <ion-icon name="search-outline"></ion-icon>
                        <input
                            type="text"
                            className={estilos.inputBusqueda}
                            placeholder="Buscar por nombre, código, ubicación o cliente..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                        />
                    </div>
                    <div className={estilos.filtrosContainer}>
                        <div className={estilos.vistaToggle}>
                            <button
                                className={`${estilos.btnVista} ${vista === 'grid' ? estilos.vistaActiva : ''}`}
                                onClick={() => setVista('grid')}
                                title="Vista en cuadrícula"
                            >
                                <ion-icon name="grid-outline"></ion-icon>
                            </button>
                            <button
                                className={`${estilos.btnVista} ${vista === 'lista' ? estilos.vistaActiva : ''}`}
                                onClick={() => setVista('lista')}
                                title="Vista en lista"
                            >
                                <ion-icon name="list-outline"></ion-icon>
                            </button>
                        </div>
                        <button className={estilos.btnFiltro}>
                            <ion-icon name="download-outline"></ion-icon>
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>

                {/* Chips de Filtro por Estado */}
                <div className={estilos.chips}>
                    <button
                        className={`${estilos.chip} ${filtros.estado === 'todos' ? estilos.chipActivo : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, estado: 'todos' }))}
                    >
                        <ion-icon name="apps-outline"></ion-icon>
                        <span>Todos</span>
                        <span className={estilos.chipBadge}>{estadisticas.total}</span>
                    </button>
                    <button
                        className={`${estilos.chip} ${estilos.chipWarning} ${filtros.estado === 'pendiente' ? estilos.chipActivo : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, estado: 'pendiente' }))}
                    >
                        <ion-icon name="time-outline"></ion-icon>
                        <span>Pendientes</span>
                        <span className={estilos.chipBadge}>{estadisticas.pendientes}</span>
                    </button>
                    <button
                        className={`${estilos.chip} ${estilos.chipInfo} ${filtros.estado === 'programado' ? estilos.chipActivo : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, estado: 'programado' }))}
                    >
                        <ion-icon name="calendar-outline"></ion-icon>
                        <span>Programados</span>
                    </button>
                    <button
                        className={`${estilos.chip} ${estilos.chipSuccess} ${filtros.estado === 'en_ejecucion' ? estilos.chipActivo : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, estado: 'en_ejecucion' }))}
                    >
                        <ion-icon name="play-circle-outline"></ion-icon>
                        <span>En Ejecución</span>
                        <span className={estilos.chipBadge}>{estadisticas.en_ejecucion}</span>
                    </button>
                    <button
                        className={`${estilos.chip} ${filtros.estado === 'finalizado' ? estilos.chipActivo : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, estado: 'finalizado' }))}
                    >
                        <ion-icon name="checkmark-done-outline"></ion-icon>
                        <span>Finalizados</span>
                        <span className={estilos.chipBadge}>{estadisticas.finalizados}</span>
                    </button>
                    <button
                        className={`${estilos.chip} ${estilos.chipDanger} ${filtros.estado === 'cancelado' ? estilos.chipActivo : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, estado: 'cancelado' }))}
                    >
                        <ion-icon name="close-circle-outline"></ion-icon>
                        <span>Cancelados</span>
                    </button>
                </div>

                {/* Filtros Adicionales */}
                <div className={estilos.filtrosExtra}>
                    <select
                        className={estilos.selectFiltro}
                        value={filtros.tipo_servicio}
                        onChange={(e) => setFiltros(prev => ({ ...prev, tipo_servicio: e.target.value }))}
                    >
                        <option value="">Todos los tipos</option>
                        <option value="reparacion">Reparación</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="instalacion">Instalación</option>
                        <option value="inspeccion">Inspección</option>
                        <option value="limpieza">Limpieza</option>
                        <option value="pintura">Pintura</option>
                        <option value="electricidad">Electricidad</option>
                        <option value="plomeria">Plomería</option>
                    </select>

                    <select
                        className={estilos.selectFiltro}
                        value={filtros.prioridad}
                        onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
                    >
                        <option value="">Todas las prioridades</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                    </select>

                    {(filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo_servicio || filtros.prioridad) && (
                        <button
                            className={estilos.btnLimpiarFiltros}
                            onClick={() => setFiltros({ busqueda: '', estado: 'todos', tipo_servicio: '', prioridad: '' })}
                        >
                            <ion-icon name="close-circle-outline"></ion-icon>
                            <span>Limpiar Filtros</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de Servicios */}
            {cargando ? (
                <div className={estilos.cargando}>
                    <ion-icon name="refresh-outline" className={estilos.iconoCargando}></ion-icon>
                    <h3>Cargando servicios...</h3>
                    <p>Obteniendo información actualizada</p>
                </div>
            ) : serviciosFiltrados.length === 0 ? (
                <div className={estilos.vacio}>
                    <Image
                        src="/ilustracion_servicios/диагностика.svg"
                        alt="Sin servicios"
                        width={300}
                        height={300}
                        className={estilos.ilustracionVacio}
                    />
                    <h3>No se encontraron servicios</h3>
                    <p>
                        {filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo_servicio || filtros.prioridad
                            ? 'No hay servicios que coincidan con los filtros seleccionados'
                            : 'No hay servicios registrados. Crea tu primer servicio para comenzar.'}
                    </p>
                    {!filtros.busqueda && filtros.estado === 'todos' && !filtros.tipo_servicio && (
                        <button className={estilos.btnNuevo} onClick={() => router.push('/admin/servicios/nuevo')}>
                            <ion-icon name="add-outline"></ion-icon>
                            <span>Crear Nuevo Servicio</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className={vista === 'grid' ? estilos.grid : estilos.lista}>
                    {serviciosFiltrados.map(servicio => {
                        const estadoFormateado = formatearEstadoServicio(servicio.estado)
                        const prioridadFormateada = formatearPrioridad(servicio.prioridad)
                        const tipoFormateado = formatearTipoServicio(servicio.tipo_servicio)

                        const getIconoEstado = () => {
                            const iconos = {
                                pendiente: 'time-outline',
                                programado: 'calendar-outline',
                                en_ejecucion: 'play-circle-outline',
                                finalizado: 'checkmark-done-outline',
                                cancelado: 'close-circle-outline'
                            }
                            return iconos[servicio.estado] || 'ellipse-outline'
                        }

                        return (
                            <div key={servicio.id} className={estilos.tarjeta}>
                                {/* Header de la tarjeta */}
                                <div className={estilos.tarjetaHeader}>
                                    <div className={estilos.tarjetaTitulo}>
                                        <div className={estilos.emojiServicio}>
                                            {getIconoTipoServicio(servicio.tipo_servicio)}
                                        </div>
                                        <div>
                                            {servicio.codigo_servicio && (
                                                <span className={estilos.codigoServicio}>{servicio.codigo_servicio}</span>
                                            )}
                                            <h3>{servicio.nombre}</h3>
                                        </div>
                                    </div>
                                    <div className={estilos.badges}>
                                        <div className={`${estilos.estado} ${estilos[estadoFormateado.color]}`}>
                                            <ion-icon name={getIconoEstado()}></ion-icon>
                                            <span>{estadoFormateado.texto}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body de la tarjeta */}
                                <div className={estilos.tarjetaBody}>
                                    <div className={estilos.info}>
                                        <div className={estilos.itemInfo}>
                                            <ion-icon name="construct-outline"></ion-icon>
                                            <span>{tipoFormateado}</span>
                                        </div>
                                        {servicio.ubicacion && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="location-outline"></ion-icon>
                                                <span>{servicio.ubicacion}</span>
                                            </div>
                                        )}
                                        {servicio.cliente_nombre && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="person-outline"></ion-icon>
                                                <span>{servicio.cliente_nombre}</span>
                                            </div>
                                        )}
                                        {servicio.obra_nombre && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="business-outline"></ion-icon>
                                                <span>{servicio.codigo_obra ? `${servicio.codigo_obra} - ` : ''}{servicio.obra_nombre}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sección de Prioridad y Fecha */}
                                    <div className={estilos.metaInfo}>
                                        <div className={`${estilos.prioridad} ${estilos[`prioridad_${prioridadFormateada.color}`]}`}>
                                            <ion-icon name="flag-outline"></ion-icon>
                                            <span>{prioridadFormateada.texto}</span>
                                        </div>
                                        {servicio.fecha_programada && (
                                            <div className={estilos.fechaInfo}>
                                                <ion-icon name="calendar-outline"></ion-icon>
                                                <span>{new Date(servicio.fecha_programada).toLocaleDateString('es-DO', { 
                                                    day: 'numeric', 
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Descripción corta si existe */}
                                    {servicio.descripcion && (
                                        <p className={estilos.descripcion}>
                                            {servicio.descripcion.length > 100 
                                                ? `${servicio.descripcion.substring(0, 100)}...` 
                                                : servicio.descripcion}
                                        </p>
                                    )}
                                </div>

                                {/* Footer de la tarjeta */}
                                <div className={estilos.tarjetaFooter}>
                                    {servicio.costo_estimado > 0 && (
                                        <div className={estilos.costoInfo}>
                                            <ion-icon name="cash-outline"></ion-icon>
                                            <span>RD$ {parseFloat(servicio.costo_estimado).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <button
                                        className={estilos.btnVer}
                                        onClick={() => router.push(`/admin/servicios/ver/${servicio.id}`)}
                                    >
                                        <ion-icon name="eye-outline"></ion-icon>
                                        <span>Ver Detalle</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

