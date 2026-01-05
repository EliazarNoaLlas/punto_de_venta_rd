"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    obtenerProductosB2B, 
    obtenerCategoriasB2B, 
    crearProductoB2B, 
    actualizarProductoB2B, 
    eliminarProductoB2B,
    obtenerProductoB2B
} from './servidor'
import estilos from './productos.module.css'

export default function ProductosTiendaB2B() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [filtroCategoria, setFiltroCategoria] = useState('todos')
    const [busqueda, setBusqueda] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [productoEditando, setProductoEditando] = useState(null)
    const [procesando, setProcesando] = useState(false)

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
    }, [])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [resultadoProductos, resultadoCategorias] = await Promise.all([
                obtenerProductosB2B(filtroCategoria === 'todos' ? null : parseInt(filtroCategoria), null),
                obtenerCategoriasB2B()
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
        if (!mostrarFormulario) {
            cargarDatos()
        }
    }, [filtroCategoria, busqueda, mostrarFormulario])

    const manejarBuscar = () => {
        cargarDatos()
    }

    const manejarNuevo = () => {
        setProductoEditando(null)
        setMostrarFormulario(true)
    }

    const manejarEditar = async (productoId) => {
        try {
            const resultado = await obtenerProductoB2B(productoId)
            if (resultado.success) {
                setProductoEditando(resultado.producto)
                setMostrarFormulario(true)
            } else {
                alert('Error al cargar producto: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error al cargar producto:', error)
            alert('Error al cargar producto')
        }
    }

    const manejarEliminar = async (productoId, nombre) => {
        if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
            return
        }

        try {
            const resultado = await eliminarProductoB2B(productoId)
            if (resultado.success) {
                alert('Producto eliminado correctamente')
                await cargarDatos()
            } else {
                alert('Error al eliminar: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error al eliminar:', error)
            alert('Error al eliminar producto')
        }
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    if (mostrarFormulario) {
        return (
            <FormularioProducto
                producto={productoEditando}
                categorias={categorias}
                onCancelar={() => {
                    setMostrarFormulario(false)
                    setProductoEditando(null)
                }}
                onGuardar={async () => {
                    setMostrarFormulario(false)
                    setProductoEditando(null)
                    await cargarDatos()
                }}
            />
        )
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
                   (p.sku && p.sku.toLowerCase().includes(busquedaLower)) ||
                   (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
        }
        return true
    })

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Productos Tienda B2B</h1>
                    <p className={estilos.subtitulo}>Gestiona los productos que IsiWeek vende a las empresas</p>
                </div>
                <button className={estilos.btnNuevo} onClick={manejarNuevo}>
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Nuevo Producto</span>
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
                            placeholder="Buscar por nombre, SKU..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && manejarBuscar()}
                        />
                        <button className={estilos.btnBuscar} onClick={manejarBuscar}>
                            <ion-icon name="search-outline"></ion-icon>
                        </button>
                    </div>
                </div>
            </div>

            {productosFiltrados.length === 0 ? (
                <div className={estilos.vacio}>
                    <ion-icon name="cube-outline"></ion-icon>
                    <p>No hay productos {filtroCategoria !== 'todos' || busqueda ? 'que coincidan con los filtros' : ''}</p>
                    <button className={estilos.btnNuevo} onClick={manejarNuevo}>
                        <ion-icon name="add-outline"></ion-icon>
                        <span>Crear Primer Producto</span>
                    </button>
                </div>
            ) : (
                <div className={estilos.grid}>
                    {productosFiltrados.map((producto) => (
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
                                        <span className={estilos.badgeDestacado}>⭐ Destacado</span>
                                    )}
                                </div>
                                {producto.descripcion && (
                                    <p className={estilos.descripcion}>{producto.descripcion.substring(0, 100)}...</p>
                                )}
                                <div className={estilos.detalles}>
                                    {producto.sku && (
                                        <div className={estilos.detalleItem}>
                                            <span className={estilos.detalleLabel}>SKU:</span>
                                            <span>{producto.sku}</span>
                                        </div>
                                    )}
                                    <div className={estilos.detalleItem}>
                                        <span className={estilos.detalleLabel}>Stock:</span>
                                        <span className={producto.stock > 0 ? estilos.stockDisponible : estilos.stockAgotado}>
                                            {producto.stock}
                                        </span>
                                    </div>
                                    {producto.categoria_nombre && (
                                        <div className={estilos.detalleItem}>
                                            <span className={estilos.detalleLabel}>Categoría:</span>
                                            <span>{producto.categoria_nombre}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={estilos.precios}>
                                    <div className={estilos.precioPrincipal}>
                                        {formatearMoneda(producto.precio)}
                                    </div>
                                    {producto.precio_volumen && producto.cantidad_volumen && (
                                        <div className={estilos.precioVolumen}>
                                            Volumen: {producto.cantidad_volumen}+ por {formatearMoneda(producto.precio_volumen)}
                                        </div>
                                    )}
                                </div>
                                <div className={estilos.acciones}>
                                    <button
                                        className={estilos.btnEditar}
                                        onClick={() => manejarEditar(producto.id)}
                                    >
                                        <ion-icon name="create-outline"></ion-icon>
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        className={estilos.btnEliminar}
                                        onClick={() => manejarEliminar(producto.id, producto.nombre)}
                                    >
                                        <ion-icon name="trash-outline"></ion-icon>
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function FormularioProducto({ producto, categorias, onCancelar, onGuardar }) {
    const [datos, setDatos] = useState({
        nombre: '',
        descripcion: '',
        categoria_id: null,
        precio: '',
        precio_volumen: '',
        cantidad_volumen: '',
        stock: '0',
        sku: '',
        tiempo_entrega: '',
        activo: true,
        destacado: false
    })
    const [procesando, setProcesando] = useState(false)
    const [tema, setTema] = useState('light')

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)
    }, [])

    useEffect(() => {
        if (producto) {
            setDatos({
                nombre: producto.nombre || '',
                descripcion: producto.descripcion || '',
                categoria_id: producto.categoria_id || null,
                precio: producto.precio || '',
                precio_volumen: producto.precio_volumen || '',
                cantidad_volumen: producto.cantidad_volumen || '',
                stock: producto.stock || '0',
                sku: producto.sku || '',
                tiempo_entrega: producto.tiempo_entrega || '',
                activo: producto.activo !== undefined ? producto.activo : true,
                destacado: producto.destacado || false
            })
        }
    }, [producto])

    const manejarGuardar = async (e) => {
        e.preventDefault()
        setProcesando(true)

        try {
            const datosEnviar = {
                ...datos,
                categoria_id: datos.categoria_id || null,
                precio: parseFloat(datos.precio),
                precio_volumen: datos.precio_volumen ? parseFloat(datos.precio_volumen) : null,
                cantidad_volumen: datos.cantidad_volumen ? parseInt(datos.cantidad_volumen) : null,
                stock: parseInt(datos.stock)
            }

            let resultado
            if (producto) {
                resultado = await actualizarProductoB2B(producto.id, datosEnviar)
            } else {
                resultado = await crearProductoB2B(datosEnviar)
            }

            if (resultado.success) {
                alert(producto ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
                onGuardar()
            } else {
                alert('Error: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error al guardar:', error)
            alert('Error al guardar producto')
        } finally {
            setProcesando(false)
        }
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.formularioContainer}>
                <div className={estilos.formularioHeader}>
                    <h2 className={estilos.formularioTitulo}>
                        {producto ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button className={estilos.btnCancelar} onClick={onCancelar}>
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                </div>

                <form onSubmit={manejarGuardar} className={estilos.formulario}>
                    <div className={estilos.formGrid}>
                        <div className={estilos.campo}>
                            <label>Nombre *</label>
                            <input
                                type="text"
                                required
                                value={datos.nombre}
                                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                            />
                        </div>

                        <div className={estilos.campo}>
                            <label>SKU</label>
                            <input
                                type="text"
                                value={datos.sku}
                                onChange={(e) => setDatos({ ...datos, sku: e.target.value })}
                            />
                        </div>

                        <div className={estilos.campo}>
                            <label>Categoría</label>
                            <select
                                value={datos.categoria_id || ''}
                                onChange={(e) => setDatos({ ...datos, categoria_id: e.target.value ? parseInt(e.target.value) : null })}
                            >
                                <option value="">Sin categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className={estilos.campo}>
                            <label>Precio *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={datos.precio}
                                onChange={(e) => setDatos({ ...datos, precio: e.target.value })}
                            />
                        </div>

                        <div className={estilos.campo}>
                            <label>Precio Volumen</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={datos.precio_volumen}
                                onChange={(e) => setDatos({ ...datos, precio_volumen: e.target.value })}
                                placeholder="Precio por compras en volumen"
                            />
                        </div>

                        <div className={estilos.campo}>
                            <label>Cantidad Mínima Volumen</label>
                            <input
                                type="number"
                                min="1"
                                value={datos.cantidad_volumen}
                                onChange={(e) => setDatos({ ...datos, cantidad_volumen: e.target.value })}
                                placeholder="Cantidad mínima para precio volumen"
                            />
                        </div>

                        <div className={estilos.campo}>
                            <label>Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={datos.stock}
                                onChange={(e) => setDatos({ ...datos, stock: e.target.value })}
                            />
                        </div>

                        <div className={estilos.campo}>
                            <label>Tiempo de Entrega</label>
                            <input
                                type="text"
                                value={datos.tiempo_entrega}
                                onChange={(e) => setDatos({ ...datos, tiempo_entrega: e.target.value })}
                                placeholder="Ej: 3-5 días"
                            />
                        </div>
                    </div>

                    <div className={estilos.campo}>
                        <label>Descripción</label>
                        <textarea
                            rows="4"
                            value={datos.descripcion}
                            onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
                        />
                    </div>

                    <div className={estilos.checkboxes}>
                        <label className={estilos.checkbox}>
                            <input
                                type="checkbox"
                                checked={datos.activo}
                                onChange={(e) => setDatos({ ...datos, activo: e.target.checked })}
                            />
                            <span>Activo</span>
                        </label>
                        <label className={estilos.checkbox}>
                            <input
                                type="checkbox"
                                checked={datos.destacado}
                                onChange={(e) => setDatos({ ...datos, destacado: e.target.checked })}
                            />
                            <span>Destacado</span>
                        </label>
                    </div>

                    <div className={estilos.formularioAcciones}>
                        <button type="button" className={estilos.btnCancelar} onClick={onCancelar} disabled={procesando}>
                            Cancelar
                        </button>
                        <button type="submit" className={estilos.btnGuardar} disabled={procesando}>
                            {procesando ? 'Guardando...' : producto ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

