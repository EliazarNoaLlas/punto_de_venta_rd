"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearCotizacion } from '@/_Pages/admin/cotizaciones/servidor'
import { obtenerClientes } from '@/_Pages/admin/clientes/servidor'
import { obtenerProductos } from '@/_Pages/admin/productos/servidor'
import { calcularTotalesCotizacion } from '@/utils/cotizacionUtils'
import { Save, User, Package, Trash2, ArrowLeft } from 'lucide-react'
import estilos from './cotizaciones.module.css'
import Link from 'next/link'

export default function FormCotizacion() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(false)

    // Datos de la cotización
    const [clienteId, setClienteId] = useState('')
    const [productosCotizacion, setProductosCotizacion] = useState([])
    const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0])
    const [fechaVencimiento, setFechaVencimiento] = useState('')
    const [descuento, setDescuento] = useState(0)
    const [observaciones, setObservaciones] = useState('')

    // Listas para selección
    const [clientes, setClientes] = useState([])
    const [productosDisponibles, setProductosDisponibles] = useState([])

    // Totales calculados
    const [totales, setTotales] = useState({ subtotal: 0, itbis: 0, total: 0 })

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)

        // Cargar 15 días después para vencimiento por defecto
        const hoy = new Date()
        hoy.setDate(hoy.getDate() + 15)
        setFechaVencimiento(hoy.toISOString().split('T')[0])

        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [resCli, resProd] = await Promise.all([
                obtenerClientes(),
                obtenerProductos()
            ])
            if (resCli.success) setClientes(resCli.clientes)
            if (resProd.success) setProductosDisponibles(resProd.productos)
        } catch (error) {
            console.error('Error al cargar datos:', error)
        }
    }

    useEffect(() => {
        setTotales(calcularTotalesCotizacion(productosCotizacion))
    }, [productosCotizacion])

    const agregarProducto = (e) => {
        const pid = e.target.value
        if (!pid) return

        const prod = productosDisponibles.find(p => p.id == pid)
        if (!prod) return

        if (productosCotizacion.some(p => p.producto_id == pid)) {
            alert('El producto ya está en la lista')
            return
        }

        const nuevoItem = {
            producto_id: prod.id,
            nombre_producto: prod.nombre,
            descripcion_producto: '',
            cantidad: 1,
            precio_unitario: prod.precio_venta,
            aplica_itbis: prod.aplica_itbis // Asumiendo que existe este campo en productos
        }

        setProductosCotizacion([...productosCotizacion, nuevoItem])
        e.target.value = ''
    }

    const actualizarCantidad = (index, valor) => {
        const nuevos = [...productosCotizacion]
        nuevos[index].cantidad = parseFloat(valor) || 0
        setProductosCotizacion(nuevos)
    }

    const eliminarProducto = (index) => {
        setProductosCotizacion(productosCotizacion.filter((_, i) => i !== index))
    }

    const manejarGuardar = async (e) => {
        e.preventDefault()
        if (!clienteId) return alert('Seleccione un cliente')
        if (productosCotizacion.length === 0) return alert('Agregue al menos un producto')

        setCargando(true)
        try {
            const res = await crearCotizacion({
                cliente_id: clienteId,
                productos: productosCotizacion,
                fecha_emision: fechaEmision,
                fecha_vencimiento: fechaVencimiento,
                descuento: descuento,
                observaciones: observaciones
            })

            if (res.success) {
                alert('Cotización creada')
                router.push('/admin/cotizaciones')
            } else {
                alert(res.mensaje)
            }
        } catch (error) {
            alert('Error al guardar')
        } finally {
            setCargando(false)
        }
    }

    return (
        <form onSubmit={manejarGuardar} className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <div className={estilos.header}>
                <div>
                    <Link href="/admin/cotizaciones" className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Cotizaciones
                    </Link>
                    <h1 className={estilos.titulo}>Nueva Cotización</h1>
                </div>
                <div className={estilos.acciones}>
                    <button type="submit" disabled={cargando} className={estilos.btnPrimario}>
                        <Save className="w-5 h-5" />
                        <span>{cargando ? 'Guardando...' : 'Guardar Cotización'}</span>
                    </button>
                </div>
            </div>

            <div className={estilos.formGrid}>
                {/* Columna Izquierda: Datos y Productos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Datos del Cliente */}
                    <div className={estilos.card}>
                        <h2 className={estilos.sectionTitle}>
                            <User className="w-5 h-5 text-blue-600" />
                            Información del Cliente
                        </h2>
                        <div className={estilos.inputGroup}>
                            <label className={estilos.label}>Cliente</label>
                            <select 
                                value={clienteId} 
                                onChange={e => setClienteId(e.target.value)} 
                                required
                                className={estilos.select}
                            >
                                <option value="">Seleccione un cliente...</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} - {c.numero_documento}</option>
                                ))}
                            </select>
                        </div>
                        <div className={estilos.filtrosGrid} style={{ marginTop: '1rem' }}>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Fecha Emisión</label>
                                <input 
                                    type="date" 
                                    value={fechaEmision} 
                                    onChange={e => setFechaEmision(e.target.value)} 
                                    required 
                                    className={estilos.input}
                                />
                            </div>
                            <div className={estilos.inputGroup}>
                                <label className={estilos.label}>Fecha Vencimiento</label>
                                <input 
                                    type="date" 
                                    value={fechaVencimiento} 
                                    onChange={e => setFechaVencimiento(e.target.value)} 
                                    required 
                                    className={estilos.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className={estilos.card}>
                        <h2 className={estilos.sectionTitle}>
                            <Package className="w-5 h-5 text-blue-600" />
                            Productos
                        </h2>
                        
                        <div className={estilos.inputGroup} style={{ marginBottom: '1rem' }}>
                            <label className={estilos.label}>Agregar Producto</label>
                            <select onChange={agregarProducto} className={estilos.select}>
                                <option value="">Busque un producto para agregar...</option>
                                {productosDisponibles.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} - RD$ {p.precio_venta}</option>
                                ))}
                            </select>
                        </div>

                        <div className={estilos.tablaContenedor}>
                            <table className={estilos.tabla}>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th width="100">Cant.</th>
                                        <th style={{ textAlign: 'right' }}>Precio</th>
                                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                                        <th width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosCotizacion.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                No hay productos agregados
                                            </td>
                                        </tr>
                                    ) : (
                                        productosCotizacion.map((p, i) => (
                                            <tr key={i}>
                                                <td>{p.nombre_producto}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={p.cantidad}
                                                        onChange={e => actualizarCantidad(i, e.target.value)}
                                                        min="0.01"
                                                        step="0.01"
                                                        className={estilos.input}
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'right' }}>RD$ {p.precio_unitario.toLocaleString()}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>RD$ {(p.cantidad * p.precio_unitario).toLocaleString()}</td>
                                                <td>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => eliminarProducto(i)} 
                                                        className={estilos.btnIcono}
                                                        style={{ color: '#ef4444' }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className={estilos.card}>
                        <div className={estilos.inputGroup}>
                            <label className={estilos.label}>Observaciones</label>
                            <textarea
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                                placeholder="Notas internas o para el cliente..."
                                className={estilos.textarea}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Resumen */}
                <div>
                    <div className={estilos.card} style={{ position: 'sticky', top: '1rem' }}>
                        <h2 className={estilos.sectionTitle}>Resumen</h2>
                        <div className={estilos.resumenPanel}>
                            <div className={estilos.resumenRow}>
                                <span>Subtotal</span>
                                <span>RD$ {totales.subtotal.toLocaleString()}</span>
                            </div>
                            <div className={estilos.resumenRow}>
                                <span>ITBIS (18%)</span>
                                <span>RD$ {totales.itbis.toLocaleString()}</span>
                            </div>
                            <div className={estilos.resumenTotal}>
                                <span>Total</span>
                                <span>RD$ {totales.total.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '1.5rem' }}>
                             <button type="submit" disabled={cargando} className={estilos.btnPrimario} style={{ width: '100%', justifyContent: 'center' }}>
                                <Save className="w-5 h-5" />
                                <span>{cargando ? 'Guardando...' : 'Guardar Cotización'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
