"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerDatosVenta, buscarProductos, buscarClientes, crearClienteRapido, crearVenta, obtenerCreditoCliente } from './servidor'
import estilos from './nueva.module.css'

function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}

export default function NuevaVenta() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [datosEmpresa, setDatosEmpresa] = useState(null)
    const [tiposComprobante, setTiposComprobante] = useState([])
    const [tiposDocumento, setTiposDocumento] = useState([])

    const [busquedaProducto, setBusquedaProducto] = useState('')
    const [productos, setProductos] = useState([])
    const [mostrarDropdownProductos, setMostrarDropdownProductos] = useState(false)
    const [productosVenta, setProductosVenta] = useState([])

    const [busquedaCliente, setBusquedaCliente] = useState('')
    const [inputClienteFocused, setInputClienteFocused] = useState(false)
    const busquedaClienteDebounced = useDebounce(busquedaCliente, 300)
    const [clientes, setClientes] = useState([])
    const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [mostrarModalCliente, setMostrarModalCliente] = useState(false)
    const [nombreClienteRapido, setNombreClienteRapido] = useState('')

    const [tipoComprobanteId, setTipoComprobanteId] = useState('')
    const [metodoPago, setMetodoPago] = useState('efectivo')
    const [efectivoRecibido, setEfectivoRecibido] = useState('')
    const [descuentoGlobal, setDescuentoGlobal] = useState('')

    const [mostrarModalExtra, setMostrarModalExtra] = useState(false)
    const [productosExtra, setProductosExtra] = useState([])
    const [mostrarExtras, setMostrarExtras] = useState(false)
    const [formExtra, setFormExtra] = useState({
        nombre: '', tipo: 'otro', cantidad: 1, precioUnitario: '', aplicaItbis: true, notas: ''
    })

    // 🔹 NUEVO: Estado para información del crédito del cliente
    const [infoCredito, setInfoCredito] = useState(null)
    const [cargandoCredito, setCargandoCredito] = useState(false)

    const tiposExtra = [
        { valor: 'ingrediente', nombre: 'Ingrediente Extra' },
        { valor: 'delivery', nombre: 'Delivery' },
        { valor: 'propina', nombre: 'Propina' },
        { valor: 'otro', nombre: 'Otro' }
    ]

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
        cargarDatosIniciales()
    }, [])

    useEffect(() => {
        const manejarClickFuera = (e) => {
            if (!e.target.closest(`.${estilos.busquedaProductoContainer}`)) {
                setMostrarDropdownProductos(false)
            }
            if (!e.target.closest(`.${estilos.busquedaClienteContainer}`)) {
                setMostrarDropdownClientes(false)
            }
        }
        document.addEventListener('click', manejarClickFuera)
        return () => document.removeEventListener('click', manejarClickFuera)
    }, [])

    // 🔹 NUEVO: Cargar información de crédito cuando cambia el cliente o método de pago
    useEffect(() => {
        if (metodoPago === 'credito' && clienteSeleccionado) {
            cargarInfoCredito(clienteSeleccionado.id)
        } else {
            setInfoCredito(null)
        }
    }, [metodoPago, clienteSeleccionado])

    const cargarDatosIniciales = async () => {
        try {
            const resultado = await obtenerDatosVenta()
            if (resultado.success) {
                setDatosEmpresa(resultado.empresa)
                setTiposComprobante(resultado.tiposComprobante)
                setTiposDocumento(resultado.tiposDocumento)
                if (resultado.tiposComprobante.length > 0) {
                    setTipoComprobanteId(resultado.tiposComprobante[0].id)
                }
            } else {
                alert(resultado.mensaje || 'Error al cargar datos')
                router.push('/admin/ventas')
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al cargar datos iniciales')
            router.push('/admin/ventas')
        } finally {
            setCargando(false)
        }
    }

    // 🔹 NUEVO: Función para cargar información de crédito del cliente
    const cargarInfoCredito = async (clienteId) => {
        setCargandoCredito(true)
        try {
            const resultado = await obtenerCreditoCliente(clienteId)

            if (resultado.success) {
                setInfoCredito(resultado.credito)
            } else {
                setInfoCredito(null)
                // Opcional: Mostrar advertencia si el cliente no tiene crédito
                if (resultado.mensaje === 'Cliente sin crédito configurado') {
                    // console.warn('Cliente sin crédito')
                }
            }
        } catch (error) {
            console.error('Error al cargar crédito:', error)
            setInfoCredito(null)
        } finally {
            setCargandoCredito(false)
        }
    }

    const manejarBusquedaProducto = async (e) => {
        const valor = e.target.value
        setBusquedaProducto(valor)
        if (valor.length >= 2) {
            try {
                const resultado = await buscarProductos(valor)
                if (resultado.success) {
                    setProductos(resultado.productos)
                    setMostrarDropdownProductos(true)
                }
            } catch (error) {
                console.error('Error al buscar productos:', error)
            }
        } else {
            setProductos([])
            setMostrarDropdownProductos(false)
        }
    }

    const agregarProducto = (producto) => {
        const existe = productosVenta.find(p => p.id === producto.id)
        if (existe) {
            setProductosVenta(productosVenta.map(p => p.id === producto.id ? {
                ...p,
                cantidad: p.cantidad + 1,
                cantidadDespachar: (p.cantidadDespachar || p.cantidad) + 1
            } : p))
        } else {
            setProductosVenta([...productosVenta, {
                ...producto,
                cantidad: 1,
                precio_venta_usado: parseFloat(producto.precio_venta),
                despacho_parcial: false,
                cantidadDespachar: 1,
                aplica_itbis: producto.aplica_itbis !== undefined ? producto.aplica_itbis : true
            }])
        }
        setBusquedaProducto('')
        setMostrarDropdownProductos(false)
    }

    const actualizarCantidad = (productoId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            eliminarProducto(productoId)
            return
        }
        const producto = productosVenta.find(p => p.id === productoId)
        if (producto && nuevaCantidad > producto.stock) {
            alert(`Stock disponible: ${producto.stock}`)
            return
        }
        setProductosVenta(productosVenta.map(p => {
            if (p.id === productoId) {
                const nuevaCantidadDespachar = p.despacho_parcial ? p.cantidadDespachar : nuevaCantidad
                return {
                    ...p,
                    cantidad: nuevaCantidad,
                    cantidadDespachar: nuevaCantidadDespachar > nuevaCantidad ? nuevaCantidad : nuevaCantidadDespachar
                }
            }
            return p
        }))
    }

    const actualizarPrecio = (productoId, nuevoPrecio) => {
        setProductosVenta(productosVenta.map(p => p.id === productoId ? {
            ...p,
            precio_venta_usado: parseFloat(nuevoPrecio) || 0
        } : p))
    }

    const toggleDespachoParcial = (productoId) => {
        setProductosVenta(productosVenta.map(p => {
            if (p.id === productoId) {
                const nuevoEstado = !p.despacho_parcial
                return {
                    ...p,
                    despacho_parcial: nuevoEstado,
                    cantidadDespachar: nuevoEstado ? Math.min(p.cantidad, p.cantidadDespachar) : p.cantidad
                }
            }
            return p
        }))
    }

    const toggleAplicaItbis = (productoId) => {
        setProductosVenta(productosVenta.map(p => p.id === productoId ? { ...p, aplica_itbis: !p.aplica_itbis } : p))
    }

    const actualizarCantidadDespachar = (productoId, nuevaCantidad) => {
        setProductosVenta(productosVenta.map(p => {
            if (p.id === productoId) {
                const cantidadValida = Math.min(Math.max(1, nuevaCantidad), p.cantidad)
                return { ...p, cantidadDespachar: cantidadValida }
            }
            return p
        }))
    }

    const eliminarProducto = (productoId) => {
        setProductosVenta(productosVenta.filter(p => p.id !== productoId))
    }

    useEffect(() => {
        if (clienteSeleccionado) {
            setClientes([])
            setMostrarDropdownClientes(false)
            return
        }

        if (inputClienteFocused && busquedaClienteDebounced.trim() === '') {
            buscarClientes('').then(res => {
                if (res.success) {
                    setClientes(res.clientes)
                    setMostrarDropdownClientes(true)
                }
            })
            return
        }

        if (busquedaClienteDebounced.trim().length >= 2) {
            buscarClientes(busquedaClienteDebounced).then(res => {
                if (res.success) {
                    setClientes(res.clientes)
                    setMostrarDropdownClientes(true)
                }
            })
            return
        }

        setClientes([])
        setMostrarDropdownClientes(false)

    }, [busquedaClienteDebounced, clienteSeleccionado, inputClienteFocused])

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente)
        setBusquedaCliente(cliente.nombre_completo)
        setMostrarDropdownClientes(false)
    }

    const limpiarCliente = () => {
        setClienteSeleccionado(null)
        setBusquedaCliente('')
        setInfoCredito(null)
        setInputClienteFocused(false) // 🔴 IMPORTANTE
    }

    const abrirModalClienteRapido = () => {
        setNombreClienteRapido('')
        setMostrarModalCliente(true)
    }

    const crearClienteRapidoHandler = async (e) => {
        e.preventDefault()
        if (!nombreClienteRapido.trim()) {
            alert('Ingresa el nombre del cliente')
            return
        }
        setProcesando(true)
        try {
            const resultado = await crearClienteRapido(nombreClienteRapido.trim())
            if (resultado.success) {
                setClienteSeleccionado(resultado.cliente)
                setBusquedaCliente(resultado.cliente.nombre)
                setMostrarModalCliente(false)
            } else {
                alert(resultado.mensaje || 'Error al crear cliente')
            }
        } catch (error) {
            console.error('Error al crear cliente:', error)
            alert('Error al crear cliente')
        } finally {
            setProcesando(false)
        }
    }

    const abrirModalExtra = () => {
        setFormExtra({
            nombre: '', tipo: 'otro', cantidad: 1, precioUnitario: '', aplicaItbis: true, notas: ''
        })
        setMostrarModalExtra(true)
    }

    const cerrarModalExtra = () => {
        setMostrarModalExtra(false)
    }

    const calcularTotalExtra = () => {
        const precio = parseFloat(formExtra.precioUnitario) || 0
        const cant = parseFloat(formExtra.cantidad) || 1
        const base = precio * cant
        const impuesto = formExtra.aplicaItbis ? (base * parseFloat(datosEmpresa?.impuesto_porcentaje || 18)) / 100 : 0
        return base + impuesto
    }

    const agregarProductoExtra = (e) => {
        e.preventDefault()
        if (!formExtra.nombre.trim()) {
            alert('Ingresa el nombre del producto extra')
            return
        }
        const precio = parseFloat(formExtra.precioUnitario) || 0
        if (precio <= 0) {
            alert('El precio debe ser mayor a cero')
            return
        }
        const nuevoExtra = {
            id: Date.now(),
            nombre: formExtra.nombre.trim(),
            tipo: formExtra.tipo,
            cantidad: parseFloat(formExtra.cantidad) || 1,
            precio_unitario: precio,
            aplica_itbis: formExtra.aplicaItbis,
            notas: formExtra.notas.trim() || null
        }
        setProductosExtra([...productosExtra, nuevoExtra])
        cerrarModalExtra()
    }

    const eliminarProductoExtra = (id) => {
        setProductosExtra(productosExtra.filter(e => e.id !== id))
    }

    const calcularTotales = () => {
        let subtotal = 0
        let descuento = parseFloat(descuentoGlobal) || 0

        productosVenta.forEach(producto => {
            const precio = producto.precio_venta_usado || 0
            const cantidad = producto.cantidad || 0
            subtotal += precio * cantidad
        })

        let subtotalExtras = 0
        productosExtra.forEach(extra => {
            subtotalExtras += extra.precio_unitario * extra.cantidad
        })

        let itbisProductos = 0
        productosVenta.forEach(producto => {
            if (producto.aplica_itbis) {
                const subtotalProd = producto.precio_venta_usado * producto.cantidad
                itbisProductos += (subtotalProd * parseFloat(datosEmpresa?.impuesto_porcentaje || 18)) / 100
            }
        })

        let itbisExtras = 0
        productosExtra.forEach(extra => {
            if (extra.aplica_itbis) {
                const subtotalExtra = extra.precio_unitario * extra.cantidad
                itbisExtras += (subtotalExtra * parseFloat(datosEmpresa?.impuesto_porcentaje || 18)) / 100
            }
        })

        const itbis = itbisProductos + itbisExtras
        const subtotalConImpuesto = subtotal + subtotalExtras + itbis
        const total = subtotalConImpuesto - descuento
        const montoGravado = subtotal + subtotalExtras

        return {
            subtotal: subtotal.toFixed(2),
            subtotalExtras: subtotalExtras.toFixed(2),
            descuento: descuento.toFixed(2),
            montoGravado: montoGravado.toFixed(2),
            itbis: itbis.toFixed(2),
            total: total.toFixed(2)
        }
    }

    const validarVenta = () => {
        if (productosVenta.length === 0 && productosExtra.length === 0) {
            alert('Agrega al menos un producto o extra a la venta')
            return false
        }
        if (!tipoComprobanteId) {
            alert('Selecciona un tipo de comprobante')
            return false
        }

        const tipoComprobante = tiposComprobante.find(t => t.id === parseInt(tipoComprobanteId))

        // 🔹 NUEVO: Validar que si es crédito, debe tener cliente
        if (metodoPago === 'credito') {
            if (!clienteSeleccionado) {
                alert('La venta a crédito requiere seleccionar un cliente')
                return false
            }

            // Validar que el cliente tenga crédito configurado
            if (!infoCredito) {
                alert('El cliente seleccionado no tiene configuración de crédito')
                return false
            }

            // Validar saldo disponible
            const total = parseFloat(calcularTotales().total)
            if (total > parseFloat(infoCredito.saldo_disponible)) {
                alert(`El monto de la venta (RD$ ${total.toFixed(2)}) excede el saldo disponible del cliente (RD$ ${parseFloat(infoCredito.saldo_disponible).toFixed(2)})`)
                return false
            }
        }

        if (tipoComprobante?.requiere_rnc && !clienteSeleccionado) {
            alert('Este tipo de comprobante requiere seleccionar un cliente')
            return false
        }

        for (const producto of productosVenta) {
            if (producto.despacho_parcial && producto.cantidadDespachar < 1) {
                alert(`El producto "${producto.nombre}" debe despachar al menos 1 unidad`)
                return false
            }
            if (producto.despacho_parcial && producto.cantidadDespachar > producto.cantidad) {
                alert(`El producto "${producto.nombre}" no puede despachar más de lo comprado`)
                return false
            }
        }

        // 🔹 NUEVO: Para crédito NO validar efectivo recibido
        if (metodoPago !== 'credito' && metodoPago === 'efectivo') {
            const recibido = parseFloat(efectivoRecibido) || 0
            const total = parseFloat(calcularTotales().total)
            if (recibido < total) {
                alert('El efectivo recibido debe ser mayor o igual al total')
                return false
            }
        }

        return true
    }

    const procesarVenta = async () => {
        if (!validarVenta()) return
        setProcesando(true)
        try {
            const totales = calcularTotales()
            let efectivoRecibidoFinal = null
            let cambioFinal = null

            // 🔹 NUEVO: Para crédito, no se envía efectivo recibido ni cambio
            if (metodoPago !== 'credito') {
                if (efectivoRecibido) {
                    const recibido = parseFloat(efectivoRecibido)
                    efectivoRecibidoFinal = recibido
                    if (metodoPago === 'efectivo') {
                        const total = parseFloat(totales.total)
                        cambioFinal = recibido - total
                    }
                }
            }

            const hayDespachoParcial = productosVenta.some(p => p.despacho_parcial)

            const datosVenta = {
                tipo_comprobante_id: parseInt(tipoComprobanteId),
                cliente_id: clienteSeleccionado?.id || null,
                productos: productosVenta.map(p => ({
                    producto_id: p.id,
                    cantidad: p.cantidad,
                    precio_unitario: p.precio_venta_usado,
                    despacho_parcial: p.despacho_parcial,
                    cantidad_despachar: p.despacho_parcial ? p.cantidadDespachar : p.cantidad
                })),
                extras: productosExtra.map(e => ({
                    nombre: e.nombre,
                    tipo: e.tipo,
                    cantidad: e.cantidad,
                    precio_unitario: e.precio_unitario,
                    aplica_itbis: e.aplica_itbis,
                    notas: e.notas
                })),
                subtotal: parseFloat(totales.subtotal) + parseFloat(totales.subtotalExtras),
                descuento: parseFloat(totales.descuento),
                monto_gravado: parseFloat(totales.montoGravado),
                itbis: parseFloat(totales.itbis),
                total: parseFloat(totales.total),
                metodo_pago: metodoPago,
                efectivo_recibido: efectivoRecibidoFinal,
                cambio: cambioFinal,
                notas: null,
                tipo_entrega: hayDespachoParcial ? 'parcial' : 'completa'
            }

            const resultado = await crearVenta(datosVenta)

            if (resultado.success) {
                router.push(`/admin/ventas/imprimir/${resultado.venta.id}`)
            } else {
                alert(resultado.mensaje || 'Error al crear la venta')
            }
        } catch (error) {
            console.error('Error al procesar venta:', error)
            alert('Error al procesar la venta')
        } finally {
            setProcesando(false)
        }
    }

    const totales = calcularTotales()
    const cambio = metodoPago === 'efectivo' && efectivoRecibido ? (parseFloat(efectivoRecibido) - parseFloat(totales.total)).toFixed(2) : '0.00'

    const getLabelMontoRecibido = () => {
        const labels = {
            efectivo: 'Efectivo Recibido',
            tarjeta_debito: 'Monto T. Débito',
            tarjeta_credito: 'Monto T. Crédito',
            transferencia: 'Monto Transferencia',
            cheque: 'Monto Cheque',
            credito: 'Monto a Crédito'
        }
        return labels[metodoPago] || 'Monto Recibido'
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando datos...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedorOptimizado} ${estilos[tema]}`}>
            {/* HEADER STICKY */}
            <div className={`${estilos.headerSticky} ${estilos[tema]}`}>
                <div className={estilos.headerLeft}>
                    <div className={estilos.pageHeader}>
                        <div className={estilos.pageTitle}>
                            <ion-icon name="cart-outline"></ion-icon>
                            <h1>Punto de Venta</h1>
                        </div>
                        <span className={estilos.pageSubtitle}>Registro y emisión de comprobantes</span>
                    </div>
                    <div className={estilos.infoHeader}>
                        <span className={estilos.labelTotal}>Total:</span>
                        <strong className={estilos.montoTotal}>RD$ {totales.total}</strong>
                        {productosVenta.length > 0 && (
                            <span className={estilos.cantidadItems}>
                                ({productosVenta.length} {productosVenta.length === 1 ? 'producto' : 'productos'})
                            </span>
                        )}
                    </div>
                </div>

                <div className={estilos.headerActions}>
                    <button
                        onClick={() => router.push('/admin/ventas')}
                        className={estilos.btnCancelarHeader}
                        disabled={procesando}
                    >
                        <ion-icon name="close-outline"></ion-icon>
                        <span>Cancelar</span>
                    </button>

                    <button
                        onClick={procesarVenta}
                        disabled={procesando || (productosVenta.length === 0 && productosExtra.length === 0)}
                        className={estilos.btnProcesarHeader}
                    >
                        {procesando ? (
                            <>
                                <ion-icon name="hourglass-outline" className={estilos.iconRotate}></ion-icon>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <ion-icon name="checkmark-circle-outline"></ion-icon>
                                <span>Procesar Venta</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* BARRA DE CONFIGURACIÓN - COMPROBANTE Y MÉTODO DE PAGO + CLIENTE */}
            <div className={`${estilos.barraConfig} ${estilos[tema]}`}>
                {/* SECCIÓN IZQUIERDA: Comprobante y Método de Pago */}
                <div className={estilos.seccionConfigIzq}>
                    {/* Comprobante */}
                    <div className={estilos.grupoConfig}>
                        <label className={estilos.labelConfig}>
                            <ion-icon name="document-text-outline"></ion-icon>
                            <span>Comprobante</span>
                        </label>
                        <select
                            value={tipoComprobanteId}
                            onChange={(e) => setTipoComprobanteId(e.target.value)}
                            className={estilos.selectConfig}
                        >
                            {tiposComprobante.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.codigo} - {tipo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Métodos de Pago */}
                    <div className={estilos.grupoConfig}>
                        <label className={estilos.labelConfig}>
                            <ion-icon name="wallet-outline"></ion-icon>
                            <span>Método de Pago</span>
                        </label>
                        <div className={estilos.metodosPagoGrid}>
                            <button
                                type="button"
                                className={`${estilos.metodoPagoBtn} ${estilos.efectivo} ${metodoPago === 'efectivo' ? estilos.activo : ''}`}
                                onClick={() => setMetodoPago('efectivo')}
                                title="Efectivo"
                            >
                                <ion-icon name="cash-outline"></ion-icon>
                                <span>Efectivo</span>
                            </button>

                            <button
                                type="button"
                                className={`${estilos.metodoPagoBtn} ${estilos.debito} ${metodoPago === 'tarjeta_debito' ? estilos.activo : ''}`}
                                onClick={() => setMetodoPago('tarjeta_debito')}
                                title="Tarjeta de Débito"
                            >
                                <ion-icon name="card-outline"></ion-icon>
                                <span>Débito</span>
                            </button>

                            <button
                                type="button"
                                className={`${estilos.metodoPagoBtn} ${estilos.tarjetaCredito} ${metodoPago === 'tarjeta_credito' ? estilos.activo : ''}`}
                                onClick={() => setMetodoPago('tarjeta_credito')}
                                title="Tarjeta de Crédito"
                            >
                                <ion-icon name="card-outline"></ion-icon>
                                <span>T. Crédito</span>
                            </button>

                            <button
                                type="button"
                                className={`${estilos.metodoPagoBtn} ${estilos.transferencia} ${metodoPago === 'transferencia' ? estilos.activo : ''}`}
                                onClick={() => setMetodoPago('transferencia')}
                                title="Transferencia"
                            >
                                <ion-icon name="swap-horizontal-outline"></ion-icon>
                                <span>Transfer.</span>
                            </button>

                            <button
                                type="button"
                                className={`${estilos.metodoPagoBtn} ${estilos.cheque} ${metodoPago === 'cheque' ? estilos.activo : ''}`}
                                onClick={() => setMetodoPago('cheque')}
                                title="Cheque"
                            >
                                <ion-icon name="receipt-outline"></ion-icon>
                                <span>Cheque</span>
                            </button>

                            {/* 🔹 NUEVO: Botón de Crédito */}
                            <button
                                type="button"
                                className={`${estilos.metodoPagoBtn} ${estilos.credito} ${metodoPago === 'credito' ? estilos.activo : ''}`}
                                onClick={() => setMetodoPago('credito')}
                                title="Venta a Crédito"
                            >
                                <ion-icon name="time-outline"></ion-icon>
                                <span>Crédito</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DERECHA: Cliente */}
                {/* SECCIÓN DERECHA: Cliente */}
                <div className={estilos.seccionConfigDer}>
                    <div className={estilos.grupoConfig}>
                        <label className={estilos.labelConfig}>
                            <ion-icon name="person-outline"></ion-icon>
                            <span>Cliente</span>
                        </label>

                        <div className={estilos.clienteControles}>
                            <div className={estilos.busquedaClienteContainer}>
                                <div className={estilos.busquedaCliente}>

                                    {/* 🔍 Input de búsqueda */}
                                    <ion-icon name="search-outline" />

                                    <input
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={busquedaCliente}
                                        className={estilos.inputBusquedaCliente}
                                        onFocus={() => setInputClienteFocused(true)}
                                        onChange={(e) => {
                                            if (clienteSeleccionado) return
                                            setBusquedaCliente(e.target.value)
                                        }}
                                    />

                                    {/* ❌ Botón limpiar */}
                                    {clienteSeleccionado && (
                                        <button
                                            type="button"
                                            className={estilos.btnLimpiarCliente}
                                            title="Cambiar cliente"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                limpiarCliente()
                                            }}
                                        >
                                            <ion-icon name="close-circle" />
                                        </button>
                                    )}
                                </div>

                                {/* 📋 Dropdown clientes */}
                                {mostrarDropdownClientes && clientes.length > 0 && !clienteSeleccionado && (
                                    <div className={`${estilos.dropdownClientes} ${estilos[tema]}`}>
                                        {clientes.map(cliente => (
                                            <div
                                                key={cliente.id}
                                                className={estilos.dropdownItemCliente}
                                                onClick={() => seleccionarCliente(cliente)}
                                            >
                                                <div className={estilos.clienteInfo}>
                  <span className={estilos.clienteNombre}>
                    {cliente.nombre_completo}
                  </span>
                                                    <span className={estilos.clienteDoc}>
                    {cliente.tipo_documento}: {cliente.numero_documento}
                  </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ➕ Cliente rápido */}
                            <button
                                type="button"
                                className={estilos.btnClienteRapido}
                                onClick={abrirModalClienteRapido}
                            >
                                <ion-icon name="person-add-outline" />
                                <span>Rápido</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔹 NUEVO: Alerta de Crédito cuando el método es crédito */}
            {metodoPago === 'credito' && (
                <div className={`${estilos.alertaCredito} ${estilos[tema]}`}>
                    {!clienteSeleccionado ? (
                        <div className={estilos.alertaWarning}>
                            <ion-icon name="warning-outline"></ion-icon>
                            <span>Debes seleccionar un cliente para realizar una venta a crédito</span>
                        </div>
                    ) : cargandoCredito ? (
                        <div className={estilos.alertaInfo}>
                            <ion-icon name="hourglass-outline" className={estilos.iconRotate}></ion-icon>
                            <span>Verificando crédito del cliente...</span>
                        </div>
                    ) : !infoCredito ? (
                        <div className={estilos.alertaDanger}>
                            <ion-icon name="close-circle-outline"></ion-icon>
                            <span>El cliente no tiene configuración de crédito. No se puede procesar la venta.</span>
                        </div>
                    ) : (
                        <div className={estilos.alertaSuccess}>
                            <div className={estilos.infoCreditoGrid}>
                                <div className={estilos.itemCredito}>
                                    <span className={estilos.labelCredito}>Límite:</span>
                                    <strong className={estilos.valorCredito}>
                                        RD$ {parseFloat(infoCredito.limite_credito).toFixed(2)}
                                    </strong>
                                </div>
                                <div className={estilos.itemCredito}>
                                    <span className={estilos.labelCredito}>Disponible:</span>
                                    <strong className={`${estilos.valorCredito} ${estilos.disponible}`}>
                                        RD$ {parseFloat(infoCredito.saldo_disponible).toFixed(2)}
                                    </strong>
                                </div>
                                <div className={estilos.itemCredito}>
                                    <span className={estilos.labelCredito}>Clasificación:</span>
                                    <span className={`${estilos.badgeClasificacion} ${estilos[infoCredito.clasificacion]}`}>
                                        {infoCredito.clasificacion}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LAYOUT PRINCIPAL */}
            <div className={estilos.layoutPrincipal}>
                {/* COLUMNA IZQUIERDA - PRODUCTOS */}
                <div className={estilos.colProductos}>
                    {/* Búsqueda de productos */}
                    <div className={`${estilos.seccionBusqueda} ${estilos[tema]}`}>
                        <div className={estilos.busquedaProductoContainer}>
                            <div className={estilos.busquedaProducto}>
                                <ion-icon name="search-outline"></ion-icon>
                                <input
                                    type="text"
                                    placeholder="Buscar producto por nombre, código o SKU..."
                                    value={busquedaProducto}
                                    onChange={manejarBusquedaProducto}
                                    className={estilos.inputBusquedaProducto}
                                />
                            </div>

                            {mostrarDropdownProductos && productos.length > 0 && (
                                <div className={`${estilos.dropdownProductos} ${estilos[tema]}`}>
                                    {productos.map(producto => (
                                        <div
                                            key={producto.id}
                                            className={estilos.dropdownItem}
                                            onClick={() => agregarProducto(producto)}
                                        >
                                            <div className={estilos.productoInfo}>
                                                <span className={estilos.productoNombre}>{producto.nombre}</span>
                                                <span className={estilos.productoCodigo}>
                                                    {producto.codigo_barras || producto.sku}
                                                </span>
                                            </div>
                                            <div className={estilos.productoDatos}>
                                                <span className={estilos.productoStock}>Stock: {producto.stock}</span>
                                                <span className={estilos.productoPrecio}>
                                                    RD$ {parseFloat(producto.precio_venta).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla de productos */}
                    <div className={`${estilos.tablaProductos} ${estilos[tema]}`}>
                        {productosVenta.length === 0 ? (
                            <div className={estilos.estadoVacio}>
                                <ion-icon name="cart-outline"></ion-icon>
                                <p>No hay productos agregados</p>
                                <span>Busca y agrega productos para iniciar la venta</span>
                            </div>
                        ) : (
                            <>
                                <div className={estilos.tablaHeader}>
                                    <span>Producto</span>
                                    <span>Cant.</span>
                                    <span>Precio</span>
                                    <span>Subtotal</span>
                                    <span></span>
                                </div>

                                <div className={estilos.tablaBody}>
                                    {productosVenta.map(producto => (
                                        <div key={producto.id}>
                                            <div className={`${estilos.filaProducto} ${estilos[tema]}`}>
                                                <div className={estilos.infoProductoFila}>
                                                    <span className={estilos.nombreProductoFila}>{producto.nombre}</span>
                                                    <span className={estilos.detalleProductoFila}>
                                                        Stock: {producto.stock} | {producto.codigo_barras || producto.sku}
                                                    </span>
                                                </div>

                                                <div className={estilos.controlCantidadCompacto}>
                                                    <button
                                                        onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                                                        className={estilos.btnMenos}
                                                        type="button"
                                                    >
                                                        <ion-icon name="remove"></ion-icon>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={producto.stock}
                                                        value={producto.cantidad}
                                                        onChange={(e) => actualizarCantidad(producto.id, parseInt(e.target.value) || 1)}
                                                        className={estilos.inputCantidadCompacto}
                                                    />
                                                    <button
                                                        onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                                                        className={estilos.btnMas}
                                                        disabled={producto.cantidad >= producto.stock}
                                                        type="button"
                                                    >
                                                        <ion-icon name="add"></ion-icon>
                                                    </button>
                                                </div>

                                                <div className={estilos.controlPrecioCompacto}>
                                                    <span className={estilos.simboloMoneda}>RD$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={producto.precio_venta_usado}
                                                        onChange={(e) => actualizarPrecio(producto.id, e.target.value)}
                                                        className={estilos.inputPrecioCompacto}
                                                    />
                                                </div>

                                                <span className={estilos.subtotalProducto}>
                                                    RD$ {(producto.cantidad * producto.precio_venta_usado).toFixed(2)}
                                                </span>

                                                <button
                                                    onClick={() => eliminarProducto(producto.id)}
                                                    className={estilos.btnEliminarCompacto}
                                                    type="button"
                                                    title="Eliminar producto"
                                                >
                                                    <ion-icon name="trash-outline"></ion-icon>
                                                </button>
                                            </div>

                                            {/* Opciones adicionales */}
                                            <details className={estilos.opcionesAdicionales}>
                                                <summary className={estilos.summaryOpciones}>
                                                    <ion-icon name="chevron-forward-outline"></ion-icon>
                                                    Opciones adicionales
                                                </summary>
                                                <div className={estilos.contenidoOpciones}>
                                                    <label className={estilos.checkboxOpcion}>
                                                        <input
                                                            type="checkbox"
                                                            checked={producto.despacho_parcial}
                                                            onChange={() => toggleDespachoParcial(producto.id)}
                                                        />
                                                        <span>Despacho Parcial</span>
                                                    </label>

                                                    <label className={estilos.checkboxOpcion}>
                                                        <input
                                                            type="checkbox"
                                                            checked={producto.aplica_itbis !== false}
                                                            onChange={() => toggleAplicaItbis(producto.id)}
                                                        />
                                                        <span>
                                                            Aplicar {datosEmpresa?.impuesto_nombre || 'ITBIS'}
                                                            ({datosEmpresa?.impuesto_porcentaje || 18}%)
                                                        </span>
                                                    </label>

                                                    {producto.despacho_parcial && (
                                                        <div className={estilos.controlDespachoCompacto}>
                                                            <label>Entregar ahora:</label>
                                                            <div className={estilos.inputGroupDespacho}>
                                                                <button
                                                                    onClick={() => actualizarCantidadDespachar(producto.id, producto.cantidadDespachar - 1)}
                                                                    disabled={producto.cantidadDespachar <= 1}
                                                                    type="button"
                                                                >
                                                                    <ion-icon name="remove"></ion-icon>
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={producto.cantidad}
                                                                    value={producto.cantidadDespachar || 1}
                                                                    onChange={(e) => actualizarCantidadDespachar(producto.id, parseInt(e.target.value) || 1)}
                                                                />
                                                                <button
                                                                    onClick={() => actualizarCantidadDespachar(producto.id, producto.cantidadDespachar + 1)}
                                                                    disabled={producto.cantidadDespachar >= producto.cantidad}
                                                                    type="button"
                                                                >
                                                                    <ion-icon name="add"></ion-icon>
                                                                </button>
                                                                <span>de {producto.cantidad}</span>
                                                            </div>
                                                            <span className={estilos.textoPendiente}>
                                                                Pendiente: {producto.cantidad - producto.cantidadDespachar}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sección Extras */}
                    <details
                        className={`${estilos.seccionExtras} ${estilos[tema]}`}
                        open={mostrarExtras}
                        onToggle={(e) => setMostrarExtras(e.target.open)}
                    >
                        <summary className={estilos.summaryExtras}>
                            <div className={estilos.summaryLeft}>
                                <ion-icon name="chevron-forward-outline"></ion-icon>
                                <ion-icon name="add-circle-outline"></ion-icon>
                                <span>Productos Extra</span>
                                {productosExtra.length > 0 && (
                                    <span className={estilos.badgeExtras}>
                                        {productosExtra.length}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    abrirModalExtra()
                                }}
                                className={estilos.btnAgregarExtraCompacto}
                            >
                                <ion-icon name="add"></ion-icon>
                                Agregar
                            </button>
                        </summary>

                        <div className={estilos.contenidoExtras}>
                            {productosExtra.length === 0 ? (
                                <p className={estilos.textoSinExtras}>No hay productos extra agregados</p>
                            ) : (
                                <div className={estilos.listaExtrasCompacta}>
                                    {productosExtra.map((extra) => {
                                        const cantidad = parseFloat(extra.cantidad) || 1
                                        const precio = parseFloat(extra.precio_unitario) || 0
                                        const base = cantidad * precio
                                        const impuesto = extra.aplica_itbis
                                            ? (base * parseFloat(datosEmpresa?.impuesto_porcentaje || 18)) / 100
                                            : 0
                                        const total = base + impuesto

                                        return (
                                            <div key={extra.id} className={`${estilos.itemExtraCompacto} ${estilos[tema]}`}>
                                                <div className={estilos.infoExtraCompacto}>
                                                    <span className={estilos.nombreExtraCompacto}>{extra.nombre}</span>
                                                    <span className={estilos.detalleExtraCompacto}>
                                                        {cantidad} x RD$ {precio.toFixed(2)}
                                                        {extra.aplica_itbis && ` + ${datosEmpresa?.impuesto_porcentaje || 18}%`}
                                                    </span>
                                                </div>
                                                <span className={estilos.totalExtraCompacto}>RD$ {total.toFixed(2)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarProductoExtra(extra.id)}
                                                    className={estilos.btnEliminarExtraCompacto}
                                                >
                                                    <ion-icon name="close-circle"></ion-icon>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </details>
                </div>

                {/* COLUMNA DERECHA - RESUMEN */}
                <aside className={`${estilos.colResumen} ${estilos[tema]}`}>
                    <div className={estilos.resumenSticky}>
                        <h3 className={estilos.tituloResumen}>
                            <ion-icon name="receipt-outline"></ion-icon>
                            Resumen de Venta
                        </h3>

                        {/* 🔹 MODIFICADO: Solo mostrar efectivo recibido si NO es crédito */}
                        {metodoPago !== 'credito' && (
                            <div className={estilos.camposVenta}>
                                <div className={estilos.campoCompacto}>
                                    <label>{getLabelMontoRecibido()}</label>
                                    <div className={estilos.inputConIcono}>
                                        <span className={estilos.iconoMoneda}>RD$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={efectivoRecibido}
                                            onChange={(e) => setEfectivoRecibido(e.target.value)}
                                            placeholder="0.00"
                                            className={estilos.inputMoneda}
                                        />
                                    </div>
                                </div>

                                {metodoPago === 'efectivo' && efectivoRecibido && parseFloat(cambio) >= 0 && (
                                    <div className={`${estilos.cambioInfo} ${estilos[tema]}`}>
                                        <span>Cambio:</span>
                                        <strong>RD$ {cambio}</strong>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={estilos.camposVenta}>
                            <div className={estilos.campoCompacto}>
                                <label>Descuento Global</label>
                                <div className={estilos.inputConIcono}>
                                    <span className={estilos.iconoMoneda}>RD$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={descuentoGlobal}
                                        onChange={(e) => setDescuentoGlobal(e.target.value)}
                                        placeholder="0.00"
                                        className={estilos.inputMoneda}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Totales */}
                        <div className={estilos.desgloseTotales}>
                            <div className={estilos.lineaTotalCompacta}>
                                <span>Subtotal:</span>
                                <span>RD$ {totales.subtotal}</span>
                            </div>

                            {parseFloat(totales.subtotalExtras) > 0 && (
                                <div className={estilos.lineaTotalCompacta}>
                                    <span>Extras:</span>
                                    <span>RD$ {totales.subtotalExtras}</span>
                                </div>
                            )}

                            <div className={estilos.lineaTotalCompacta}>
                                <span>{datosEmpresa?.impuesto_nombre || 'ITBIS'}:</span>
                                <span>RD$ {totales.itbis}</span>
                            </div>

                            {parseFloat(totales.descuento) > 0 && (
                                <div className={`${estilos.lineaTotalCompacta} ${estilos.descuento}`}>
                                    <span>Descuento:</span>
                                    <span>- RD$ {totales.descuento}</span>
                                </div>
                            )}

                            <div className={estilos.separadorTotal}></div>

                            <div className={estilos.totalFinal}>
                                <span>Total a Pagar:</span>
                                <span>RD$ {totales.total}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* MODALES */}
            {mostrarModalCliente && (
                <div className={estilos.modalOverlay} onClick={() => !procesando && setMostrarModalCliente(false)}>
                    <div className={`${estilos.modal} ${estilos[tema]}`} onClick={(e) => e.stopPropagation()}>
                        <div className={estilos.modalHeader}>
                            <h2>Cliente Rápido</h2>
                            <button
                                className={estilos.btnCerrarModal}
                                onClick={() => setMostrarModalCliente(false)}
                                disabled={procesando}
                                type="button"
                            >
                                <ion-icon name="close-outline"></ion-icon>
                            </button>
                        </div>

                        <form onSubmit={crearClienteRapidoHandler} className={estilos.modalBody}>
                            <p className={estilos.infoModal}>
                                Crea un cliente rápido con solo el nombre. Podrás completar sus datos más tarde.
                            </p>

                            <div className={estilos.grupoInput}>
                                <label>Nombre del Cliente *</label>
                                <input
                                    type="text"
                                    value={nombreClienteRapido}
                                    onChange={(e) => setNombreClienteRapido(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className={estilos.input}
                                    required
                                    disabled={procesando}
                                    autoFocus
                                />
                            </div>

                            <div className={estilos.modalFooter}>
                                <button
                                    type="button"
                                    className={estilos.btnCancelarModal}
                                    onClick={() => setMostrarModalCliente(false)}
                                    disabled={procesando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={estilos.btnGuardarModal}
                                    disabled={procesando}
                                >
                                    {procesando ? 'Creando...' : 'Crear Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {mostrarModalExtra && (
                <div className={estilos.modalOverlay} onClick={cerrarModalExtra}>
                    <div className={`${estilos.modalExtra} ${estilos[tema]}`} onClick={(e) => e.stopPropagation()}>
                        <div className={estilos.modalHeader}>
                            <h3>Agregar Producto Extra</h3>
                            <button onClick={cerrarModalExtra} className={estilos.btnCerrarModal} type="button">
                                <ion-icon name="close-outline"></ion-icon>
                            </button>
                        </div>

                        <form onSubmit={agregarProductoExtra} className={estilos.formularioExtra}>
                            <div className={estilos.grupoExtra}>
                                <label className={estilos.etiquetaExtra}>
                                    Nombre del Extra <span className={estilos.requeridoExtra}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formExtra.nombre}
                                    onChange={(e) => setFormExtra({ ...formExtra, nombre: e.target.value })}
                                    className={estilos.inputExtra}
                                    placeholder="Ej: Pepperoni extra, Delivery, Propina..."
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className={estilos.grupoExtra}>
                                <label className={estilos.etiquetaExtra}>Tipo</label>
                                <select
                                    value={formExtra.tipo}
                                    onChange={(e) => setFormExtra({ ...formExtra, tipo: e.target.value })}
                                    className={estilos.selectExtra}
                                >
                                    {tiposExtra.map(t => (
                                        <option key={t.valor} value={t.valor}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={estilos.filaExtra}>
                                <div className={estilos.grupoExtra}>
                                    <label className={estilos.etiquetaExtra}>
                                        Cantidad <span className={estilos.requeridoExtra}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formExtra.cantidad}
                                        onChange={(e) => setFormExtra({
                                            ...formExtra,
                                            cantidad: parseFloat(e.target.value) || 1
                                        })}
                                        className={estilos.inputExtra}
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className={estilos.grupoExtra}>
                                    <label className={estilos.etiquetaExtra}>
                                        Precio Unitario <span className={estilos.requeridoExtra}>*</span>
                                    </label>
                                    <div className={estilos.inputWrapperExtra}>
                                        <span className={estilos.prefijoExtra}>RD$</span>
                                        <input
                                            type="number"
                                            value={formExtra.precioUnitario}
                                            onChange={(e) => setFormExtra({
                                                ...formExtra,
                                                precioUnitario: e.target.value
                                            })}
                                            className={estilos.inputExtraPrecio}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={estilos.grupoExtra}>
                                <label className={estilos.checkboxLabelExtra}>
                                    <input
                                        type="checkbox"
                                        checked={formExtra.aplicaItbis}
                                        onChange={(e) => setFormExtra({ ...formExtra, aplicaItbis: e.target.checked })}
                                        className={estilos.checkboxExtra}
                                    />
                                    <span>Aplica {datosEmpresa?.impuesto_porcentaje || 18}% de impuesto</span>
                                </label>
                            </div>

                            {formExtra.precioUnitario && (
                                <div className={estilos.resumenExtra}>
                                    <div className={estilos.lineaResumenExtra}>
                                        <span>Subtotal:</span>
                                        <span>RD$ {((parseFloat(formExtra.precioUnitario) || 0) * (parseFloat(formExtra.cantidad) || 1)).toFixed(2)}</span>
                                    </div>
                                    {formExtra.aplicaItbis && (
                                        <div className={estilos.lineaResumenExtra}>
                                            <span>Impuesto ({datosEmpresa?.impuesto_porcentaje || 18}%):</span>
                                            <span>RD$ {(((parseFloat(formExtra.precioUnitario) || 0) * (parseFloat(formExtra.cantidad) || 1)) * (datosEmpresa?.impuesto_porcentaje || 18) / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className={estilos.lineaResumenTotalExtra}>
                                        <span>Total:</span>
                                        <span>RD$ {calcularTotalExtra().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <div className={estilos.grupoExtra}>
                                <label className={estilos.etiquetaExtra}>Notas (Opcional)</label>
                                <textarea
                                    value={formExtra.notas}
                                    onChange={(e) => setFormExtra({ ...formExtra, notas: e.target.value })}
                                    className={estilos.textareaExtra}
                                    placeholder="Observaciones adicionales..."
                                    rows="2"
                                />
                            </div>

                            <div className={estilos.accionesExtra}>
                                <button
                                    type="button"
                                    onClick={cerrarModalExtra}
                                    className={estilos.botonCancelarExtra}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={estilos.botonAgregarExtraModal}
                                    disabled={!formExtra.nombre.trim() || !formExtra.precioUnitario || parseFloat(formExtra.precioUnitario) <= 0}
                                >
                                    <ion-icon name="add-circle-outline"></ion-icon>
                                    Agregar Extra
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}