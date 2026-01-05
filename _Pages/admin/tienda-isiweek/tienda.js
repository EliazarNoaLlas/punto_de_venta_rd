"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    obtenerProductosTiendaIsiWeek, 
    obtenerCategoriasTiendaIsiWeek,
    crearPedidoB2B
} from './servidor'
import estilos from './tienda.module.css'

export default function TiendaIsiWeek() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [carrito, setCarrito] = useState([])
    const [filtroCategoria, setFiltroCategoria] = useState('todos')
    const [busqueda, setBusqueda] = useState('')
    const [mostrarCarrito, setMostrarCarrito] = useState(false)
    const [procesandoPedido, setProcesandoPedido] = useState(false)

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)

        const manejarCambioTema = () => {
            const nuevoTema = localStorage.getItem('tema') || 'light'
            setTema(nuevoTema)
        }

        window.addEventListener('temaChange', manejarCambioTema)
        window.addEventListener('storage', manejarCambioTema)

        // Cargar carrito desde localStorage
        const carritoGuardado = localStorage.getItem('carrito_isiweek')
        if (carritoGuardado) {
            try {
                setCarrito(JSON.parse(carritoGuardado))
            } catch (e) {
                console.error('Error al cargar carrito:', e)
            }
        }

        return () => {
            window.removeEventListener('temaChange', manejarCambioTema)
            window.removeEventListener('storage', manejarCambioTema)
        }
    }, [])

    useEffect(() => {
        cargarDatos()
    }, [])

    useEffect(() => {
        // Guardar carrito en localStorage
        localStorage.setItem('carrito_isiweek', JSON.stringify(carrito))
    }, [carrito])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [resultadoProductos, resultadoCategorias] = await Promise.all([
                obtenerProductosTiendaIsiWeek({ categoria: filtroCategoria === 'todos' ? null : filtroCategoria }),
                obtenerCategoriasTiendaIsiWeek()
            ])

            if (resultadoProductos.success) {
                setProductos(resultadoProductos.productos || [])
            }

            if (resultadoCategorias.success) {
                setCategorias(resultadoCategorias.categorias || [])
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al cargar datos')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [filtroCategoria])

    const agregarAlCarrito = (producto) => {
        const existente = carrito.find(item => item.id === producto.id)
        if (existente) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ))
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }])
        }
    }

    const actualizarCantidad = (productoId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            setCarrito(carrito.filter(item => item.id !== productoId))
        } else {
            setCarrito(carrito.map(item =>
                item.id === productoId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            ))
        }
    }

    const eliminarDelCarrito = (productoId) => {
        setCarrito(carrito.filter(item => item.id !== productoId))
    }

    const calcularSubtotal = () => {
        return carrito.reduce((total, item) => {
            const precio = item.precio_volumen && item.cantidad_volumen && item.cantidad >= item.cantidad_volumen
                ? item.precio_volumen
                : item.precio
            return total + (precio * item.cantidad)
        }, 0)
    }

    const manejarCrearPedido = async () => {
        if (carrito.length === 0) {
            alert('El carrito está vacío')
            return
        }

        setProcesandoPedido(true)
        try {
            const items = carrito.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad
            }))

            const resultado = await crearPedidoB2B({
                items: items,
                metodo_pago: 'contra_entrega',
                notas: ''
            })

            if (resultado.success) {
                alert('Pedido creado correctamente. Número: ' + resultado.pedido.numero_pedido)
                setCarrito([])
                localStorage.removeItem('carrito_isiweek')
                setMostrarCarrito(false)
                router.push('/admin/tienda-isiweek/pedidos')
            } else {
                alert('Error al crear pedido: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error al crear pedido:', error)
            alert('Error al crear pedido')
        } finally {
            setProcesandoPedido(false)
        }
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    const obtenerPrecioProducto = (producto, cantidad) => {
        if (producto.precio_volumen && producto.cantidad_volumen && cantidad >= producto.cantidad_volumen) {
            return producto.precio_volumen
        }
        return producto.precio
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="refresh-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando productos...</span>
                </div>
            </div>
        )
    }

    const productosFiltrados = productos.filter(p => {
        if (busqueda) {
            const busquedaLower = busqueda.toLowerCase()
            return p.nombre.toLowerCase().includes(busquedaLower) ||
                   (p.sku && p.sku.toLowerCase().includes(busquedaLower))
        }
        return true
    })

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Tienda IsiWeek</h1>
                    <p className={estilos.subtitulo}>Compra insumos, equipos y servicios para tu negocio</p>
                </div>
                <button
                    className={estilos.btnCarrito}
                    onClick={() => setMostrarCarrito(true)}
                >
                    <ion-icon name="cart-outline"></ion-icon>
                    <span>Carrito ({carrito.length})</span>
                    {carrito.length > 0 && (
                        <span className={estilos.carritoTotal}>{formatearMoneda(calcularSubtotal())}</span>
                    )}
                </button>
            </div>

            <div className={estilos.filtros}>
                <div className={estilos.filtroGrupo}>
                    <label className={estilos.label}>Categoría:</label>
                    <select
                        className={estilos.select}
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                        <option value="todos">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className={estilos.filtroGrupo}>
                    <label className={estilos.label}>Buscar:</label>
                    <div className={estilos.busqueda}>
                        <input
                            type="text"
                            className={estilos.input}
                            placeholder="Buscar productos..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {productosFiltrados.length === 0 ? (
                <div className={estilos.vacio}>
                    <ion-icon name="cube-outline"></ion-icon>
                    <p>No hay productos disponibles</p>
                </div>
            ) : (
                <div className={estilos.grid}>
                    {productosFiltrados.map((producto) => {
                        const enCarrito = carrito.find(item => item.id === producto.id)
                        const cantidadCarrito = enCarrito ? enCarrito.cantidad : 0
                        
                        return (
                            <div key={producto.id} className={estilos.productoCard}>
                                {producto.imagen_url && (
                                    <div className={estilos.imagenContainer}>
                                        <img src={producto.imagen_url} alt={producto.nombre} className={estilos.imagen} />
                                    </div>
                                )}
                                <div className={estilos.productoInfo}>
                                    <div className={estilos.productoHeader}>
                                        <h3 className={estilos.productoNombre}>{producto.nombre}</h3>
                                        {producto.destacado && (
                                            <span className={estilos.badgeDestacado}>⭐</span>
                                        )}
                                    </div>
                                    {producto.descripcion && (
                                        <p className={estilos.descripcion}>{producto.descripcion.substring(0, 100)}...</p>
                                    )}
                                    <div className={estilos.detalles}>
                                        {producto.stock > 0 ? (
                                            <span className={estilos.stockDisponible}>✓ En stock</span>
                                        ) : (
                                            <span className={estilos.stockAgotado}>✗ Agotado</span>
                                        )}
                                        {producto.tiempo_entrega && (
                                            <span className={estilos.tiempoEntrega}>⏱ {producto.tiempo_entrega}</span>
                                        )}
                                    </div>
                                    <div className={estilos.precios}>
                                        <div className={estilos.precioPrincipal}>
                                            {formatearMoneda(producto.precio)}
                                        </div>
                                        {producto.precio_volumen && producto.cantidad_volumen && (
                                            <div className={estilos.precioVolumen}>
                                                {producto.cantidad_volumen}+ por {formatearMoneda(producto.precio_volumen)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={estilos.acciones}>
                                        {cantidadCarrito > 0 ? (
                                            <div className={estilos.controlesCantidad}>
                                                <button
                                                    className={estilos.btnCantidad}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        actualizarCantidad(producto.id, cantidadCarrito - 1)
                                                    }}
                                                >
                                                    <ion-icon name="remove-outline"></ion-icon>
                                                </button>
                                                <span className={estilos.cantidad}>{cantidadCarrito}</span>
                                                <button
                                                    className={estilos.btnCantidad}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        actualizarCantidad(producto.id, cantidadCarrito + 1)
                                                    }}
                                                    disabled={producto.stock <= cantidadCarrito}
                                                >
                                                    <ion-icon name="add-outline"></ion-icon>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className={estilos.btnAgregar}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    agregarAlCarrito(producto)
                                                }}
                                                disabled={producto.stock <= 0}
                                            >
                                                <ion-icon name="cart-outline"></ion-icon>
                                                <span>Agregar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {mostrarCarrito && (
                <CarritoModal
                    carrito={carrito}
                    onCerrar={() => setMostrarCarrito(false)}
                    onActualizarCantidad={actualizarCantidad}
                    onEliminar={eliminarDelCarrito}
                    onCrearPedido={manejarCrearPedido}
                    procesando={procesandoPedido}
                    calcularSubtotal={calcularSubtotal}
                    obtenerPrecioProducto={obtenerPrecioProducto}
                />
            )}
        </div>
    )
}

function CarritoModal({ carrito, onCerrar, onActualizarCantidad, onEliminar, onCrearPedido, procesando, calcularSubtotal, obtenerPrecioProducto }) {
    const [tema, setTema] = useState('light')

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)
    }, [])

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    return (
        <div className={`${estilos.modalOverlay} ${estilos[tema]}`} onClick={onCerrar}>
            <div className={estilos.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={estilos.modalHeader}>
                    <h2 className={estilos.modalTitulo}>Carrito de Compras</h2>
                    <button className={estilos.btnCerrar} onClick={onCerrar}>
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>

                <div className={estilos.modalBody}>
                    {carrito.length === 0 ? (
                        <div className={estilos.carritoVacio}>
                            <ion-icon name="cart-outline"></ion-icon>
                            <p>El carrito está vacío</p>
                        </div>
                    ) : (
                        <>
                            <div className={estilos.listaCarrito}>
                                {carrito.map((item) => (
                                    <div key={item.id} className={estilos.itemCarrito}>
                                        <div className={estilos.itemInfo}>
                                            <h4 className={estilos.itemNombre}>{item.nombre}</h4>
                                            <div className={estilos.itemPrecio}>
                                                {formatearMoneda(obtenerPrecioProducto(item, item.cantidad))} c/u
                                            </div>
                                        </div>
                                        <div className={estilos.itemCantidad}>
                                            <button
                                                className={estilos.btnCantidadSmall}
                                                onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}
                                            >
                                                <ion-icon name="remove-outline"></ion-icon>
                                            </button>
                                            <span>{item.cantidad}</span>
                                            <button
                                                className={estilos.btnCantidadSmall}
                                                onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}
                                            >
                                                <ion-icon name="add-outline"></ion-icon>
                                            </button>
                                        </div>
                                        <div className={estilos.itemSubtotal}>
                                            {formatearMoneda(obtenerPrecioProducto(item, item.cantidad) * item.cantidad)}
                                        </div>
                                        <button
                                            className={estilos.btnEliminarItem}
                                            onClick={() => onEliminar(item.id)}
                                        >
                                            <ion-icon name="trash-outline"></ion-icon>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className={estilos.carritoTotales}>
                                <div className={estilos.totalLine}>
                                    <span>Subtotal:</span>
                                    <span>{formatearMoneda(calcularSubtotal())}</span>
                                </div>
                                <div className={estilos.totalLine}>
                                    <span>Total:</span>
                                    <span className={estilos.totalFinal}>{formatearMoneda(calcularSubtotal())}</span>
                                </div>
                            </div>

                            <div className={estilos.modalAcciones}>
                                <button
                                    className={estilos.btnCrearPedido}
                                    onClick={onCrearPedido}
                                    disabled={procesando || carrito.length === 0}
                                >
                                    {procesando ? 'Creando Pedido...' : 'Crear Pedido'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

