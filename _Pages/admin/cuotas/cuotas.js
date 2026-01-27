"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerCuotas, obtenerEstadisticasCuotas } from './servidor'
import { calcularDiasAtraso } from '../core/finance/calculos'
import { ESTADOS_CUOTA } from '../core/finance/estados'
import estilos from './cuotas.module.css'

export default function CuotasFinanciamiento() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [cuotas, setCuotas] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [paginacion, setPaginacion] = useState({
        pagina: 1,
        limite: 50,
        total: 0,
        totalPaginas: 1
    })
    const [filtros, setFiltros] = useState({
        estado: '',
        buscar: '',
        fecha_desde: '',
        fecha_hasta: '',
        vencidas: false
    })

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
        cargarDatos()
    }, [paginacion.pagina, filtros])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [resultadoCuotas, resultadoEstadisticas] = await Promise.all([
                obtenerCuotas({
                    pagina: paginacion.pagina,
                    limite: paginacion.limite,
                    estado: filtros.estado || undefined,
                    buscar: filtros.buscar || undefined,
                    fecha_desde: filtros.fecha_desde || undefined,
                    fecha_hasta: filtros.fecha_hasta || undefined,
                    vencidas: filtros.vencidas || undefined
                }),
                obtenerEstadisticasCuotas({
                    fecha_desde: filtros.fecha_desde || undefined,
                    fecha_hasta: filtros.fecha_hasta || undefined
                })
            ])

            if (resultadoCuotas.success) {
                setCuotas(resultadoCuotas.cuotas)
                setPaginacion(resultadoCuotas.paginacion)
            } else {
                alert(resultadoCuotas.mensaje || 'Error al cargar cuotas')
            }

            if (resultadoEstadisticas.success) {
                setEstadisticas(resultadoEstadisticas.estadisticas)
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al cargar datos')
        } finally {
            setCargando(false)
        }
    }

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-DO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const obtenerColorEstado = (estado) => {
        const colores = {
            pendiente: 'warning',
            pagada: 'success',
            parcial: 'info',
            vencida: 'danger',
            condonada: 'secondary'
        }
        return colores[estado] || 'secondary'
    }

    const cambiarPagina = (nuevaPagina) => {
        setPaginacion(prev => ({ ...prev, pagina: nuevaPagina }))
    }

    const manejarCambioFiltro = (e) => {
        const { name, value, type, checked } = e.target
        setFiltros(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        setPaginacion(prev => ({ ...prev, pagina: 1 }))
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando cuotas...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Cuotas de Financiamiento</h1>
                    <p className={estilos.subtitulo}>Vista global de todas las cuotas</p>
                </div>
                <Link href="/admin/financiamiento" className={estilos.btnSecundario}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    Dashboard
                </Link>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className={estilos.estadisticas}>
                    <div className={estilos.estadisticaCard}>
                        <div className={estilos.estadisticaValor}>{estadisticas.total_cuotas}</div>
                        <div className={estilos.estadisticaLabel}>Total Cuotas</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.success}`}>
                            {estadisticas.cuotas_pagadas}
                        </div>
                        <div className={estilos.estadisticaLabel}>Pagadas</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.warning}`}>
                            {estadisticas.cuotas_pendientes}
                        </div>
                        <div className={estilos.estadisticaLabel}>Pendientes</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.danger}`}>
                            {estadisticas.cuotas_vencidas_activas}
                        </div>
                        <div className={estilos.estadisticaLabel}>Vencidas</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={estilos.estadisticaValor}>
                            {new Intl.NumberFormat('es-DO', {
                                style: 'currency',
                                currency: 'DOP',
                                minimumFractionDigits: 2
                            }).format(estadisticas.total_monto_pagado || 0)}
                        </div>
                        <div className={estilos.estadisticaLabel}>Total Pagado</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.danger}`}>
                            {new Intl.NumberFormat('es-DO', {
                                style: 'currency',
                                currency: 'DOP',
                                minimumFractionDigits: 2
                            }).format(estadisticas.total_mora || 0)}
                        </div>
                        <div className={estilos.estadisticaLabel}>Total Mora</div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className={estilos.filtros}>
                <input
                    type="text"
                    placeholder="Buscar por contrato, cliente, documento..."
                    className={estilos.inputBuscar}
                    name="buscar"
                    value={filtros.buscar}
                    onChange={manejarCambioFiltro}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            setPaginacion(prev => ({ ...prev, pagina: 1 }))
                            cargarDatos()
                        }
                    }}
                />
                <select
                    className={estilos.selectFiltro}
                    name="estado"
                    value={filtros.estado}
                    onChange={manejarCambioFiltro}
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="pagada">Pagadas</option>
                    <option value="parcial">Parciales</option>
                    <option value="vencida">Vencidas</option>
                    <option value="condonada">Condonadas</option>
                </select>
                <input
                    type="date"
                    className={estilos.inputFecha}
                    name="fecha_desde"
                    value={filtros.fecha_desde}
                    onChange={manejarCambioFiltro}
                    placeholder="Desde"
                />
                <input
                    type="date"
                    className={estilos.inputFecha}
                    name="fecha_hasta"
                    value={filtros.fecha_hasta}
                    onChange={manejarCambioFiltro}
                    placeholder="Hasta"
                />
                <label className={estilos.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="vencidas"
                        checked={filtros.vencidas}
                        onChange={manejarCambioFiltro}
                    />
                    Solo vencidas
                </label>
            </div>

            {/* Tabla de cuotas */}
            <div className={estilos.tablaContenedor}>
                <table className={estilos.tabla}>
                    <thead>
                        <tr>
                            <th>Contrato</th>
                            <th>Cliente</th>
                            <th>Cuota #</th>
                            <th>Vencimiento</th>
                            <th>Monto Cuota</th>
                            <th>Pagado</th>
                            <th>Mora</th>
                            <th>Pendiente</th>
                            <th>Días Atraso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cuotas.length === 0 ? (
                            <tr>
                                <td colSpan="11" className={estilos.sinDatos}>
                                    No hay cuotas para mostrar
                                </td>
                            </tr>
                        ) : (
                            cuotas.map((cuota) => {
                                const diasAtraso = cuota.dias_atraso_calculado || calcularDiasAtraso(cuota.fecha_vencimiento)
                                const montoPendiente = cuota.total_a_pagar_calculado || 
                                    (parseFloat(cuota.monto_cuota) + parseFloat(cuota.monto_mora || 0) - parseFloat(cuota.monto_pagado || 0))
                                const esVencida = diasAtraso > 0 && cuota.estado !== ESTADOS_CUOTA.PAGADA

                                return (
                                    <tr 
                                        key={cuota.id}
                                        className={esVencida ? estilos.filaVencida : ''}
                                    >
                                        <td>
                                            <div className={estilos.contratoNumero}>
                                                {cuota.numero_contrato}
                                            </div>
                                            <div className={estilos.contratoFecha}>
                                                {formatearFecha(cuota.fecha_contrato)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={estilos.clienteNombre}>
                                                {cuota.cliente_nombre}
                                            </div>
                                            <div className={estilos.clienteDoc}>
                                                {cuota.cliente_documento}
                                            </div>
                                        </td>
                                        <td className={estilos.numeroCuota}>
                                            #{cuota.numero_cuota}
                                        </td>
                                        <td>
                                            <div className={estilos.fechaVencimiento}>
                                                {formatearFecha(cuota.fecha_vencimiento)}
                                            </div>
                                            {esVencida && (
                                                <div className={estilos.vencidaBadge}>
                                                    Vencida
                                                </div>
                                            )}
                                        </td>
                                        <td className={estilos.monto}>
                                            {new Intl.NumberFormat('es-DO', {
                                                style: 'currency',
                                                currency: 'DOP',
                                                minimumFractionDigits: 2
                                            }).format(cuota.monto_cuota || 0)}
                                        </td>
                                        <td className={estilos.monto}>
                                            {new Intl.NumberFormat('es-DO', {
                                                style: 'currency',
                                                currency: 'DOP',
                                                minimumFractionDigits: 2
                                            }).format(cuota.monto_pagado || 0)}
                                        </td>
                                        <td className={`${estilos.monto} ${estilos.mora}`}>
                                            {new Intl.NumberFormat('es-DO', {
                                                style: 'currency',
                                                currency: 'DOP',
                                                minimumFractionDigits: 2
                                            }).format(cuota.monto_mora || 0)}
                                        </td>
                                        <td className={`${estilos.monto} ${estilos.pendiente}`}>
                                            {new Intl.NumberFormat('es-DO', {
                                                style: 'currency',
                                                currency: 'DOP',
                                                minimumFractionDigits: 2
                                            }).format(montoPendiente)}
                                        </td>
                                        <td>
                                            {diasAtraso > 0 ? (
                                                <span className={estilos.diasAtraso}>
                                                    {diasAtraso} días
                                                </span>
                                            ) : (
                                                <span className={estilos.sinAtraso}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`${estilos.badge} ${estilos[obtenerColorEstado(cuota.estado)]}`}>
                                                {cuota.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/admin/contratos/ver/${cuota.contrato_id}`}
                                                className={estilos.btnVer}
                                                title="Ver contrato"
                                            >
                                                <ion-icon name="eye-outline"></ion-icon>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {paginacion.totalPaginas > 1 && (
                <div className={estilos.paginacion}>
                    <button
                        className={estilos.btnPaginacion}
                        onClick={() => cambiarPagina(paginacion.pagina - 1)}
                        disabled={paginacion.pagina === 1}
                    >
                        <ion-icon name="chevron-back-outline"></ion-icon>
                        Anterior
                    </button>
                    <span className={estilos.infoPaginacion}>
                        Página {paginacion.pagina} de {paginacion.totalPaginas}
                    </span>
                    <button
                        className={estilos.btnPaginacion}
                        onClick={() => cambiarPagina(paginacion.pagina + 1)}
                        disabled={paginacion.pagina === paginacion.totalPaginas}
                    >
                        Siguiente
                        <ion-icon name="chevron-forward-outline"></ion-icon>
                    </button>
                </div>
            )}
        </div>
    )
}

