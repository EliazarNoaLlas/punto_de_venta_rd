"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearConduce, obtenerSaldoPendiente, buscarOrigenPorNumero } from '@/_Pages/admin/conduces/servidor'
import { obtenerVentas } from '@/_Pages/admin/ventas/servidor'
import estilos from './conduces.module.css'

export default function FormConduce() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(false)

    // Búsqueda de origen
    const [tipoOrigen, setTipoOrigen] = useState('venta')
    const [numeroOrigen, setNumeroOrigen] = useState('')
    const [origenSeleccionado, setOrigenSeleccionado] = useState(null)
    const [saldos, setSaldos] = useState([])

    // Datos del conduce
    const [fechaConduce, setFechaConduce] = useState(new Date().toISOString().split('T')[0])
    const [chofer, setChofer] = useState('')
    const [vehiculo, setVehiculo] = useState('')
    const [placa, setPlaca] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [itemsADespachar, setItemsADespachar] = useState([])

    useEffect(() => {
        setTema(localStorage.getItem('tema') || 'light')

        // Manejar parámetros de URL para auto-búsqueda
        const params = new URLSearchParams(window.location.search)
        const autoTipo = params.get('origen')
        const autoNumero = params.get('numero')

        if (autoTipo && autoNumero) {
            setTipoOrigen(autoTipo)
            setNumeroOrigen(autoNumero)
            // Pequeño delay para que el estado se asiente y se ejecute la búsqueda
            setTimeout(() => {
                const btn = document.getElementById('btnBuscarManual')
                if (btn) btn.click()
            }, 500)
        }
    }, [])

    const buscarOrigen = async () => {
        if (!numeroOrigen) return
        setCargando(true)
        try {
            const res = await buscarOrigenPorNumero(numeroOrigen, tipoOrigen)

            if (res.success) {
                const origen = res.data
                // Consultar saldos
                const resSaldo = await obtenerSaldoPendiente(tipoOrigen, origen.id)

                if (resSaldo.success && resSaldo.saldos.length > 0) {
                    const s = resSaldo.saldos
                    setSaldos(s)
                    setOrigenSeleccionado({
                        id: origen.id,
                        numero: origen.numero,
                        cliente_id: origen.cliente_id,
                        cliente_nombre: origen.cliente_nombre
                    })
                    setItemsADespachar(s.map(item => ({
                        producto_id: item.producto_id,
                        nombre_producto: item.nombre_producto,
                        cantidad_total: item.cantidad_total,
                        cantidad_pendiente: item.cantidad_pendiente,
                        cantidad_a_despachar: 0
                    })))
                } else {
                    alert('No hay productos pendientes de despacho para este documento')
                }
            } else {
                alert(res.mensaje || 'No se encontró el documento origen')
            }
        } catch (error) {
            console.error(error)
            alert('Error al buscar el origen')
        } finally {
            setCargando(false)
        }
    }

    const actualizarCantidadDespacho = (idx, valor) => {
        const nuevos = [...itemsADespachar]
        const cant = parseFloat(valor) || 0
        if (cant > nuevos[idx].cantidad_pendiente) {
            alert(`No puede despachar más de ${nuevos[idx].cantidad_pendiente}`)
            return
        }
        nuevos[idx].cantidad_a_despachar = cant
        setItemsADespachar(nuevos)
    }

    const manejarGuardar = async (e) => {
        e.preventDefault()
        const itemsValidos = itemsADespachar.filter(i => i.cantidad_a_despachar > 0)
        if (itemsValidos.length === 0) return alert('Seleccione al menos un producto para despachar')

        setCargando(true)
        try {
            const res = await crearConduce({
                tipo_origen: tipoOrigen,
                origen_id: origenSeleccionado.id,
                numero_origen: origenSeleccionado.numero,
                cliente_id: origenSeleccionado.cliente_id,
                fecha_conduce: fechaConduce,
                chofer, vehiculo, placa, observaciones,
                productos: itemsValidos
            })

            if (res.success) {
                alert('Conduce creado')
                router.push('/admin/conduces')
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
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Nuevo Conduce</h1>
                    <p className={estilos.subtitulo}>Despacho de mercancía para clientes</p>
                </div>
                {origenSeleccionado && (
                    <button type="submit" disabled={cargando} className={estilos.btnNuevo}>
                        <ion-icon name="save-outline"></ion-icon>
                        <span>{cargando ? 'Generando...' : 'Guardar y Generar'}</span>
                    </button>
                )}
            </div>

            {!origenSeleccionado ? (
                <div className={estilos.cardBusqueda}>
                    <ion-icon name="search-outline" style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }}></ion-icon>
                    <h3>Buscar Venta o Cotización</h3>
                    <p className={estilos.subtitulo}>Ingrese el número del documento para cargar los pendientes</p>
                    <div className={estilos.filaBusqueda}>
                        <select value={tipoOrigen} onChange={e => setTipoOrigen(e.target.value)}>
                            <option value="venta">Venta / Factura</option>
                            <option value="cotizacion">Cotización</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Ej: V-2026-0001"
                            value={numeroOrigen}
                            onChange={e => setNumeroOrigen(e.target.value)}
                            className={estilos.inputBusqueda}
                            style={{ paddingLeft: '1rem' }}
                        />
                        <button id="btnBuscarManual" type="button" onClick={buscarOrigen} disabled={cargando} className={estilos.btnBuscar}>
                            {cargando ? 'Buscando...' : 'Cargar'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className={estilos.gridCuerpo}>
                    <div className={estilos.panel}>
                        <div className={estilos.infoPanel}>
                            <div className={estilos.datosSeccion}>
                                <h4 style={{ color: '#3b82f6', fontWeight: 800, marginBottom: '1rem' }}>DATOS DEL ORIGEN</h4>
                                <div className={estilos.infoGrid}>
                                    <div className={estilos.dato}>
                                        <label>Documento</label>
                                        <p style={{ textTransform: 'uppercase' }}>{tipoOrigen} #{origenSeleccionado.numero}</p>
                                    </div>
                                    <div className={estilos.dato}>
                                        <label>Cliente</label>
                                        <p>{origenSeleccionado.cliente_nombre}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setOrigenSeleccionado(null)} className={estilos.btnCambiar}>
                                    <ion-icon name="swap-horizontal-outline"></ion-icon> Cambiar origen
                                </button>
                            </div>

                            <div className={estilos.logisticaSeccion}>
                                <h4>Programación y Transporte</h4>
                                <div className={estilos.campo} style={{ marginBottom: '1rem' }}>
                                    <label>Fecha del Conduce</label>
                                    <input type="date" value={fechaConduce} onChange={e => setFechaConduce(e.target.value)} required />
                                </div>
                                <div className={estilos.campo}>
                                    <label>Nombre del Chofer</label>
                                    <input type="text" value={chofer} onChange={e => setChofer(e.target.value)} placeholder="Ej: Juan Pérez" />
                                </div>
                                <div className={estilos.filaCampos} style={{ marginTop: '1rem' }}>
                                    <div className={estilos.campo}>
                                        <label>Vehículo / Modelo</label>
                                        <input type="text" value={vehiculo} onChange={e => setVehiculo(e.target.value)} placeholder="Ej: Camión Daihatsu" />
                                    </div>
                                    <div className={estilos.campo}>
                                        <label>Placa</label>
                                        <input type="text" value={placa} onChange={e => setPlaca(e.target.value)} placeholder="L-123456" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={estilos.panel}>
                        <div className={estilos.tablaContenedor}>
                            <table className={estilos.tabla} style={{ border: 'none' }}>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th style={{ textAlign: 'center' }}>Pendiente</th>
                                        <th width="180" style={{ textAlign: 'right' }}>A Despachar Ahora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsADespachar.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>{item.nombre_producto}</td>
                                            <td style={{ textAlign: 'center' }} className={estilos.pendiente}>{item.cantidad_pendiente}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.cantidad_a_despachar}
                                                    onChange={e => actualizarCantidadDespacho(idx, e.target.value)}
                                                    min="0"
                                                    max={item.cantidad_pendiente}
                                                    step="0.01"
                                                    className={estilos.inputDespacho}
                                                    style={{ background: '#f8fafc' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={estilos.infoPanel} style={{ marginTop: '1rem' }}>
                            <div className={estilos.campo}>
                                <label>Observaciones del Despacho</label>
                                <textarea
                                    value={observaciones}
                                    onChange={e => setObservaciones(e.target.value)}
                                    placeholder="Notas de entrega, condiciones o instrucciones especiales..."
                                    rows="4"
                                    style={{ resize: 'none' }}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
