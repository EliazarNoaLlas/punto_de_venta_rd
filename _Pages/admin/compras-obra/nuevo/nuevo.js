"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearCompraObra, obtenerObrasParaCompra } from '../servidor'
import estilos from '../compras-obra.module.css'

export default function NuevaCompraObra() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        tipo_destino: 'obra',
        destino_id: '',
        proveedor_id: '',
        numero_factura: '',
        tipo_comprobante: '',
        subtotal: '',
        impuesto: '',
        total: '',
        forma_pago: 'efectivo',
        tipo_compra: 'planificada',
        fecha_compra: new Date().toISOString().split('T')[0],
        notas: ''
    })
    const [detalle, setDetalle] = useState([])
    const [obras, setObras] = useState([])
    const [proveedores, setProveedores] = useState([])
    const [errors, setErrors] = useState({})
    const [procesando, setProcesando] = useState(false)
    const [cargando, setCargando] = useState(true)

    const [nuevoItem, setNuevoItem] = useState({
        material_nombre: '',
        material_descripcion: '',
        unidad_medida: '',
        cantidad: '',
        precio_unitario: ''
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        const [resObras, resProveedores] = await Promise.all([
            obtenerObrasParaCompra(),
            obtenerProveedores()
        ])
        
        if (resObras.success) {
            setObras(resObras.obras || [])
        }
        if (resProveedores.success) {
            setProveedores(resProveedores.proveedores || [])
        }
        setCargando(false)
    }

    async function obtenerProveedores() {
        // Simulación - debería venir del servidor
        return { success: true, proveedores: [] }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const agregarItem = () => {
        if (!nuevoItem.material_nombre || !nuevoItem.cantidad || !nuevoItem.precio_unitario) {
            alert('Complete todos los campos del material')
            return
        }

        const subtotal = parseFloat(nuevoItem.cantidad) * parseFloat(nuevoItem.precio_unitario)
        setDetalle([...detalle, {
            ...nuevoItem,
            cantidad: parseFloat(nuevoItem.cantidad),
            precio_unitario: parseFloat(nuevoItem.precio_unitario),
            subtotal
        }])

        setNuevoItem({
            material_nombre: '',
            material_descripcion: '',
            unidad_medida: '',
            cantidad: '',
            precio_unitario: ''
        })

        calcularTotales()
    }

    const eliminarItem = (index) => {
        setDetalle(detalle.filter((_, i) => i !== index))
        calcularTotales()
    }

    const calcularTotales = () => {
        const subtotal = detalle.reduce((sum, item) => sum + (item.subtotal || 0), 0)
        const impuesto = subtotal * 0.18 // ITBIS 18%
        const total = subtotal + impuesto
        
        setFormData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            impuesto: impuesto.toFixed(2),
            total: total.toFixed(2)
        }))
    }

    useEffect(() => {
        calcularTotales()
    }, [detalle])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.destino_id) {
            alert('Debe seleccionar una obra')
            return
        }
        
        if (!formData.proveedor_id) {
            alert('Debe seleccionar un proveedor')
            return
        }
        
        if (detalle.length === 0) {
            alert('Debe agregar al menos un material')
            return
        }

        setProcesando(true)
        try {
            const datos = {
                ...formData,
                destino_id: parseInt(formData.destino_id),
                proveedor_id: parseInt(formData.proveedor_id),
                subtotal: parseFloat(formData.subtotal),
                impuesto: parseFloat(formData.impuesto),
                total: parseFloat(formData.total),
                detalle
            }
            
            const res = await crearCompraObra(datos)
            if (res.success) {
                alert('Compra registrada exitosamente')
                router.push('/admin/compras-obra')
            } else {
                alert(res.mensaje || 'Error al registrar compra')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al procesar la solicitud')
        } finally {
            setProcesando(false)
        }
    }

    if (cargando) {
        return <div className={estilos.cargando}>Cargando...</div>
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <h1 className={estilos.titulo}>Nueva Compra de Obra</h1>
                <button onClick={() => router.back()} className={estilos.btnVolver}>
                    ← Volver
                </button>
            </div>

            <form onSubmit={handleSubmit} className={estilos.formulario}>
                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Obra <span className={estilos.requerido}>*</span>
                        </label>
                        <select
                            name="destino_id"
                            value={formData.destino_id}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            <option value="">Seleccionar obra...</option>
                            {obras.map(obra => (
                                <option key={obra.id} value={obra.id}>
                                    {obra.codigo_obra} - {obra.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Proveedor <span className={estilos.requerido}>*</span>
                        </label>
                        <select
                            name="proveedor_id"
                            value={formData.proveedor_id}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            <option value="">Seleccionar proveedor...</option>
                            {proveedores.map(prov => (
                                <option key={prov.id} value={prov.id}>
                                    {prov.nombre_comercial || prov.razon_social}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>
                            Número de Factura <span className={estilos.requerido}>*</span>
                        </label>
                        <input
                            type="text"
                            name="numero_factura"
                            value={formData.numero_factura}
                            onChange={handleChange}
                            className={estilos.input}
                            placeholder="NCF o número de factura"
                        />
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Fecha de Compra</label>
                        <input
                            type="date"
                            name="fecha_compra"
                            value={formData.fecha_compra}
                            onChange={handleChange}
                            className={estilos.input}
                        />
                    </div>
                </div>

                <div className={estilos.grid}>
                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Forma de Pago</label>
                        <select
                            name="forma_pago"
                            value={formData.forma_pago}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta_debito">Tarjeta Débito</option>
                            <option value="tarjeta_credito">Tarjeta Crédito</option>
                            <option value="cheque">Cheque</option>
                            <option value="credito">Crédito</option>
                        </select>
                    </div>

                    <div className={estilos.grupo}>
                        <label className={estilos.label}>Tipo de Compra</label>
                        <select
                            name="tipo_compra"
                            value={formData.tipo_compra}
                            onChange={handleChange}
                            className={estilos.select}
                        >
                            <option value="planificada">Planificada</option>
                            <option value="imprevista">Imprevista</option>
                        </select>
                    </div>
                </div>

                {/* Detalle de Materiales */}
                <div className={estilos.seccion}>
                    <h2>Materiales</h2>
                    
                    <div className={estilos.agregarItem}>
                        <input
                            type="text"
                            placeholder="Nombre del material"
                            value={nuevoItem.material_nombre}
                            onChange={(e) => setNuevoItem(prev => ({ ...prev, material_nombre: e.target.value }))}
                            className={estilos.input}
                        />
                        <input
                            type="text"
                            placeholder="Unidad (opcional)"
                            value={nuevoItem.unidad_medida}
                            onChange={(e) => setNuevoItem(prev => ({ ...prev, unidad_medida: e.target.value }))}
                            className={estilos.input}
                        />
                        <input
                            type="number"
                            placeholder="Cantidad"
                            value={nuevoItem.cantidad}
                            onChange={(e) => setNuevoItem(prev => ({ ...prev, cantidad: e.target.value }))}
                            className={estilos.input}
                            step="0.01"
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Precio unitario"
                            value={nuevoItem.precio_unitario}
                            onChange={(e) => setNuevoItem(prev => ({ ...prev, precio_unitario: e.target.value }))}
                            className={estilos.input}
                            step="0.01"
                            min="0"
                        />
                        <button type="button" onClick={agregarItem} className={estilos.btnAgregar}>
                            Agregar
                        </button>
                    </div>

                    {detalle.length > 0 && (
                        <div className={estilos.tablaDetalle}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Unidad</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalle.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.material_nombre}</td>
                                            <td>{item.unidad_medida || '-'}</td>
                                            <td>{item.cantidad}</td>
                                            <td>RD$ {item.precio_unitario.toLocaleString()}</td>
                                            <td>RD$ {item.subtotal.toLocaleString()}</td>
                                            <td>
                                                <button type="button" onClick={() => eliminarItem(index)}>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Totales */}
                <div className={estilos.totales}>
                    <div>
                        <label>Subtotal:</label>
                        <span>RD$ {parseFloat(formData.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div>
                        <label>ITBIS (18%):</label>
                        <span>RD$ {parseFloat(formData.impuesto || 0).toLocaleString()}</span>
                    </div>
                    <div className={estilos.total}>
                        <label>Total:</label>
                        <span>RD$ {parseFloat(formData.total || 0).toLocaleString()}</span>
                    </div>
                </div>

                <div className={estilos.grupo}>
                    <label className={estilos.label}>Notas</label>
                    <textarea
                        name="notas"
                        value={formData.notas}
                        onChange={handleChange}
                        className={estilos.textarea}
                        rows="3"
                        placeholder="Observaciones adicionales..."
                    />
                </div>

                <div className={estilos.acciones}>
                    <button type="button" onClick={() => router.back()} className={estilos.btnCancelar}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={procesando} className={estilos.btnGuardar}>
                        {procesando ? 'Guardando...' : 'Guardar Compra'}
                    </button>
                </div>
            </form>
        </div>
    )
}

