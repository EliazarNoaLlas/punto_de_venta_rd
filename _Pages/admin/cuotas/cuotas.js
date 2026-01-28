"use client"
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerCuotas, obtenerEstadisticasCuotas } from './servidor'
import { calcularDiasAtraso } from '../core/finance/calculos'
import { ESTADOS_CUOTA, formatearEstadoCuota } from '../core/finance/estados'
import estilos from './cuotas.module.css'

export default function CuotasFinanciamiento() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [cuotas, setCuotas] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [vistaActiva, setVistaActiva] = useState('tabla') // 'tabla' o 'tarjetas'
    const [paginacion, setPaginacion] = useState({
        pagina: 1,
        limite: 25,
        total: 0,
        totalPaginas: 1
    })
    const [filtros, setFiltros] = useState({
        estado: '',
        buscar: '',
        fecha_desde: '',
        fecha_hasta: '',
        vencidas: false,
        ordenar: 'vencimiento_asc'
    })
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

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
            console.log('🔍 Cargando cuotas con filtros:', filtros)
            
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

            console.log('📊 Resultado cuotas:', resultadoCuotas)
            console.log('📈 Resultado estadísticas:', resultadoEstadisticas)

            if (resultadoCuotas.success) {
                setCuotas(resultadoCuotas.cuotas)
                setPaginacion(prev => ({
                    ...prev,
                    ...resultadoCuotas.paginacion
                }))
                console.log(`✅ ${resultadoCuotas.cuotas.length} cuotas cargadas`)
            } else {
                console.error('❌ Error al cargar cuotas:', resultadoCuotas.mensaje)
                alert(resultadoCuotas.mensaje || 'Error al cargar cuotas')
            }

            if (resultadoEstadisticas.success) {
                setEstadisticas(resultadoEstadisticas.estadisticas)
                console.log('✅ Estadísticas cargadas:', resultadoEstadisticas.estadisticas)
            } else {
                console.error('❌ Error al cargar estadísticas:', resultadoEstadisticas.mensaje)
            }
        } catch (error) {
            console.error('💥 Error crítico al cargar datos:', error)
            alert('Error crítico al cargar las cuotas. Revisa la consola para más detalles.')
        } finally {
            setCargando(false)
        }
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return '-'
        return new Date(fecha).toLocaleDateString('es-DO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto || 0)
    }

    const formatearMonedaCorta = (monto) => {
        if (monto >= 1000000) {
            return `RD$ ${(monto / 1000000).toFixed(1)}M`
        }
        if (monto >= 1000) {
            return `RD$ ${(monto / 1000).toFixed(0)}K`
        }
        return formatearMoneda(monto)
    }

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina < 1 || nuevaPagina > paginacion.totalPaginas) return
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

    const limpiarFiltros = () => {
        setFiltros({
            estado: '',
            buscar: '',
            fecha_desde: '',
            fecha_hasta: '',
            vencidas: false,
            ordenar: 'vencimiento_asc'
        })
        setPaginacion(prev => ({ ...prev, pagina: 1 }))
    }

    const obtenerPorcentajeProgreso = (pagadas, total) => {
        if (!total || total === 0) return 0
        return Math.round((pagadas / total) * 100)
    }

    // Componente de carga
    if (cargando && cuotas.length === 0) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <div className={estilos.cargandoSpinner}></div>
                    <span>Cargando cuotas de financiamiento...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <header className={estilos.header}>
                <div className={estilos.headerInfo}>
                    <div className={estilos.headerIcono}>
                        <ion-icon name="calendar-outline"></ion-icon>
                    </div>
                    <div>
                        <h1 className={estilos.titulo}>Cuotas de Financiamiento</h1>
                        <p className={estilos.subtitulo}>Gestión y seguimiento de cuotas de todos los contratos</p>
                    </div>
                </div>
                <div className={estilos.headerAcciones}>
                    <Link href="/admin/contratos" className={estilos.btnSecundario}>
                        <ion-icon name="document-text-outline"></ion-icon>
                        Ver Contratos
                    </Link>
                    <Link href="/admin/planes" className={estilos.btnSecundario}>
                        <ion-icon name="layers-outline"></ion-icon>
                        Ver Planes
                    </Link>
                    <Link href="/admin/financiamiento" className={estilos.btnPrimario}>
                        <ion-icon name="stats-chart-outline"></ion-icon>
                        Dashboard
                    </Link>
                </div>
            </header>

            {/* Estadísticas */}
            {estadisticas && (
                <section className={estilos.estadisticas}>
                    <div className={`${estilos.estadCard} ${estilos.primary}`}>
                        <div className={estilos.estadIconoWrapper}>
                            <div className={`${estilos.estadIcono} ${estilos.primary}`}>
                                <ion-icon name="layers-outline"></ion-icon>
                            </div>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Total Cuotas</span>
                            <span className={estilos.estadValor}>{estadisticas.total_cuotas || 0}</span>
                            <span className={`${estilos.estadTendencia} ${estilos.neutro}`}>
                                Contratos activos
                            </span>
                        </div>
                    </div>

                    <div className={`${estilos.estadCard} ${estilos.success}`}>
                        <div className={estilos.estadIconoWrapper}>
                            <div className={`${estilos.estadIcono} ${estilos.success}`}>
                                <ion-icon name="checkmark-circle-outline"></ion-icon>
                            </div>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Cuotas Pagadas</span>
                            <span className={estilos.estadValor}>{estadisticas.cuotas_pagadas || 0}</span>
                            <span className={`${estilos.estadTendencia} ${estilos.positivo}`}>
                                <ion-icon name="trending-up-outline"></ion-icon>
                                {obtenerPorcentajeProgreso(estadisticas.cuotas_pagadas, estadisticas.total_cuotas)}% del total
                            </span>
                        </div>
                    </div>

                    <div className={`${estilos.estadCard} ${estilos.warning}`}>
                        <div className={estilos.estadIconoWrapper}>
                            <div className={`${estilos.estadIcono} ${estilos.warning}`}>
                                <ion-icon name="time-outline"></ion-icon>
                            </div>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Cuotas Pendientes</span>
                            <span className={estilos.estadValor}>{estadisticas.cuotas_pendientes || 0}</span>
                            <span className={`${estilos.estadTendencia} ${estilos.neutro}`}>
                                Por cobrar
                            </span>
                        </div>
                    </div>

                    <div className={`${estilos.estadCard} ${estilos.danger}`}>
                        <div className={estilos.estadIconoWrapper}>
                            <div className={`${estilos.estadIcono} ${estilos.danger}`}>
                                <ion-icon name="alert-circle-outline"></ion-icon>
                            </div>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Cuotas Vencidas</span>
                            <span className={estilos.estadValor}>{estadisticas.cuotas_vencidas_activas || 0}</span>
                            <span className={`${estilos.estadTendencia} ${estilos.negativo}`}>
                                <ion-icon name="warning-outline"></ion-icon>
                                Requieren atención
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {/* Métricas financieras */}
            {estadisticas && (
                <section className={estilos.metricasSecundarias}>
                    <div className={estilos.metricaCard}>
                        <div className={`${estilos.metricaIcono} ${estilos.green}`}>
                            <ion-icon name="cash-outline"></ion-icon>
                        </div>
                        <div className={estilos.metricaDetalle}>
                            <span className={estilos.metricaLabel}>Total Cobrado</span>
                            <span className={estilos.metricaValor}>
                                {formatearMonedaCorta(estadisticas.total_monto_pagado || 0)}
                            </span>
                        </div>
                    </div>

                    <div className={estilos.metricaCard}>
                        <div className={`${estilos.metricaIcono} ${estilos.blue}`}>
                            <ion-icon name="wallet-outline"></ion-icon>
                        </div>
                        <div className={estilos.metricaDetalle}>
                            <span className={estilos.metricaLabel}>Por Cobrar</span>
                            <span className={estilos.metricaValor}>
                                {formatearMonedaCorta((estadisticas.total_monto_cuotas || 0) - (estadisticas.total_monto_pagado || 0))}
                            </span>
                        </div>
                    </div>

                    <div className={estilos.metricaCard}>
                        <div className={`${estilos.metricaIcono} ${estilos.red}`}>
                            <ion-icon name="trending-down-outline"></ion-icon>
                        </div>
                        <div className={estilos.metricaDetalle}>
                            <span className={estilos.metricaLabel}>Mora Acumulada</span>
                            <span className={estilos.metricaValor}>
                                {formatearMonedaCorta(estadisticas.total_mora || 0)}
                            </span>
                        </div>
                    </div>

                    <div className={estilos.metricaCard}>
                        <div className={`${estilos.metricaIcono} ${estilos.orange}`}>
                            <ion-icon name="pie-chart-outline"></ion-icon>
                        </div>
                        <div className={estilos.metricaDetalle}>
                            <span className={estilos.metricaLabel}>Tasa Morosidad</span>
                            <span className={estilos.metricaValor}>
                                {estadisticas.total_cuotas > 0 
                                    ? ((estadisticas.cuotas_vencidas_activas / estadisticas.total_cuotas) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {/* Barra de filtros */}
            <section className={estilos.filtrosSeccion}>
                <div className={estilos.filtrosHeader}>
                    <div className={estilos.busquedaContainer}>
                        <ion-icon name="search-outline"></ion-icon>
                        <input
                            type="text"
                            placeholder="Buscar por contrato, cliente, documento..."
                            className={estilos.inputBuscar}
                            name="buscar"
                            value={filtros.buscar}
                            onChange={manejarCambioFiltro}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    cargarDatos()
                                }
                            }}
                        />
                        {filtros.buscar && (
                            <button 
                                className={estilos.limpiarBusqueda}
                                onClick={() => setFiltros(prev => ({ ...prev, buscar: '' }))}
                            >
                                <ion-icon name="close-circle"></ion-icon>
                            </button>
                        )}
                    </div>

                    <div className={estilos.filtrosAcciones}>
                        <button 
                            className={`${estilos.btnFiltros} ${filtrosAbiertos ? estilos.activo : ''}`}
                            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                        >
                            <ion-icon name="options-outline"></ion-icon>
                            Filtros
                            {(filtros.estado || filtros.fecha_desde || filtros.fecha_hasta || filtros.vencidas) && (
                                <span className={estilos.filtrosContador}>
                                    {[filtros.estado, filtros.fecha_desde, filtros.fecha_hasta, filtros.vencidas].filter(Boolean).length}
                                </span>
                            )}
                        </button>

                        <div className={estilos.vistaToggle}>
                            <button 
                                className={`${estilos.btnVista} ${vistaActiva === 'tabla' ? estilos.activo : ''}`}
                                onClick={() => setVistaActiva('tabla')}
                                title="Vista tabla"
                            >
                                <ion-icon name="list-outline"></ion-icon>
                            </button>
                            <button 
                                className={`${estilos.btnVista} ${vistaActiva === 'tarjetas' ? estilos.activo : ''}`}
                                onClick={() => setVistaActiva('tarjetas')}
                                title="Vista tarjetas"
                            >
                                <ion-icon name="grid-outline"></ion-icon>
                            </button>
                        </div>
                    </div>
                </div>

                {filtrosAbiertos && (
                    <div className={estilos.filtrosExpandidos}>
                        <div className={estilos.filtroGrupo}>
                            <label className={estilos.filtroLabel}>Estado</label>
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
                        </div>

                        <div className={estilos.filtroGrupo}>
                            <label className={estilos.filtroLabel}>Desde</label>
                            <input
                                type="date"
                                className={estilos.inputFecha}
                                name="fecha_desde"
                                value={filtros.fecha_desde}
                                onChange={manejarCambioFiltro}
                            />
                        </div>

                        <div className={estilos.filtroGrupo}>
                            <label className={estilos.filtroLabel}>Hasta</label>
                            <input
                                type="date"
                                className={estilos.inputFecha}
                                name="fecha_hasta"
                                value={filtros.fecha_hasta}
                                onChange={manejarCambioFiltro}
                            />
                        </div>

                        <div className={estilos.filtroGrupo}>
                            <label className={estilos.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="vencidas"
                                    checked={filtros.vencidas}
                                    onChange={manejarCambioFiltro}
                                />
                                <span className={estilos.checkboxCustom}></span>
                                Solo vencidas
                            </label>
                        </div>

                        <button className={estilos.btnLimpiar} onClick={limpiarFiltros}>
                            <ion-icon name="refresh-outline"></ion-icon>
                            Limpiar
                        </button>
                    </div>
                )}
            </section>

            {/* Contenido principal */}
            {vistaActiva === 'tabla' ? (
                <section className={estilos.tablaSeccion}>
                    <div className={estilos.tablaContenedor}>
                        <table className={estilos.tabla}>
                            <thead>
                                <tr>
                                    <th>Contrato</th>
                                    <th>Cliente</th>
                                    <th className={estilos.centrado}>Cuota #</th>
                                    <th>Vencimiento</th>
                                    <th className={estilos.derecha}>Monto</th>
                                    <th className={estilos.derecha}>Pagado</th>
                                    <th className={estilos.derecha}>Mora</th>
                                    <th className={estilos.centrado}>Atraso</th>
                                    <th className={estilos.centrado}>Estado</th>
                                    <th className={estilos.centrado}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cuotas.length === 0 ? (
                                    <tr>
                                        <td colSpan="10">
                                            <div className={estilos.sinDatos}>
                                                <ion-icon name="file-tray-outline"></ion-icon>
                                                <span>No hay cuotas que mostrar</span>
                                                <p>Ajusta los filtros o crea un nuevo contrato</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cuotas.map((cuota, index) => {
                                        const diasAtraso = cuota.dias_atraso_calculado || calcularDiasAtraso(cuota.fecha_vencimiento)
                                        const montoPendiente = cuota.total_a_pagar_calculado || 
                                            (parseFloat(cuota.monto_cuota) + parseFloat(cuota.monto_mora || 0) - parseFloat(cuota.monto_pagado || 0))
                                        const esVencida = diasAtraso > 0 && cuota.estado !== ESTADOS_CUOTA.PAGADA
                                        const estadoInfo = formatearEstadoCuota(cuota.estado)

                                        return (
                                            <tr 
                                                key={cuota.id}
                                                className={`${esVencida ? estilos.filaVencida : ''} ${estilos.filaAnimada}`}
                                                style={{ animationDelay: `${index * 0.03}s` }}
                                            >
                                                <td>
                                                    <Link 
                                                        href={`/admin/contratos/ver/${cuota.contrato_id}`}
                                                        className={estilos.contratoLink}
                                                    >
                                                        <span className={estilos.contratoNumero}>
                                                            {cuota.numero_contrato}
                                                        </span>
                                                        <span className={estilos.contratoFecha}>
                                                            {formatearFecha(cuota.fecha_contrato)}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td>
                                                    <div className={estilos.clienteInfo}>
                                                        <span className={estilos.clienteNombre}>
                                                            {cuota.cliente_nombre}
                                                        </span>
                                                        <span className={estilos.clienteDoc}>
                                                            {cuota.cliente_documento}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className={estilos.centrado}>
                                                    <span className={estilos.numeroCuota}>
                                                        #{cuota.numero_cuota}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={estilos.fechaVencimiento}>
                                                        <span>{formatearFecha(cuota.fecha_vencimiento)}</span>
                                                        {esVencida && (
                                                            <span className={estilos.vencidaBadge}>
                                                                <ion-icon name="warning"></ion-icon>
                                                                Vencida
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={estilos.derecha}>
                                                    <span className={estilos.monto}>
                                                        {formatearMoneda(cuota.monto_cuota)}
                                                    </span>
                                                </td>
                                                <td className={estilos.derecha}>
                                                    <span className={`${estilos.monto} ${estilos.montoPagado}`}>
                                                        {formatearMoneda(cuota.monto_pagado)}
                                                    </span>
                                                </td>
                                                <td className={estilos.derecha}>
                                                    <span className={`${estilos.monto} ${parseFloat(cuota.monto_mora) > 0 ? estilos.montoMora : ''}`}>
                                                        {formatearMoneda(cuota.monto_mora)}
                                                    </span>
                                                </td>
                                                <td className={estilos.centrado}>
                                                    {diasAtraso > 0 && cuota.estado !== ESTADOS_CUOTA.PAGADA ? (
                                                        <span className={estilos.diasAtraso}>
                                                            {diasAtraso} días
                                                        </span>
                                                    ) : (
                                                        <span className={estilos.sinAtraso}>—</span>
                                                    )}
                                                </td>
                                                <td className={estilos.centrado}>
                                                    <span className={`${estilos.badge} ${estilos[estadoInfo.color]}`}>
                                                        {estadoInfo.texto}
                                                    </span>
                                                </td>
                                                <td className={estilos.centrado}>
                                                    <div className={estilos.acciones}>
                                                        <Link
                                                            href={`/admin/contratos/ver/${cuota.contrato_id}`}
                                                            className={estilos.btnAccion}
                                                            title="Ver contrato"
                                                        >
                                                            <ion-icon name="eye-outline"></ion-icon>
                                                        </Link>
                                                        <Link
                                                            href={`/admin/cuotas/ver/${cuota.id}`}
                                                            className={`${estilos.btnAccion} ${estilos.btnAccionPrimario}`}
                                                            title="Ver detalle cuota"
                                                        >
                                                            <ion-icon name="receipt-outline"></ion-icon>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <section className={estilos.tarjetasSeccion}>
                    <div className={estilos.tarjetasGrid}>
                        {cuotas.length === 0 ? (
                            <div className={estilos.vacio}>
                                <ion-icon name="file-tray-outline"></ion-icon>
                                <h3>No hay cuotas</h3>
                                <p>Ajusta los filtros o crea un nuevo contrato</p>
                            </div>
                        ) : (
                            cuotas.map((cuota, index) => {
                                const diasAtraso = cuota.dias_atraso_calculado || calcularDiasAtraso(cuota.fecha_vencimiento)
                                const montoPendiente = parseFloat(cuota.monto_cuota) + parseFloat(cuota.monto_mora || 0) - parseFloat(cuota.monto_pagado || 0)
                                const esVencida = diasAtraso > 0 && cuota.estado !== ESTADOS_CUOTA.PAGADA
                                const estadoInfo = formatearEstadoCuota(cuota.estado)
                                const porcentajePago = ((parseFloat(cuota.monto_pagado) / parseFloat(cuota.monto_cuota)) * 100).toFixed(0)

                                return (
                                    <div 
                                        key={cuota.id} 
                                        className={`${estilos.tarjetaCuota} ${esVencida ? estilos.tarjetaVencida : ''}`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className={estilos.tarjetaHeader}>
                                            <div className={estilos.tarjetaContrato}>
                                                <span className={estilos.tarjetaNumero}>Cuota #{cuota.numero_cuota}</span>
                                                <Link 
                                                    href={`/admin/contratos/ver/${cuota.contrato_id}`}
                                                    className={estilos.tarjetaContratoLink}
                                                >
                                                    {cuota.numero_contrato}
                                                </Link>
                                            </div>
                                            <span className={`${estilos.badge} ${estilos[estadoInfo.color]}`}>
                                                {estadoInfo.texto}
                                            </span>
                                        </div>

                                        <div className={estilos.tarjetaCliente}>
                                            <div className={estilos.avatarCliente}>
                                                {cuota.cliente_nombre?.charAt(0) || 'C'}
                                            </div>
                                            <div className={estilos.tarjetaClienteInfo}>
                                                <span className={estilos.tarjetaClienteNombre}>{cuota.cliente_nombre}</span>
                                                <span className={estilos.tarjetaClienteDoc}>{cuota.cliente_documento}</span>
                                            </div>
                                        </div>

                                        <div className={estilos.tarjetaMontos}>
                                            <div className={estilos.tarjetaMontoItem}>
                                                <span className={estilos.tarjetaMontoLabel}>Monto Cuota</span>
                                                <span className={estilos.tarjetaMontoValor}>{formatearMoneda(cuota.monto_cuota)}</span>
                                            </div>
                                            {parseFloat(cuota.monto_mora) > 0 && (
                                                <div className={estilos.tarjetaMontoItem}>
                                                    <span className={estilos.tarjetaMontoLabel}>Mora</span>
                                                    <span className={`${estilos.tarjetaMontoValor} ${estilos.montoMora}`}>
                                                        {formatearMoneda(cuota.monto_mora)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={estilos.tarjetaMontoItem}>
                                                <span className={estilos.tarjetaMontoLabel}>Pendiente</span>
                                                <span className={`${estilos.tarjetaMontoValor} ${estilos.montoPendiente}`}>
                                                    {formatearMoneda(montoPendiente)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={estilos.tarjetaProgreso}>
                                            <div className={estilos.progresoInfo}>
                                                <span>Pagado</span>
                                                <span>{porcentajePago}%</span>
                                            </div>
                                            <div className={estilos.barraProgreso}>
                                                <div 
                                                    className={estilos.barraProgresoFill}
                                                    style={{ width: `${Math.min(porcentajePago, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className={estilos.tarjetaFooter}>
                                            <div className={estilos.tarjetaVencimiento}>
                                                <ion-icon name="calendar-outline"></ion-icon>
                                                <span>{formatearFecha(cuota.fecha_vencimiento)}</span>
                                                {esVencida && (
                                                    <span className={estilos.diasAtrasoSmall}>{diasAtraso}d atraso</span>
                                                )}
                                            </div>
                                            <div className={estilos.tarjetaAcciones}>
                                                <Link
                                                    href={`/admin/cuotas/ver/${cuota.id}`}
                                                    className={estilos.btnTarjeta}
                                                >
                                                    Ver Detalle
                                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </section>
            )}

            {/* Paginación */}
            {paginacion.totalPaginas > 1 && (
                <section className={estilos.paginacionSeccion}>
                    <div className={estilos.paginacionInfo}>
                        Mostrando {((paginacion.pagina - 1) * paginacion.limite) + 1} - {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)} de {paginacion.total} cuotas
                    </div>
                    <div className={estilos.paginacionControles}>
                        <button
                            className={estilos.btnPaginacion}
                            onClick={() => cambiarPagina(1)}
                            disabled={paginacion.pagina === 1}
                            title="Primera página"
                        >
                            <ion-icon name="play-back-outline"></ion-icon>
                        </button>
                        <button
                            className={estilos.btnPaginacion}
                            onClick={() => cambiarPagina(paginacion.pagina - 1)}
                            disabled={paginacion.pagina === 1}
                        >
                            <ion-icon name="chevron-back-outline"></ion-icon>
                            Anterior
                        </button>
                        
                        <div className={estilos.paginacionNumeros}>
                            {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
                                let pagina
                                if (paginacion.totalPaginas <= 5) {
                                    pagina = i + 1
                                } else if (paginacion.pagina <= 3) {
                                    pagina = i + 1
                                } else if (paginacion.pagina >= paginacion.totalPaginas - 2) {
                                    pagina = paginacion.totalPaginas - 4 + i
                                } else {
                                    pagina = paginacion.pagina - 2 + i
                                }
                                return (
                                    <button
                                        key={pagina}
                                        className={`${estilos.btnPaginaNumero} ${paginacion.pagina === pagina ? estilos.activo : ''}`}
                                        onClick={() => cambiarPagina(pagina)}
                                    >
                                        {pagina}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            className={estilos.btnPaginacion}
                            onClick={() => cambiarPagina(paginacion.pagina + 1)}
                            disabled={paginacion.pagina === paginacion.totalPaginas}
                        >
                            Siguiente
                            <ion-icon name="chevron-forward-outline"></ion-icon>
                        </button>
                        <button
                            className={estilos.btnPaginacion}
                            onClick={() => cambiarPagina(paginacion.totalPaginas)}
                            disabled={paginacion.pagina === paginacion.totalPaginas}
                            title="Última página"
                        >
                            <ion-icon name="play-forward-outline"></ion-icon>
                        </button>
                    </div>
                </section>
            )}
        </div>
    )
}
