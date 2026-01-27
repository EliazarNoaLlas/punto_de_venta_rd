"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    obtenerActivos,
    obtenerEstadisticasActivos,
    crearActivo,
    actualizarActivo
} from './servidor'
import estilos from './activos.module.css'

export default function ActivosFinanciamiento() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [activos, setActivos] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [mostrarModal, setMostrarModal] = useState(false)
    const [activoEditando, setActivoEditando] = useState(null)
    const [procesando, setProcesando] = useState(false)
    const [filtros, setFiltros] = useState({
        estado: '',
        buscar: ''
    })

    const [formData, setFormData] = useState({
        producto_id: '',
        codigo_activo: '',
        numero_serie: '',
        vin: '',
        numero_motor: '',
        numero_placa: '',
        color: '',
        anio_fabricacion: '',
        estado: 'en_stock',
        fecha_compra: '',
        precio_compra: '',
        ubicacion: '',
        observaciones: ''
    })

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
    }, [filtros])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [resultadoActivos, resultadoEstadisticas] = await Promise.all([
                obtenerActivos({
                    estado: filtros.estado || undefined,
                    buscar: filtros.buscar || undefined
                }),
                obtenerEstadisticasActivos()
            ])

            if (resultadoActivos.success) {
                setActivos(resultadoActivos.activos)
            } else {
                alert(resultadoActivos.mensaje || 'Error al cargar activos')
            }

            if (resultadoEstadisticas.success) {
                setEstadisticas(resultadoEstadisticas.estadisticas)
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al cargar datos')
        } finally {
            setCargando(false)
        }
    }

    const abrirModalCrear = () => {
        setActivoEditando(null)
        setFormData({
            producto_id: '',
            codigo_activo: '',
            numero_serie: '',
            vin: '',
            numero_motor: '',
            numero_placa: '',
            color: '',
            anio_fabricacion: '',
            estado: 'en_stock',
            fecha_compra: '',
            precio_compra: '',
            ubicacion: '',
            observaciones: ''
        })
        setMostrarModal(true)
    }

    const abrirModalEditar = (activo) => {
        setActivoEditando(activo)
        setFormData({
            producto_id: activo.producto_id,
            codigo_activo: activo.codigo_activo,
            numero_serie: activo.numero_serie || '',
            vin: activo.vin || '',
            numero_motor: activo.numero_motor || '',
            numero_placa: activo.numero_placa || '',
            color: activo.color || '',
            anio_fabricacion: activo.anio_fabricacion || '',
            estado: activo.estado,
            fecha_compra: activo.fecha_compra || '',
            precio_compra: activo.precio_compra || '',
            ubicacion: activo.ubicacion || '',
            observaciones: activo.observaciones || ''
        })
        setMostrarModal(true)
    }

    const cerrarModal = () => {
        setMostrarModal(false)
        setActivoEditando(null)
    }

    const manejarCambio = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseFloat(value) : '') : value
        }))
    }

    const guardarActivo = async () => {
        if (!formData.producto_id) {
            alert('El producto es requerido')
            return
        }

        setProcesando(true)
        try {
            let resultado
            if (activoEditando) {
                resultado = await actualizarActivo(activoEditando.id, formData)
            } else {
                resultado = await crearActivo(formData)
            }

            if (resultado.success) {
                alert(resultado.mensaje || 'Activo guardado exitosamente')
                cerrarModal()
                cargarDatos()
            } else {
                alert(resultado.mensaje || 'Error al guardar activo')
            }
        } catch (error) {
            console.error('Error al guardar activo:', error)
            alert('Error al guardar activo')
        } finally {
            setProcesando(false)
        }
    }

    const obtenerColorEstado = (estado) => {
        const colores = {
            en_stock: 'success',
            vendido: 'info',
            financiado: 'warning',
            asignado: 'info',
            devuelto: 'secondary',
            mantenimiento: 'warning',
            dado_baja: 'danger'
        }
        return colores[estado] || 'secondary'
    }

    const obtenerTextoEstado = (estado) => {
        const textos = {
            en_stock: 'En Stock',
            vendido: 'Vendido',
            financiado: 'Financiado',
            asignado: 'Asignado',
            devuelto: 'Devuelto',
            mantenimiento: 'Mantenimiento',
            dado_baja: 'Dado de Baja'
        }
        return textos[estado] || estado
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando activos...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Activos Rastreables</h1>
                    <p className={estilos.subtitulo}>Gestión de unidades físicas de productos</p>
                </div>
                <div className={estilos.headerAcciones}>
                    <button className={estilos.btnPrimario} onClick={abrirModalCrear}>
                        <ion-icon name="add-outline"></ion-icon>
                        Nuevo Activo
                    </button>
                    <Link href="/admin/financiamiento" className={estilos.btnSecundario}>
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className={estilos.estadisticas}>
                    <div className={estilos.estadisticaCard}>
                        <div className={estilos.estadisticaValor}>{estadisticas.total_activos}</div>
                        <div className={estilos.estadisticaLabel}>Total Activos</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.success}`}>
                            {estadisticas.activos_en_stock}
                        </div>
                        <div className={estilos.estadisticaLabel}>En Stock</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.warning}`}>
                            {estadisticas.activos_financiados}
                        </div>
                        <div className={estilos.estadisticaLabel}>Financiados</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={`${estilos.estadisticaValor} ${estilos.info}`}>
                            {estadisticas.activos_vendidos}
                        </div>
                        <div className={estilos.estadisticaLabel}>Vendidos</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={estilos.estadisticaValor}>
                            {formatearMoneda(estadisticas.total_inversion)}
                        </div>
                        <div className={estilos.estadisticaLabel}>Inversión Total</div>
                    </div>
                    <div className={estilos.estadisticaCard}>
                        <div className={estilos.estadisticaValor}>
                            {formatearMoneda(estadisticas.total_ventas)}
                        </div>
                        <div className={estilos.estadisticaLabel}>Ventas Total</div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className={estilos.filtros}>
                <input
                    type="text"
                    placeholder="Buscar por código, serie, VIN, placa, producto, cliente..."
                    className={estilos.inputBuscar}
                    name="buscar"
                    value={filtros.buscar}
                    onChange={(e) => setFiltros(prev => ({ ...prev, buscar: e.target.value }))}
                />
                <select
                    className={estilos.selectFiltro}
                    name="estado"
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                >
                    <option value="">Todos los estados</option>
                    <option value="en_stock">En Stock</option>
                    <option value="vendido">Vendido</option>
                    <option value="financiado">Financiado</option>
                    <option value="asignado">Asignado</option>
                    <option value="devuelto">Devuelto</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="dado_baja">Dado de Baja</option>
                </select>
            </div>

            {/* Tabla de activos */}
            <div className={estilos.tablaContenedor}>
                <table className={estilos.tabla}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Número Serie</th>
                            <th>VIN</th>
                            <th>Placa</th>
                            <th>Cliente</th>
                            <th>Contrato</th>
                            <th>Estado</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activos.length === 0 ? (
                            <tr>
                                <td colSpan="10" className={estilos.sinDatos}>
                                    No hay activos para mostrar
                                </td>
                            </tr>
                        ) : (
                            activos.map((activo) => (
                                <tr key={activo.id}>
                                    <td>
                                        <div className={estilos.codigoActivo}>
                                            {activo.codigo_activo}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={estilos.productoNombre}>
                                            {activo.producto_nombre}
                                        </div>
                                        {activo.producto_sku && (
                                            <div className={estilos.productoSku}>
                                                SKU: {activo.producto_sku}
                                            </div>
                                        )}
                                    </td>
                                    <td>{activo.numero_serie || '-'}</td>
                                    <td>{activo.vin || '-'}</td>
                                    <td>{activo.numero_placa || '-'}</td>
                                    <td>
                                        {activo.cliente_nombre ? (
                                            <>
                                                <div className={estilos.clienteNombre}>
                                                    {activo.cliente_nombre} {activo.cliente_apellidos || ''}
                                                </div>
                                                {activo.cliente_documento && (
                                                    <div className={estilos.clienteDoc}>
                                                        {activo.cliente_documento}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>
                                        {activo.numero_contrato ? (
                                            <Link
                                                href={`/admin/contratos/ver/${activo.contrato_financiamiento_id}`}
                                                className={estilos.linkContrato}
                                            >
                                                {activo.numero_contrato}
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>
                                        <span className={`${estilos.badge} ${estilos[obtenerColorEstado(activo.estado)]}`}>
                                            {obtenerTextoEstado(activo.estado)}
                                        </span>
                                    </td>
                                    <td>{activo.ubicacion || '-'}</td>
                                    <td>
                                        <button
                                            className={estilos.btnEditar}
                                            onClick={() => abrirModalEditar(activo)}
                                            title="Editar activo"
                                        >
                                            <ion-icon name="create-outline"></ion-icon>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear/Editar */}
            {mostrarModal && (
                <div className={estilos.modalOverlay} onClick={cerrarModal}>
                    <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={estilos.modalHeader}>
                            <h2>{activoEditando ? 'Editar Activo' : 'Nuevo Activo'}</h2>
                            <button className={estilos.btnCerrarModal} onClick={cerrarModal}>
                                <ion-icon name="close-outline"></ion-icon>
                            </button>
                        </div>
                        <div className={estilos.modalBody}>
                            <div className={estilos.formGrid}>
                                <div className={estilos.formGroup}>
                                    <label>Producto ID *</label>
                                    <input
                                        type="number"
                                        name="producto_id"
                                        value={formData.producto_id}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                        required
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Código Activo</label>
                                    <input
                                        type="text"
                                        name="codigo_activo"
                                        value={formData.codigo_activo}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                        placeholder="Se genera automáticamente si está vacío"
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Número de Serie</label>
                                    <input
                                        type="text"
                                        name="numero_serie"
                                        value={formData.numero_serie}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>VIN</label>
                                    <input
                                        type="text"
                                        name="vin"
                                        value={formData.vin}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Número de Motor</label>
                                    <input
                                        type="text"
                                        name="numero_motor"
                                        value={formData.numero_motor}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Número de Placa</label>
                                    <input
                                        type="text"
                                        name="numero_placa"
                                        value={formData.numero_placa}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Año Fabricación</label>
                                    <input
                                        type="number"
                                        name="anio_fabricacion"
                                        value={formData.anio_fabricacion}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Estado</label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={manejarCambio}
                                        className={estilos.select}
                                    >
                                        <option value="en_stock">En Stock</option>
                                        <option value="vendido">Vendido</option>
                                        <option value="financiado">Financiado</option>
                                        <option value="asignado">Asignado</option>
                                        <option value="devuelto">Devuelto</option>
                                        <option value="mantenimiento">Mantenimiento</option>
                                        <option value="dado_baja">Dado de Baja</option>
                                    </select>
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Fecha Compra</label>
                                    <input
                                        type="date"
                                        name="fecha_compra"
                                        value={formData.fecha_compra}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Precio Compra</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="precio_compra"
                                        value={formData.precio_compra}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                                <div className={estilos.formGroup}>
                                    <label>Ubicación</label>
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={manejarCambio}
                                        className={estilos.input}
                                    />
                                </div>
                            </div>
                            <div className={estilos.formGroup}>
                                <label>Observaciones</label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={manejarCambio}
                                    className={estilos.textarea}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className={estilos.modalFooter}>
                            <button
                                className={estilos.btnCancelar}
                                onClick={cerrarModal}
                                disabled={procesando}
                            >
                                Cancelar
                            </button>
                            <button
                                className={estilos.btnGuardar}
                                onClick={guardarActivo}
                                disabled={procesando || !formData.producto_id}
                            >
                                {procesando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

