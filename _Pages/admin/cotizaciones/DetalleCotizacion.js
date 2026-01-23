"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { obtenerCotizacionPorId, actualizarEstadoCotizacion, convertirCotizacionAVenta } from '@/_Pages/admin/cotizaciones/servidor'
import { ArrowLeft, Printer, Box, ShoppingCart, Send, CheckCircle } from 'lucide-react'
import estilos from './cotizaciones.module.css'

export default function DetalleCotizacion({ id }) {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [cotizacion, setCotizacion] = useState(null)
    const [detalle, setDetalle] = useState([])

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)
        cargarDetalle()
    }, [id])

    const cargarDetalle = async () => {
        setCargando(true)
        try {
            const res = await obtenerCotizacionPorId(id)
            if (res.success) {
                setCotizacion(res.cotizacion)
                setDetalle(res.detalle)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setCargando(false)
        }
    }

    const manejarCambioEstado = async (nuevoEstado) => {
        try {
            const res = await actualizarEstadoCotizacion(id, nuevoEstado)
            if (res.success) {
                await cargarDetalle()
            } else {
                alert(res.mensaje)
            }
        } catch (error) {
            alert('Error al cambiar estado')
        }
    }

    const manejarConvertirVenta = async () => {
        if (!confirm('¿Desea convertir esta cotización en una venta? El formulario de venta se pre-cargará con estos productos.')) return

        try {
            const res = await convertirCotizacionAVenta(id)
            if (res.success) {
                // Pre-cargar en localStorage para que el componente de venta lo detecte
                localStorage.setItem('cotizacion_venta_precarga', JSON.stringify(res.data))
                router.push('/admin/ventas/nueva')
            } else {
                alert(res.mensaje)
            }
        } catch (error) {
            alert('Error al procesar la conversión')
        }
    }

    const manejarGenerarConduce = () => {
        router.push(`/admin/conduces/crear?origen=cotizacion&numero=${cotizacion.numero_cotizacion}`)
    }

    if (cargando) return <div className={estilos.emptyState}>Cargando detalle...</div>
    if (!cotizacion) return <div className={estilos.emptyState}>Cotización no encontrada</div>

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <div className={estilos.header}>
                <div>
                    <Link href="/admin/cotizaciones" className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                        <ArrowLeft className="w-4 h-4" />
                        Volver a la lista
                    </Link>
                    <h1 className={estilos.titulo}>Cotización {cotizacion.numero_cotizacion}</h1>
                </div>
                <div className={estilos.acciones}>
                    <Link href={`/admin/cotizaciones/${id}/imprimir`} className={estilos.btnSecundario}>
                        <Printer className="w-4 h-4" /> Imprimir
                    </Link>
                    {['aprobada', 'facturada'].includes(cotizacion.estado) && (
                        <button onClick={manejarGenerarConduce} className={estilos.btnSecundario}>
                            <Box className="w-4 h-4" /> Generar Conduce
                        </button>
                    )}
                    {cotizacion.estado === 'aprobada' && (
                        <button onClick={manejarConvertirVenta} className={estilos.btnPrimario}>
                            <ShoppingCart className="w-4 h-4" /> Facturar / Vender
                        </button>
                    )}
                    {cotizacion.estado === 'borrador' && (
                        <button onClick={() => manejarCambioEstado('enviada')} className={estilos.btnPrimario}>
                            <Send className="w-4 h-4" /> Marcar como Enviada
                        </button>
                    )}
                    {['borrador', 'enviada'].includes(cotizacion.estado) && (
                        <button onClick={() => manejarCambioEstado('aprobada')} className={estilos.btnPrimario} style={{ backgroundColor: '#10b981' }}>
                            <CheckCircle className="w-4 h-4" /> Aprobar Cotización
                        </button>
                    )}
                </div>
            </div>

            <div className={estilos.formGrid}>
                {/* Columna Izquierda: Detalles y Tabla */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={estilos.card}>
                        <h3 className={estilos.sectionTitle}>Detalles de la Cotización</h3>
                        <div className={estilos.filtrosGrid}>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Cliente</label>
                                <p className={estilos.input} style={{ background: '#f9fafb', border: 'none' }}>{cotizacion.cliente_nombre || 'Consumidor Final'}</p>
                            </div>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Documento</label>
                                <p className={estilos.input} style={{ background: '#f9fafb', border: 'none' }}>{cotizacion.cliente_documento || 'N/A'}</p>
                            </div>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Teléfono</label>
                                <p className={estilos.input} style={{ background: '#f9fafb', border: 'none' }}>{cotizacion.cliente_telefono || 'N/A'}</p>
                            </div>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Estado</label>
                                <div>
                                    <span className={`${estilos.badge} ${estilos[cotizacion.estado.toLowerCase()] || estilos.borrador}`}>
                                        {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Fecha Emisión</label>
                                <p className={estilos.input} style={{ background: '#f9fafb', border: 'none' }}>{new Date(cotizacion.fecha_emision).toLocaleDateString()}</p>
                            </div>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Vencimiento</label>
                                <p className={estilos.input} style={{ background: '#f9fafb', border: 'none' }}>{new Date(cotizacion.fecha_vencimiento).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className={estilos.card}>
                        <h3 className={estilos.sectionTitle}>Productos</h3>
                        <div className={estilos.tablaContenedor}>
                            <table className={estilos.tabla}>
                                <thead>
                                    <tr>
                                        <th>Cód.</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio</th>
                                        <th>ITBIS</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalle.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.codigo_barras || '-'}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{item.nombre_producto}</div>
                                                {item.descripcion_producto && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.descripcion_producto}</div>}
                                            </td>
                                            <td>{item.cantidad}</td>
                                            <td>RD$ {parseFloat(item.precio_unitario).toLocaleString()}</td>
                                            <td>RD$ {parseFloat(item.itbis).toLocaleString()}</td>
                                            <td>RD$ {parseFloat(item.total).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {cotizacion.observaciones && (
                        <div className={estilos.card}>
                            <label className={estilos.label}>Observaciones</label>
                            <p className={estilos.textarea} style={{ background: '#f9fafb', border: 'none', resize: 'none' }}>{cotizacion.observaciones}</p>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Resumen */}
                <div>
                    <div className={estilos.card} style={{ position: 'sticky', top: '1rem' }}>
                        <h3 className={estilos.sectionTitle}>Resumen Económico</h3>
                        <div className={estilos.resumenPanel}>
                            <div className={estilos.resumenRow}>
                                <span>Subtotal</span>
                                <span>RD$ {parseFloat(cotizacion.subtotal).toLocaleString()}</span>
                            </div>
                            <div className={estilos.resumenRow}>
                                <span>Descuento</span>
                                <span>RD$ {parseFloat(cotizacion.descuento).toLocaleString()}</span>
                            </div>
                            <div className={estilos.resumenRow}>
                                <span>ITBIS</span>
                                <span>RD$ {parseFloat(cotizacion.itbis).toLocaleString()}</span>
                            </div>
                            <div className={estilos.resumenTotal}>
                                <span>Total a Pagar</span>
                                <span>RD$ {parseFloat(cotizacion.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
