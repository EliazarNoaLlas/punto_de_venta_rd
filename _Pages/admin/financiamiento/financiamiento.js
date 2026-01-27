"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerDashboardFinanciamiento } from './servidor'
import { obtenerContratos } from '../contratos/servidor'
import { obtenerAlertas } from '../alertas/servidor'
import estilos from './financiamiento.module.css'

export default function FinanciamientoAdmin() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [metricas, setMetricas] = useState(null)
    const [contratos, setContratos] = useState([])
    const [alertas, setAlertas] = useState([])
    const [filtroEstado, setFiltroEstado] = useState('')
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

    useEffect(() => {
        cargarDatos()
    }, [filtroEstado, buscar])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [resultadoMetricas, resultadoContratos, resultadoAlertas] = await Promise.all([
                obtenerDashboardFinanciamiento(),
                obtenerContratos({ estado: filtroEstado || undefined, buscar: buscar || undefined }),
                obtenerAlertas({ estado: 'activa', severidad: 'critica' })
            ])

            if (resultadoMetricas.success) {
                setMetricas(resultadoMetricas.metricas)
            }

            if (resultadoContratos.success) {
                setContratos(resultadoContratos.contratos)
            }

            if (resultadoAlertas.success) {
                setAlertas(resultadoAlertas.alertas.slice(0, 5)) // Top 5 alertas críticas
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al cargar datos del financiamiento')
        } finally {
            setCargando(false)
        }
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(monto || 0)
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
            activo: 'success',
            pagado: 'info',
            incumplido: 'danger',
            reestructurado: 'warning',
            cancelado: 'secondary'
        }
        return colores[estado] || 'secondary'
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando financiamiento...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <h1 className={estilos.titulo}>Dashboard de Financiamiento</h1>
                    <p className={estilos.subtitulo}>Gestión integral de créditos y cobranzas</p>
                </div>
                <div className={estilos.headerAcciones}>
                    <Link href="/admin/planes" className={estilos.btnSecundario}>
                        <ion-icon name="document-text-outline"></ion-icon>
                        Planes
                    </Link>
                    <Link href="/admin/contratos" className={estilos.btnSecundario}>
                        <ion-icon name="document-outline"></ion-icon>
                        Contratos
                    </Link>
                    <Link href="/admin/cuotas" className={estilos.btnSecundario}>
                        <ion-icon name="calendar-outline"></ion-icon>
                        Cuotas
                    </Link>
                    <Link href="/admin/pagos" className={estilos.btnSecundario}>
                        <ion-icon name="cash-outline"></ion-icon>
                        Pagos
                    </Link>
                    <Link href="/admin/alertas" className={estilos.btnSecundario}>
                        <ion-icon name="warning-outline"></ion-icon>
                        Alertas
                    </Link>
                    <Link href="/admin/activos" className={estilos.btnSecundario}>
                        <ion-icon name="cube-outline"></ion-icon>
                        Activos
                    </Link>
                </div>
            </div>

            {/* Métricas principales */}
            {metricas && (
                <div className={estilos.estadisticasPrincipales}>
                    <div className={`${estilos.estadCard} ${estilos.contratos}`}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="document-text-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Contratos Activos</span>
                            <span className={estilos.estadValor}>{metricas.contratosActivos}</span>
                            <span className={estilos.estadDetalle}>En proceso</span>
                        </div>
                    </div>

                    <div className={`${estilos.estadCard} ${estilos.vencidas}`}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="alert-circle-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Cuotas Vencidas</span>
                            <span className={estilos.estadValor}>{metricas.cuotasVencidas}</span>
                            <span className={estilos.estadDetalle}>Requieren atención</span>
                        </div>
                    </div>

                    <div className={`${estilos.estadCard} ${estilos.saldo}`}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="cash-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Saldo Pendiente</span>
                            <span className={estilos.estadValor}>{formatearMoneda(metricas.saldoPendiente)}</span>
                            <span className={estilos.estadDetalle}>Por cobrar</span>
                        </div>
                    </div>

                    <div className={`${estilos.estadCard} ${estilos.cobrado}`}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="trending-up-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <span className={estilos.estadLabel}>Cobrado Este Mes</span>
                            <span className={estilos.estadValor}>{formatearMoneda(metricas.cobradoMes)}</span>
                            <span className={estilos.estadDetalle}>Total recaudado</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Alertas prioritarias */}
            {alertas.length > 0 && (
                <div className={`${estilos.panel} ${estilos[tema]}`}>
                    <div className={estilos.panelHeader}>
                        <h2 className={estilos.panelTitulo}>
                            <ion-icon name="warning-outline"></ion-icon>
                            Alertas Prioritarias
                        </h2>
                        <Link href="/admin/alertas" className={estilos.btnVerTodas}>
                            Ver todas
                        </Link>
                    </div>
                    <div className={estilos.alertasLista}>
                        {alertas.map((alerta) => (
                            <div key={alerta.id} className={estilos.alertaItem}>
                                <div className={estilos.alertaIcono}>
                                    <ion-icon name="alert-circle"></ion-icon>
                                </div>
                                <div className={estilos.alertaInfo}>
                                    <div className={estilos.alertaTitulo}>{alerta.titulo}</div>
                                    <div className={estilos.alertaDetalle}>
                                        {alerta.cliente_nombre} • {alerta.numero_contrato}
                                    </div>
                                </div>
                                <div className={estilos.alertaAcciones}>
                                    <button className={estilos.btnAccion} title="Llamar">
                                        <ion-icon name="call-outline"></ion-icon>
                                    </button>
                                    <button className={estilos.btnAccion} title="WhatsApp">
                                        <ion-icon name="logo-whatsapp"></ion-icon>
                                    </button>
                                    <Link
                                        href={`/admin/contratos/ver/${alerta.contrato_id}`}
                                        className={estilos.btnAccion}
                                        title="Ver contrato"
                                    >
                                        <ion-icon name="eye-outline"></ion-icon>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabla de contratos */}
            <div className={`${estilos.panel} ${estilos[tema]}`}>
                <div className={estilos.panelHeader}>
                    <h2 className={estilos.panelTitulo}>
                        <ion-icon name="document-text-outline"></ion-icon>
                        Contratos de Financiamiento
                    </h2>
                    <div className={estilos.panelControles}>
                        <input
                            type="text"
                            placeholder="Buscar contrato, cliente, NCF..."
                            className={estilos.inputBuscar}
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                        />
                        <select
                            className={estilos.selectFiltro}
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="activo">Activos</option>
                            <option value="pagado">Pagados</option>
                            <option value="incumplido">Incumplidos</option>
                            <option value="reestructurado">Reestructurados</option>
                        </select>
                    </div>
                </div>

                <div className={estilos.tablaContenedor}>
                    <table className={estilos.tabla}>
                        <thead>
                            <tr>
                                <th>Contrato</th>
                                <th>Cliente</th>
                                <th>Plan</th>
                                <th>Monto Financiado</th>
                                <th>Saldo Pendiente</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contratos.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={estilos.sinDatos}>
                                        No hay contratos para mostrar
                                    </td>
                                </tr>
                            ) : (
                                contratos.map((contrato) => (
                                    <tr key={contrato.id}>
                                        <td>
                                            <div className={estilos.contratoNumero}>
                                                {contrato.numero_contrato}
                                            </div>
                                            <div className={estilos.contratoFecha}>
                                                {formatearFecha(contrato.fecha_contrato)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={estilos.clienteNombre}>
                                                {contrato.cliente_nombre}
                                            </div>
                                            <div className={estilos.clienteDoc}>
                                                {contrato.cliente_documento}
                                            </div>
                                        </td>
                                        <td>{contrato.plan_nombre}</td>
                                        <td className={estilos.monto}>
                                            {formatearMoneda(contrato.monto_financiado)}
                                        </td>
                                        <td className={estilos.monto}>
                                            {formatearMoneda(contrato.saldo_pendiente)}
                                        </td>
                                        <td>
                                            <span className={`${estilos.badge} ${estilos[obtenerColorEstado(contrato.estado)]}`}>
                                                {contrato.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/admin/contratos/ver/${contrato.id}`}
                                                className={estilos.btnVer}
                                            >
                                                Ver detalles
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}




