"use client"
import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {obtenerTrabajadores, obtenerPersonalEnCampo} from './servidor'
import estilos from './personal.module.css'

export default function PersonalAdmin() {
    const router = useRouter()
    const [trabajadores, setTrabajadores] = useState([])
    const [personalEnCampo, setPersonalEnCampo] = useState([])
    const [vista, setVista] = useState('todos') // 'todos', 'en_campo'
    const [filtros, setFiltros] = useState({
        busqueda: '',
        rol: '',
        estado: 'activo'
    })
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarDatos()
    }, [vista, filtros])

    async function cargarDatos() {
        setCargando(true)

        if (vista === 'en_campo') {
            const res = await obtenerPersonalEnCampo()
            if (res.success) {
                setPersonalEnCampo(res.personal)
            }
        } else {
            const res = await obtenerTrabajadores(filtros)
            if (res.success) {
                setTrabajadores(res.trabajadores)
            }
        }

        setCargando(false)
    }

    const handleFiltroChange = (name, value) => {
        setFiltros(prev => ({...prev, [name]: value}))
    }

    const personalActivo = personalEnCampo.filter(p => p.estado === 'activo')
    const enObras = personalActivo.filter(p => p.tipo_destino === 'obra')
    const enServicios = personalActivo.filter(p => p.tipo_destino === 'servicio')
    const disponibles = trabajadores.filter(t =>
        t.estado === 'activo' &&
        (!t.asignaciones_activas || t.asignaciones_activas === 0)
    )

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Personal en Campo</h1>
                    <p className={estilos.subtitulo}>Gestión de trabajadores y asignaciones</p>
                </div>
                <div className={estilos.botonesHeader}>
                    <button
                        className={estilos.btnNuevo}
                        onClick={() => router.push('/admin/personal/nuevo')}
                    >
                        <ion-icon name="person-add-outline"></ion-icon>
                        <span>Nuevo Trabajador</span>
                    </button>
                    <button
                        className={estilos.btnAsignar}
                        onClick={() => router.push('/admin/personal/asignar')}
                    >
                        <ion-icon name="add-outline"></ion-icon>
                        <span>Asignar Personal</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className={estilos.stats}>
                <div className={estilos.statCard}>
                    <div className={estilos.statIcon} style={{background: '#dbeafe'}}>
                        <ion-icon name="people-outline" style={{color: '#3b82f6'}}></ion-icon>
                    </div>
                    <div>
                        <p className={estilos.statLabel}>Personal Activo</p>
                        <p className={estilos.statValue}>{personalActivo.length}</p>
                    </div>
                </div>
                <div className={estilos.statCard}>
                    <div className={estilos.statIcon} style={{background: '#dbeafe'}}>
                        <span style={{fontSize: '24px'}}>🏗️</span>
                    </div>
                    <div>
                        <p className={estilos.statLabel}>En Obras</p>
                        <p className={estilos.statValue} style={{color: '#3b82f6'}}>{enObras.length}</p>
                    </div>
                </div>
                <div className={estilos.statCard}>
                    <div className={estilos.statIcon} style={{background: '#f3e8ff'}}>
                        <span style={{fontSize: '24px'}}>⚡</span>
                    </div>
                    <div>
                        <p className={estilos.statLabel}>En Servicios</p>
                        <p className={estilos.statValue} style={{color: '#9333ea'}}>{enServicios.length}</p>
                    </div>
                </div>
                <div className={estilos.statCard}>
                    <div className={estilos.statIcon} style={{background: '#f1f5f9'}}>
                        <ion-icon name="time-outline" style={{color: '#64748b'}}></ion-icon>
                    </div>
                    <div>
                        <p className={estilos.statLabel}>Disponibles</p>
                        <p className={estilos.statValue}>{disponibles.length}</p>
                    </div>
                </div>
            </div>

            {/* Filtros y Vista */}
            <div className={estilos.filtros}>
                <div className={estilos.vistaToggle}>
                    <button
                        className={`${estilos.toggleBtn} ${vista === 'todos' ? estilos.toggleBtnActivo : ''}`}
                        onClick={() => setVista('todos')}
                    >
                        Todos los Trabajadores
                    </button>
                    <button
                        className={`${estilos.toggleBtn} ${vista === 'en_campo' ? estilos.toggleBtnActivo : ''}`}
                        onClick={() => setVista('en_campo')}
                    >
                        Personal en Campo
                    </button>
                </div>

                {vista === 'todos' && (
                    <div className={estilos.filtrosInputs}>
                        <div className={estilos.busqueda}>
                            <ion-icon name="search-outline"></ion-icon>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o documento..."
                                value={filtros.busqueda}
                                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                            />
                        </div>
                        <select
                            value={filtros.rol}
                            onChange={(e) => handleFiltroChange('rol', e.target.value)}
                        >
                            <option value="">Todos los roles</option>
                            <option value="Electricista">Electricista</option>
                            <option value="Albañil">Albañil</option>
                            <option value="Plomero">Plomero</option>
                            <option value="Ayudante">Ayudante</option>
                            <option value="Carpintero">Carpintero</option>
                            <option value="Pintor">Pintor</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Lista */}
            {cargando ? (
                <div className={estilos.cargando}>Cargando...</div>
            ) : vista === 'en_campo' ? (
                <div className={estilos.lista}>
                    {personalActivo.length === 0 ? (
                        <div className={estilos.vacio}>No hay personal activo en campo hoy</div>
                    ) : (
                        personalActivo.map(persona => (
                            <div key={persona.id} className={estilos.tarjeta}>
                                <div className={estilos.tarjetaHeader}>
                                    <div className={estilos.avatar}>
                                        {persona.nombre.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className={estilos.infoPrincipal}>
                                        <h3>{persona.nombre} {persona.apellidos}</h3>
                                        <span className={estilos.rol}>{persona.rol}</span>
                                        <div className={estilos.destino}>
                                            <span
                                                className={persona.tipo_destino === 'obra' ? estilos.badgeObra : estilos.badgeServicio}>
                                                {persona.tipo_destino === 'obra' ? '🏗️ Obra' : '⚡ Servicio'}
                                            </span>
                                            <span>{persona.obra_nombre || persona.servicio_nombre}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={estilos.tarjetaBody}>
                                    {persona.zona_trabajo && (
                                        <div className={estilos.itemInfo}>
                                            <ion-icon name="location-outline"></ion-icon>
                                            <span>{persona.zona_trabajo}</span>
                                        </div>
                                    )}
                                    {persona.actividad && (
                                        <div className={estilos.itemInfo}>
                                            <span>Actividad: {persona.actividad}</span>
                                        </div>
                                    )}
                                    {persona.hora_inicio && (
                                        <div className={estilos.itemInfo}>
                                            <ion-icon name="time-outline"></ion-icon>
                                            <span>Desde: {persona.hora_inicio}</span>
                                        </div>
                                    )}
                                    {persona.horas_trabajadas > 0 && (
                                        <div className={estilos.itemInfo}>
                                            <span>{persona.horas_trabajadas}h trabajadas</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className={estilos.lista}>
                    {trabajadores.length === 0 ? (
                        <div className={estilos.vacio}>No se encontraron trabajadores</div>
                    ) : (
                        trabajadores.map(trabajador => (
                            <div key={trabajador.id} className={estilos.tarjeta}>
                                <div className={estilos.tarjetaHeader}>
                                    <div className={estilos.avatar}>
                                        {trabajador.nombre.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className={estilos.infoPrincipal}>
                                        <h3>{trabajador.nombre} {trabajador.apellidos}</h3>
                                        <span className={estilos.rol}>{trabajador.rol_especialidad}</span>
                                        <div className={estilos.infoAdicional}>
                                            <span>Doc: {trabajador.numero_documento}</span>
                                            {trabajador.telefono && <span>Tel: {trabajador.telefono}</span>}
                                            {trabajador.tarifa_por_hora && (
                                                <span>Tarifa: RD${trabajador.tarifa_por_hora}/h</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={estilos.estado}>
                                        <span
                                            className={trabajador.estado === 'activo' ? estilos.activo : estilos.inactivo}>
                                            {trabajador.estado}
                                        </span>
                                        {trabajador.asignaciones_activas > 0 && (
                                            <span className={estilos.badgeAsignado}>
                                                {trabajador.asignaciones_activas} asignación{trabajador.asignaciones_activas > 1 ? 'es' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={estilos.tarjetaFooter}>
                                    <button
                                        className={estilos.btnVer}
                                        onClick={() => router.push(`/admin/personal/ver/${trabajador.id}`)}
                                    >
                                        Ver Detalle
                                    </button>
                                    <button
                                        className={estilos.btnAsignar}
                                        onClick={() => router.push(`/admin/personal/asignar?trabajador=${trabajador.id}`)}
                                    >
                                        Asignar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Trabajadores Disponibles */}
            {vista === 'todos' && disponibles.length > 0 && (
                <div className={estilos.seccionDisponibles}>
                    <h2>Trabajadores Disponibles</h2>
                    <div className={estilos.gridDisponibles}>
                        {disponibles.map(trabajador => (
                            <div key={trabajador.id} className={estilos.cardDisponible}>
                                <div className={estilos.avatar}>
                                    {trabajador.nombre.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h4>{trabajador.nombre}</h4>
                                <p>{trabajador.rol_especialidad}</p>
                                <button
                                    className={estilos.btnAsignar}
                                    onClick={() => router.push(`/admin/personal/asignar?trabajador=${trabajador.id}`)}
                                >
                                    Asignar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

