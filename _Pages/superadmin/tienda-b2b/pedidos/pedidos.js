"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerPedidosB2B, obtenerEstadisticasPedidosB2B } from './servidor'
import estilos from './pedidos.module.css'

export default function PedidosTiendaB2B() {
    const router = useRouter()
    const [pedidos, setPedidos] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [tema, setTema] = useState('light')

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
    }, [filtroEstado])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [resultadoPedidos, resultadoEstadisticas] = await Promise.all([
                obtenerPedidosB2B(filtroEstado === 'todos' ? 'todos' : filtroEstado, null),
                obtenerEstadisticasPedidosB2B()
            ])

            if (resultadoPedidos.success) {
                setPedidos(resultadoPedidos.pedidos || [])
            }

            if (resultadoEstadisticas.success) {
                setEstadisticas(resultadoEstadisticas.estadisticas)
            }
        } catch (error) {
            console.error('Error al cargar pedidos:', error)
            alert('Error al cargar pedidos')
        } finally {
            setCargando(false)
        }
    }

    const obtenerColorEstado = (estado) => {
        const colores = {
            pendiente: '#f59e0b',
            confirmado: '#3b82f6',
            en_proceso: '#8b5cf6',
            enviado: '#10b981',
            entregado: '#059669',
            cancelado: '#ef4444'
        }
        return colores[estado] || '#6b7280'
    }

    const obtenerTextoEstado = (estado) => {
        const textos = {
            pendiente: 'Pendiente',
            confirmado: 'Confirmado',
            en_proceso: 'En Proceso',
            enviado: 'Enviado',
            entregado: 'Entregado',
            cancelado: 'Cancelado'
        }
        return textos[estado] || estado
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return '-'
        const date = new Date(fecha)
        return date.toLocaleString('es-DO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div className={estilos.tituloSection}>
                    <h1 className={estilos.titulo}>Pedidos B2B</h1>
                    <p className={estilos.subtitulo}>Gestiona los pedidos realizados por las empresas</p>
                </div>
                <button
                    className={estilos.botonActualizar}
                    onClick={cargarDatos}
                    disabled={cargando}
                >
                    <ion-icon name="refresh-outline"></ion-icon>
                    Actualizar
                </button>
            </div>

            {estadisticas && (
                <div className={estilos.estadisticas}>
                    <div className={estilos.estadCard}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="receipt-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <div className={estilos.estadValor}>{estadisticas.total_pedidos || 0}</div>
                            <div className={estilos.estadLabel}>Total Pedidos</div>
                        </div>
                    </div>
                    <div className={estilos.estadCard}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="time-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <div className={estilos.estadValor}>{estadisticas.pendientes || 0}</div>
                            <div className={estilos.estadLabel}>Pendientes</div>
                        </div>
                    </div>
                    <div className={estilos.estadCard}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="checkmark-circle-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <div className={estilos.estadValor}>{estadisticas.entregados || 0}</div>
                            <div className={estilos.estadLabel}>Entregados</div>
                        </div>
                    </div>
                    <div className={estilos.estadCard}>
                        <div className={estilos.estadIcono}>
                            <ion-icon name="cash-outline"></ion-icon>
                        </div>
                        <div className={estilos.estadInfo}>
                            <div className={estilos.estadValor}>{formatearMoneda(estadisticas.total_ventas || 0)}</div>
                            <div className={estilos.estadLabel}>Total Ventas</div>
                        </div>
                    </div>
                </div>
            )}

            <div className={estilos.filtros}>
                <div className={estilos.filtroGrupo}>
                    <label className={estilos.label}>Filtrar por estado:</label>
                    <select
                        className={estilos.select}
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="confirmado">Confirmados</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="enviado">Enviados</option>
                        <option value="entregado">Entregados</option>
                        <option value="cancelado">Cancelados</option>
                    </select>
                </div>
            </div>

            {cargando ? (
                <div className={estilos.cargando}>
                    <ion-icon name="refresh-outline" className={estilos.iconoCargando}></ion-icon>
                    <p>Cargando pedidos...</p>
                </div>
            ) : pedidos.length === 0 ? (
                <div className={estilos.vacio}>
                    <ion-icon name="receipt-outline"></ion-icon>
                    <p>No hay pedidos {filtroEstado !== 'todos' ? `con estado "${obtenerTextoEstado(filtroEstado)}"` : ''}</p>
                </div>
            ) : (
                <div className={estilos.listaPedidos}>
                    {pedidos.map((pedido) => (
                        <Link
                            key={pedido.id}
                            href={`/superadmin/tienda-b2b/pedidos/ver/${pedido.id}`}
                            className={estilos.pedidoCard}
                        >
                            <div className={estilos.pedidoHeader}>
                                <div className={estilos.pedidoInfo}>
                                    <h3 className={estilos.numeroPedido}>{pedido.numero_pedido}</h3>
                                    <p className={estilos.empresa}>
                                        <ion-icon name="business-outline"></ion-icon>
                                        {pedido.nombre_comercial || pedido.nombre_empresa}
                                    </p>
                                    <p className={estilos.cliente}>
                                        <ion-icon name="person-outline"></ion-icon>
                                        {pedido.usuario_nombre}
                                    </p>
                                </div>
                                <div className={estilos.pedidoEstado}>
                                    <span
                                        className={estilos.badgeEstado}
                                        style={{ backgroundColor: obtenerColorEstado(pedido.estado) }}
                                    >
                                        {obtenerTextoEstado(pedido.estado)}
                                    </span>
                                </div>
                            </div>

                            <div className={estilos.pedidoDetalles}>
                                <div className={estilos.detalleItem}>
                                    <ion-icon name="calendar-outline"></ion-icon>
                                    <span>{formatearFecha(pedido.fecha_pedido)}</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <ion-icon name="cash-outline"></ion-icon>
                                    <span>{formatearMoneda(pedido.total)}</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <ion-icon name="cube-outline"></ion-icon>
                                    <span>{pedido.cantidad_items || 0} productos</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <ion-icon name="card-outline"></ion-icon>
                                    <span>
                                        {pedido.metodo_pago === 'contra_entrega' ? 'Contra Entrega' :
                                         pedido.metodo_pago === 'transferencia' ? 'Transferencia' :
                                         'Crédito'}
                                    </span>
                                </div>
                            </div>

                            {pedido.notas && (
                                <div className={estilos.notas}>
                                    <ion-icon name="document-text-outline"></ion-icon>
                                    <span>{pedido.notas}</span>
                                </div>
                            )}

                            <div className={estilos.flecha}>
                                <ion-icon name="chevron-forward-outline"></ion-icon>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

