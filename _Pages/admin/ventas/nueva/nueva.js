"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerDatosVenta, buscarProductos, buscarClientes, crearClienteRapido, crearVenta } from './servidor'
import estilos from './nueva.module.css'

export default function NuevaVentaOptimizada() {
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
        nombre: '',
        tipo: 'otro',
        cantidad: 1,
        precioUnitario: '',
        aplicaItbis: true,
        notas: ''
    })

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
            setProductosVenta(productosVenta.map(p => 
                p.id === producto.id 
                    ? { ...p, cantidad: p.cantidad + 1, cantidadDespachar: (p.cantidadDespachar || p.cantidad) + 1 }
                    : p
            ))
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
        setProductosVenta(productosVenta.map(p =>
            p.id === productoId ? { ...p, precio_venta_usado: parseFloat(nuevoPrecio) || 0 } : p
        ))
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
        setProductosVenta(productosVenta.map(p =>
            p.id === productoId ? { ...p, aplica_itbis: !p.aplica_itbis } : p
        ))
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

    const manejarBusquedaCliente = async (e) => {
        const valor = e.target.value
        setBusquedaCliente(valor)
        if (valor.length >= 2) {
            try {
                const resultado = await buscarClientes(valor)
                if (resultado.success) {
                    setClientes(resultado.clientes)
                    setMostrarDropdownClientes(true)
                }
            } catch (error) {
                console.error('Error al buscar clientes:', error)
            }
        } else {
            setClientes([])
            setMostrarDropdownClientes(false)
        }
    }

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente)
        setBusquedaCliente(cliente.nombre)
        setMostrarDropdownClientes(false)
    }

    const limpiarCliente = () => {
        setClienteSeleccionado(null)
        setBusquedaCliente('')
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
            nombre: '',
            tipo: 'otro',
            cantidad: 1,
            precioUnitario: '',
            aplicaItbis: true,
            notas: ''
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

        const subtotalConDescuento = subtotal + subtotalExtras - descuento
        const montoGravado = subtotalConDescuento
        
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
        const total = subtotalConDescuento + itbis

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
        if (metodoPago === 'efectivo') {
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

            if (efectivoRecibido) {
                const recibido = parseFloat(efectivoRecibido)
                efectivoRecibidoFinal = recibido
                if (metodoPago === 'efectivo') {
                    const total = parseFloat(totales.total)
                    cambioFinal = recibido - total
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
    const cambio = metodoPago === 'efectivo' && efectivoRecibido
        ? (parseFloat(efectivoRecibido) - parseFloat(totales.total)).toFixed(2)
        : '0.00'

    const getLabelMontoRecibido = () => {
        const labels = {
            efectivo: 'Efectivo Recibido',
            tarjeta_debito: 'Monto T. Débito',
            tarjeta_credito: 'Monto T. Crédito',
            transferencia: 'Monto Transferencia',
            cheque: 'Monto Cheque'
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
            {/* TÍTULO DE LA PÁGINA */}
        
        <div className={estilos.pageHeader}>
            <div className={estilos.pageTitle}>
                <ion-icon name="cart-outline"></ion-icon>
                <h1>Registro de Venta</h1>
            </div>
            <span className={estilos.pageSubtitle}>
                Punto de venta · Emisión de comprobantes
            </span>
        </div>
            {/* HEADER STICKY CON ACCIONES PRINCIPALES */}
            <div className={`${estilos.headerSticky} ${estilos[tema]}`}>
                <div className={estilos.headerLeft}>
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

            {/* BARRA DE INFORMACIÓN CONTEXTUAL */}
            <div className={`${estilos.barraInfo} ${estilos[tema]}`}>
                <div className={estilos.infoCompacta}>
                    <div className={estilos.itemInfo}>
                        <ion-icon name="person-outline"></ion-icon>
                        <span>Cliente:</span>
                        <strong>{clienteSeleccionado ? clienteSeleccionado.nombre : 'Sin cliente'}</strong>
                    </div>

                    <div className={estilos.separadorVertical}></div>

                    <div className={estilos.itemInfo}>
                        <ion-icon name="document-text-outline"></ion-icon>
                        <span>Comprobante:</span>
                        <select
                            value={tipoComprobanteId}
                            onChange={(e) => setTipoComprobanteId(e.target.value)}
                            className={estilos.selectCompacto}
                        >
                            {tiposComprobante.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.codigo} - {tipo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={estilos.separadorVertical}></div>

                    <div className={estilos.metodosPagoWrapper}>
                    <span className={estilos.labelMetodoPago}>Metodo de Pago</span>

                    <div className={estilos.metodosPagoGrid}>
                        <button
                            type="button"
                            className={`${estilos.metodoPagoItem} ${estilos.efectivo} ${metodoPago === 'efectivo' ? estilos.activo : ''}`}
                            onClick={() => setMetodoPago('efectivo')}
                        >
                            <ion-icon name="cash-outline"></ion-icon>
                            <span>Efectivo</span>
                        </button>

                        <button
                            type="button"
                            className={`${estilos.metodoPagoItem} ${estilos.debito} ${metodoPago === 'tarjeta_debito' ? estilos.activo : ''}`}
                            onClick={() => setMetodoPago('tarjeta_debito')}
                        >
                            <ion-icon name="card-outline"></ion-icon>
                            <span>Débito</span>
                        </button>

                        <button
                            type="button"
                            className={`${estilos.metodoPagoItem} ${estilos.credito} ${metodoPago === 'tarjeta_credito' ? estilos.activo : ''}`}
                            onClick={() => setMetodoPago('tarjeta_credito')}
                        >
                            <ion-icon name="card-outline"></ion-icon>
                            <span>Crédito</span>
                        </button>

                        <button
                            type="button"
                            className={`${estilos.metodoPagoItem} ${estilos.transferencia} ${metodoPago === 'transferencia' ? estilos.activo : ''}`}
                            onClick={() => setMetodoPago('transferencia')}
                        >
                            <ion-icon name="swap-horizontal-outline"></ion-icon>
                            <span>Transfer.</span>
                        </button>

                        <button
                            type="button"
                            className={`${estilos.metodoPagoItem} ${estilos.cheque} ${metodoPago === 'cheque' ? estilos.activo : ''}`}
                            onClick={() => setMetodoPago('cheque')}
                        >
                            <ion-icon name="document-text-outline"></ion-icon>
                            <span>Cheque</span>
                        </button>
                    </div>
                </div>
                </div>
                 {/* BLOQUE CLIENTE */}
    <div className={estilos.bloqueClienteBarra}>
        {/* BUSCAR CLIENTE (IZQUIERDA) */}
        <div className={estilos.busquedaClienteContainer}>
            <div className={estilos.busquedaCliente}>
                <ion-icon name="search-outline"></ion-icon>
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={busquedaCliente}
                    onChange={manejarBusquedaCliente}
                    className={estilos.inputBusquedaCompacto}
                    disabled={!!clienteSeleccionado}
                />

                {clienteSeleccionado && (
                    <button
                        type="button"
                        onClick={limpiarCliente}
                        className={estilos.btnLimpiarCliente}
                        title="Cambiar cliente"
                    >
                        <ion-icon name="close-circle"></ion-icon>
                    </button>
                )}
            </div>

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
                                    {cliente.nombre}
                                </span>
                                <span className={estilos.clienteDoc}>
                                    {cliente.numero_documento}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* CLIENTE RÁPIDO (DERECHA) */}
        <button 
            onClick={abrirModalClienteRapido}
            className={estilos.btnAccionRapida}
        >
            <ion-icon name="person-add-outline"></ion-icon>
            Cliente Rápido
        </button>
    </div>
            </div>

            {/* LAYOUT PRINCIPAL - DOS COLUMNAS */}
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
                                    className={estilos.inputBusquedaCompacto}
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

                    {/* Tabla de productos - Vista compacta tipo POS */}
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

                                            {/* Opciones adicionales (colapsables) */}
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
                                                        <span>Aplicar {datosEmpresa?.impuesto_nombre || 'ITBIS'} ({datosEmpresa?.impuesto_porcentaje || 18}%)</span>
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

                    {/* Sección Extras (colapsable) */}
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
                                        const impuesto = extra.aplica_itbis ? (base * parseFloat(datosEmpresa?.impuesto_porcentaje || 18)) / 100 : 0
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

                {/* COLUMNA DERECHA - RESUMEN STICKY */}
                <aside className={`${estilos.colResumen} ${estilos[tema]}`}>
                    <div className={estilos.resumenSticky}>
                        <h3 className={estilos.tituloResumen}>
                            <ion-icon name="calculator-outline"></ion-icon>
                            Resumen de Venta
                        </h3>

                        {/* Campos de pago y descuento */}
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

                            {parseFloat(totales.descuento) > 0 && (
                                <div className={`${estilos.lineaTotalCompacta} ${estilos.descuento}`}>
                                    <span>Descuento:</span>
                                    <span>- RD$ {totales.descuento}</span>
                                </div>
                            )}

                            <div className={estilos.lineaTotalCompacta}>
                                <span>{datosEmpresa?.impuesto_nombre || 'ITBIS'}:</span>
                                <span>RD$ {totales.itbis}</span>
                            </div>

                            <div className={estilos.separadorTotal}></div>

                            <div className={estilos.totalFinal}>
                                <span>Total a Pagar:</span>
                                <span>RD$ {totales.total}</span>
                            </div>

                            {metodoPago === 'efectivo' && efectivoRecibido && parseFloat(cambio) >= 0 && (
                                <div className={`${estilos.cambioInfo} ${estilos[tema]}`}>
                                    <span>Cambio:</span>
                                    <strong>RD$ {cambio}</strong>
                                </div>
                            )}
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
                                    onChange={(e) => setFormExtra({...formExtra, nombre: e.target.value})}
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
                                    onChange={(e) => setFormExtra({...formExtra, tipo: e.target.value})}
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
                                        onChange={(e) => setFormExtra({...formExtra, cantidad: parseFloat(e.target.value) || 1})}
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
                                            onChange={(e) => setFormExtra({...formExtra, precioUnitario: e.target.value})}
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
                                        onChange={(e) => setFormExtra({...formExtra, aplicaItbis: e.target.checked})}
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
                                    onChange={(e) => setFormExtra({...formExtra, notas: e.target.value})}
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