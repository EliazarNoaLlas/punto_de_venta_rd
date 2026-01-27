"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerServicios } from './servidor'
import { formatearEstadoServicio, formatearTipoServicio, formatearPrioridad } from '../core/construction/estados'
import estilos from './servicios.module.css'

export default function ServiciosAdmin() {
    const router = useRouter()
    const [servicios, setServicios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: '',
        tipo_servicio: '',
        prioridad: ''
    })

    useEffect(() => {
        cargarServicios()
    }, [filtros])

    async function cargarServicios() {
        setCargando(true)
        const res = await obtenerServicios(filtros)
        if (res.success) {
            setServicios(res.servicios)
        }
        setCargando(false)
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Servicios</h1>
                    <p className={estilos.subtitulo}>Gestión de servicios e intervenciones puntuales</p>
                </div>
                <button 
                    className={estilos.btnNuevo} 
                    onClick={() => router.push('/admin/servicios/nuevo')}
                >
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Nuevo Servicio</span>
                </button>
            </div>

            {/* Filtros */}
            <div className={estilos.filtros}>
                <div className={estilos.busqueda}>
                    <ion-icon name="search-outline"></ion-icon>
                    <input
                        type="text"
                        placeholder="Buscar servicios..."
                        value={filtros.busqueda}
                        onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                    />
                </div>
                <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="programado">Programado</option>
                    <option value="en_ejecucion">En Ejecución</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <select
                    value={filtros.prioridad}
                    onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
                >
                    <option value="">Todas las prioridades</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                </select>
            </div>

            {/* Lista */}
            {cargando ? (
                <div className={estilos.cargando}>Cargando servicios...</div>
            ) : servicios.length === 0 ? (
                <div className={estilos.vacio}>No se encontraron servicios</div>
            ) : (
                <div className={estilos.lista}>
                    {servicios.map(servicio => {
                        const estadoFormateado = formatearEstadoServicio(servicio.estado)
                        const prioridadFormateada = formatearPrioridad(servicio.prioridad)
                        return (
                            <div key={servicio.id} className={estilos.tarjeta}>
                                <div className={estilos.tarjetaHeader}>
                                    <div>
                                        <h3>{servicio.nombre}</h3>
                                        {servicio.codigo_servicio && (
                                            <span className={estilos.codigo}>{servicio.codigo_servicio}</span>
                                        )}
                                    </div>
                                    <div className={estilos.badges}>
                                        <span className={`${estilos.estado} ${estilos[estadoFormateado.color]}`}>
                                            {estadoFormateado.texto}
                                        </span>
                                        <span className={`${estilos.prioridad} ${estilos[`prioridad_${prioridadFormateada.color}`]}`}>
                                            {prioridadFormateada.texto}
                                        </span>
                                    </div>
                                </div>
                                <div className={estilos.tarjetaBody}>
                                    <div className={estilos.info}>
                                        <div className={estilos.itemInfo}>
                                            <ion-icon name="construct-outline"></ion-icon>
                                            <span>{formatearTipoServicio(servicio.tipo_servicio)}</span>
                                        </div>
                                        <div className={estilos.itemInfo}>
                                            <ion-icon name="location-outline"></ion-icon>
                                            <span>{servicio.ubicacion}</span>
                                        </div>
                                        {servicio.cliente_nombre && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="person-outline"></ion-icon>
                                                <span>{servicio.cliente_nombre}</span>
                                            </div>
                                        )}
                                        {servicio.obra_nombre && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="business-outline"></ion-icon>
                                                <span>{servicio.codigo_obra} - {servicio.obra_nombre}</span>
                                            </div>
                                        )}
                                        {servicio.fecha_programada && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="calendar-outline"></ion-icon>
                                                <span>Programado: {new Date(servicio.fecha_programada).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {servicio.costo_estimado > 0 && (
                                            <div className={estilos.itemInfo}>
                                                <ion-icon name="cash-outline"></ion-icon>
                                                <span>RD$ {parseFloat(servicio.costo_estimado).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={estilos.tarjetaFooter}>
                                    <button 
                                        className={estilos.btnVer}
                                        onClick={() => router.push(`/admin/servicios/ver/${servicio.id}`)}
                                    >
                                        Ver Detalle
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

