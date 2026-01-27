"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearContratoFinanciamiento, obtenerDatosCreacion } from './servidor'
import { calcularAmortizacionFrancesa, tasaAnualAMensual, generarCronograma } from '../../core/finance/calculos'
import { validarMontoInicial } from '../../core/finance/reglas'
import estilos from './nuevo.module.css'

export default function NuevoContrato() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [planes, setPlanes] = useState([])
    const [clientes, setClientes] = useState([])
    const [activos, setActivos] = useState([])
    const [formData, setFormData] = useState({
        cliente_id: '',
        plan_id: '',
        venta_id: null,
        ncf: '',
        precio_producto: '',
        pago_inicial: '',
        numero_cuotas: 12,
        fecha_primer_pago: '',
        activos: [],
        nombre_fiador: '',
        documento_fiador: '',
        telefono_fiador: '',
        notas: ''
    })
    const [vistaPrevia, setVistaPrevia] = useState(null)

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

    useEffect(() => {
        calcularVistaPrevia()
    }, [formData.plan_id, formData.precio_producto, formData.pago_inicial, formData.numero_cuotas, formData.fecha_primer_pago])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const resultado = await obtenerDatosCreacion()
            if (resultado.success) {
                setPlanes(resultado.planes || [])
                setClientes(resultado.clientes || [])
                setActivos(resultado.activos || [])
            } else {
                alert(resultado.mensaje || 'Error al cargar datos')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al cargar datos')
        } finally {
            setCargando(false)
        }
    }

    const calcularVistaPrevia = () => {
        if (!formData.plan_id || !formData.precio_producto || !formData.pago_inicial || !formData.numero_cuotas || !formData.fecha_primer_pago) {
            setVistaPrevia(null)
            return
        }

        const plan = planes.find(p => p.id === parseInt(formData.plan_id))
        if (!plan) {
            setVistaPrevia(null)
            return
        }

        const precioProducto = parseFloat(formData.precio_producto) || 0
        const pagoInicial = parseFloat(formData.pago_inicial) || 0
        const montoFinanciado = precioProducto - pagoInicial

        if (montoFinanciado <= 0) {
            setVistaPrevia(null)
            return
        }

        const tasaMensual = tasaAnualAMensual(plan.tasa_interes_anual)
        const amortizacion = calcularAmortizacionFrancesa(montoFinanciado, tasaMensual, parseInt(formData.numero_cuotas))

        setVistaPrevia({
            montoFinanciado,
            cuotaMensual: amortizacion.cuotaMensual,
            totalIntereses: amortizacion.totalIntereses,
            totalPagar: amortizacion.totalPagar
        })
    }

    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }))
    }

    const manejarCambioActivos = (activoId) => {
        setFormData(prev => {
            const activos = prev.activos || []
            const index = activos.indexOf(activoId)
            if (index > -1) {
                return { ...prev, activos: activos.filter(id => id !== activoId) }
            } else {
                return { ...prev, activos: [...activos, activoId] }
            }
        })
    }

    const guardarContrato = async () => {
        if (!formData.cliente_id || !formData.plan_id || !formData.precio_producto || !formData.pago_inicial || !formData.numero_cuotas || !formData.fecha_primer_pago) {
            alert('Por favor complete todos los campos requeridos')
            return
        }

        const plan = planes.find(p => p.id === parseInt(formData.plan_id))
        if (!plan) {
            alert('Plan no encontrado')
            return
        }

        const precioProducto = parseFloat(formData.precio_producto)
        const pagoInicial = parseFloat(formData.pago_inicial)
        const montoFinanciado = precioProducto - pagoInicial

        // Validar pago inicial
        const validacionInicial = validarMontoInicial(precioProducto, pagoInicial, plan.pago_inicial_minimo_pct)
        if (!validacionInicial.valido) {
            alert(validacionInicial.error)
            return
        }

        // Calcular fecha último pago
        const fechaPrimerPago = new Date(formData.fecha_primer_pago)
        const fechaUltimoPago = new Date(fechaPrimerPago)
        fechaUltimoPago.setMonth(fechaUltimoPago.getMonth() + parseInt(formData.numero_cuotas) - 1)

        setProcesando(true)
        try {
            const resultado = await crearContratoFinanciamiento({
                cliente_id: parseInt(formData.cliente_id),
                plan_id: parseInt(formData.plan_id),
                venta_id: formData.venta_id || null,
                ncf: formData.ncf || '',
                precio_producto: precioProducto,
                pago_inicial: pagoInicial,
                monto_financiado: montoFinanciado,
                numero_cuotas: parseInt(formData.numero_cuotas),
                fecha_primer_pago: formData.fecha_primer_pago,
                fecha_ultimo_pago: fechaUltimoPago.toISOString().split('T')[0],
                fecha_contrato: new Date().toISOString().split('T')[0],
                activos: formData.activos,
                nombre_fiador: formData.nombre_fiador || null,
                documento_fiador: formData.documento_fiador || null,
                telefono_fiador: formData.telefono_fiador || null,
                notas: formData.notas || null
            })

            if (resultado.success) {
                alert(resultado.mensaje || 'Contrato creado exitosamente')
                router.push(`/admin/contratos/ver/${resultado.contrato_id}`)
            } else {
                alert(resultado.mensaje || 'Error al crear contrato')
            }
        } catch (error) {
            console.error('Error al crear contrato:', error)
            alert('Error al crear contrato')
        } finally {
            setProcesando(false)
        }
    }

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(monto || 0)
    }

    const planSeleccionado = planes.find(p => p.id === parseInt(formData.plan_id))

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
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Nuevo Contrato de Financiamiento</h1>
                    <p className={estilos.subtitulo}>Complete la información para crear un nuevo contrato</p>
                </div>
                <Link href="/admin/contratos" className={estilos.btnVolver}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    Volver
                </Link>
            </div>

            <div className={estilos.formulario}>
                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Información del Cliente</h2>
                    <div className={estilos.formGroup}>
                        <label>Cliente *</label>
                        <select
                            name="cliente_id"
                            value={formData.cliente_id}
                            onChange={manejarCambio}
                            required
                        >
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre} {cliente.apellidos || ''} - {cliente.numero_documento}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Plan de Financiamiento</h2>
                    <div className={estilos.formGroup}>
                        <label>Plan *</label>
                        <select
                            name="plan_id"
                            value={formData.plan_id}
                            onChange={manejarCambio}
                            required
                        >
                            <option value="">Seleccione un plan</option>
                            {planes.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.nombre} - {plan.plazo_meses} meses - {plan.tasa_interes_anual}% anual
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Información Financiera</h2>
                    <div className={estilos.formGrid}>
                        <div className={estilos.formGroup}>
                            <label>Precio del Producto *</label>
                            <input
                                type="number"
                                name="precio_producto"
                                value={formData.precio_producto}
                                onChange={manejarCambio}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                        <div className={estilos.formGroup}>
                            <label>Pago Inicial *</label>
                            <input
                                type="number"
                                name="pago_inicial"
                                value={formData.pago_inicial}
                                onChange={manejarCambio}
                                step="0.01"
                                min="0"
                                required
                            />
                            {planSeleccionado && (
                                <span className={estilos.ayuda}>
                                    Mínimo: {formatearMoneda((parseFloat(formData.precio_producto) || 0) * (planSeleccionado.pago_inicial_minimo_pct / 100))}
                                </span>
                            )}
                        </div>
                        <div className={estilos.formGroup}>
                            <label>Número de Cuotas *</label>
                            <input
                                type="number"
                                name="numero_cuotas"
                                value={formData.numero_cuotas}
                                onChange={manejarCambio}
                                min="1"
                                max="60"
                                required
                            />
                        </div>
                        <div className={estilos.formGroup}>
                            <label>Fecha Primer Pago *</label>
                            <input
                                type="date"
                                name="fecha_primer_pago"
                                value={formData.fecha_primer_pago}
                                onChange={manejarCambio}
                                required
                            />
                        </div>
                        <div className={estilos.formGroup}>
                            <label>NCF</label>
                            <input
                                type="text"
                                name="ncf"
                                value={formData.ncf}
                                onChange={manejarCambio}
                                placeholder="Número de Comprobante Fiscal"
                            />
                        </div>
                    </div>
                </div>

                {vistaPrevia && (
                    <div className={estilos.vistaPrevia}>
                        <h3>Vista Previa del Contrato</h3>
                        <div className={estilos.vistaPreviaGrid}>
                            <div>
                                <span>Monto Financiado:</span>
                                <strong>{formatearMoneda(vistaPrevia.montoFinanciado)}</strong>
                            </div>
                            <div>
                                <span>Cuota Mensual:</span>
                                <strong>{formatearMoneda(vistaPrevia.cuotaMensual)}</strong>
                            </div>
                            <div>
                                <span>Total Intereses:</span>
                                <strong>{formatearMoneda(vistaPrevia.totalIntereses)}</strong>
                            </div>
                            <div>
                                <span>Total a Pagar:</span>
                                <strong>{formatearMoneda(vistaPrevia.totalPagar)}</strong>
                            </div>
                        </div>
                    </div>
                )}

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Activos Asociados (Opcional)</h2>
                    {activos.length === 0 ? (
                        <p className={estilos.sinDatos}>No hay activos disponibles</p>
                    ) : (
                        <div className={estilos.activosLista}>
                            {activos.map(activo => (
                                <label key={activo.id} className={estilos.activoCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={formData.activos.includes(activo.id)}
                                        onChange={() => manejarCambioActivos(activo.id)}
                                    />
                                    <div>
                                        <strong>{activo.producto_nombre}</strong>
                                        <span>Código: {activo.codigo_activo}</span>
                                        {activo.numero_serie && <span>Serie: {activo.numero_serie}</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Información del Fiador (Opcional)</h2>
                    <div className={estilos.formGrid}>
                        <div className={estilos.formGroup}>
                            <label>Nombre del Fiador</label>
                            <input
                                type="text"
                                name="nombre_fiador"
                                value={formData.nombre_fiador}
                                onChange={manejarCambio}
                            />
                        </div>
                        <div className={estilos.formGroup}>
                            <label>Documento del Fiador</label>
                            <input
                                type="text"
                                name="documento_fiador"
                                value={formData.documento_fiador}
                                onChange={manejarCambio}
                            />
                        </div>
                        <div className={estilos.formGroup}>
                            <label>Teléfono del Fiador</label>
                            <input
                                type="text"
                                name="telefono_fiador"
                                value={formData.telefono_fiador}
                                onChange={manejarCambio}
                            />
                        </div>
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Notas</h2>
                    <div className={estilos.formGroup}>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={manejarCambio}
                            rows="4"
                            placeholder="Notas adicionales sobre el contrato..."
                        />
                    </div>
                </div>

                <div className={estilos.acciones}>
                    <Link href="/admin/contratos" className={estilos.btnCancelar}>
                        Cancelar
                    </Link>
                    <button
                        className={estilos.btnGuardar}
                        onClick={guardarContrato}
                        disabled={procesando}
                    >
                        {procesando ? 'Creando...' : 'Crear Contrato'}
                    </button>
                </div>
            </div>
        </div>
    )
}

