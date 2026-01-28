"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearContratoFinanciamiento, obtenerDatosCreacion, validarCreditoCliente } from './servidor'
import { calcularAmortizacionFrancesa, tasaAnualAMensual, generarCronograma } from '../../core/finance/calculos'
import { validarMontoInicial } from '../../core/finance/reglas'
import estilos from './nuevo.module.css'

const PASOS = [
    { 
        numero: 1, 
        label: 'Cliente y Plan', 
        descripcion: 'Seleccione el cliente y plan de financiamiento',
        icon: 'person-outline'
    },
    { 
        numero: 2, 
        label: 'Equipos y Cálculos', 
        descripcion: 'Seleccione equipos y revise montos',
        icon: 'calculator-outline'
    },
    { 
        numero: 3, 
        label: 'Confirmación', 
        descripcion: 'Revise y confirme el contrato',
        icon: 'checkmark-circle-outline'
    }
]

export default function NuevoContrato() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [step, setStep] = useState(1)
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [planes, setPlanes] = useState([])
    const [clientes, setClientes] = useState([])
    const [equipos, setEquipos] = useState([])
    const [activos, setActivos] = useState([])
    const [busquedaCliente, setBusquedaCliente] = useState('')
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [planSeleccionado, setPlanSeleccionado] = useState(null)
    const [activosSeleccionados, setActivosSeleccionados] = useState([])
    const [precioTotal, setPrecioTotal] = useState(0)
    const [pagoInicial, setPagoInicial] = useState(0)
    const [numeroCuotas, setNumeroCuotas] = useState(12)
    const [fechaPrimerPago, setFechaPrimerPago] = useState('')
    const [requiereFiador, setRequiereFiador] = useState(false)
    const [mostrarFiadorOpcional, setMostrarFiadorOpcional] = useState(false)
    const [cronogramaPreview, setCronogramaPreview] = useState([])
    const [vistaPrevia, setVistaPrevia] = useState(null)
    const [validacionCredito, setValidacionCredito] = useState(null)
    // Modal para seleccionar activos de un equipo
    const [modalEquipoAbierto, setModalEquipoAbierto] = useState(false)
    const [equipoParaModal, setEquipoParaModal] = useState(null)
    const [activosDelEquipo, setActivosDelEquipo] = useState([])
    const [formData, setFormData] = useState({
        nombre_fiador: '',
        documento_fiador: '',
        telefono_fiador: '',
        notas: '',
        ncf: ''
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
    }, [])

    useEffect(() => {
        // Calcular precio total cuando cambian los activos seleccionados
        if (activosSeleccionados.length > 0) {
            const total = activos
                .filter(a => activosSeleccionados.includes(a.id))
                .reduce((sum, a) => sum + (parseFloat(a.precio_venta) || 0), 0)
            setPrecioTotal(total)
            
            // Actualizar pago inicial mínimo automáticamente
            if (planSeleccionado) {
                const minimo = total * (planSeleccionado.pago_inicial_minimo_pct / 100)
                if (pagoInicial < minimo) {
                    setPagoInicial(minimo)
                }
            }
        } else {
            setPrecioTotal(0)
            setPagoInicial(0)
        }
    }, [activosSeleccionados, activos])

    useEffect(() => {
        // Calcular número de cuotas automáticamente desde el plan
        if (planSeleccionado) {
            setNumeroCuotas(planSeleccionado.plazo_meses)
            setRequiereFiador(planSeleccionado.requiere_fiador === 1 || planSeleccionado.requiere_fiador === true)
            
            // Actualizar pago inicial mínimo si hay precio
            if (precioTotal > 0) {
                const minimo = precioTotal * (planSeleccionado.pago_inicial_minimo_pct / 100)
                if (pagoInicial < minimo) {
                    setPagoInicial(minimo)
                }
            }
        }
    }, [planSeleccionado, precioTotal])

    useEffect(() => {
        // Calcular fecha primer pago automáticamente (1 mes desde hoy)
        if (!fechaPrimerPago) {
            const fecha = new Date()
            fecha.setMonth(fecha.getMonth() + 1)
            setFechaPrimerPago(fecha.toISOString().split('T')[0])
        }
    }, [])

    useEffect(() => {
        // Calcular cronograma preview cuando cambian los datos relevantes
        calcularCronogramaPreview()
    }, [planSeleccionado, precioTotal, pagoInicial, numeroCuotas, fechaPrimerPago])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const resultado = await obtenerDatosCreacion()
            if (resultado.success) {
                setPlanes(resultado.planes || [])
                setClientes(resultado.clientes || [])
                setEquipos(resultado.equipos || [])
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

    const calcularCronogramaPreview = () => {
        if (!planSeleccionado || !precioTotal || !pagoInicial || !numeroCuotas || !fechaPrimerPago) {
            setCronogramaPreview([])
            setVistaPrevia(null)
            return
        }

        const montoFinanciado = precioTotal - pagoInicial
        if (montoFinanciado <= 0) {
            setCronogramaPreview([])
            setVistaPrevia(null)
            return
        }

        const tasaMensual = tasaAnualAMensual(planSeleccionado.tasa_interes_anual)
        const amortizacion = calcularAmortizacionFrancesa(montoFinanciado, tasaMensual, numeroCuotas)

        setVistaPrevia({
            montoFinanciado,
            cuotaMensual: amortizacion.cuotaMensual,
            totalIntereses: amortizacion.totalIntereses,
            totalPagar: amortizacion.totalPagar
        })

        // Generar preview de cronograma (primeras 3 cuotas)
        const cronograma = generarCronograma({
            monto_financiado: montoFinanciado,
            numero_cuotas: numeroCuotas,
            fecha_primer_pago: fechaPrimerPago,
            tasa_interes_mensual: tasaMensual,
            dias_gracia: planSeleccionado.dias_gracia || 5
        })

        setCronogramaPreview(cronograma.slice(0, 3))
    }

    const seleccionarCliente = async (cliente) => {
        setClienteSeleccionado(cliente)
        
        // Validar crédito del cliente
        if (cliente.tiene_credito) {
            // Si ya tenemos el monto financiado, validar ahora
            if (precioTotal > 0 && pagoInicial >= 0) {
                const montoRequerido = precioTotal - pagoInicial
                if (montoRequerido > 0) {
                    const validacion = await validarCreditoCliente(cliente.id, montoRequerido)
                    setValidacionCredito(validacion)
                } else {
                    // Cliente tiene crédito y no hay monto a validar aún
                    setValidacionCredito({ valido: true })
                }
            } else {
                // Cliente tiene crédito, limpiar cualquier error anterior
                setValidacionCredito({ valido: true })
            }
        } else {
            setValidacionCredito({ valido: false, error: 'Cliente sin crédito configurado' })
        }
    }

    const seleccionarPlan = (plan) => {
        setPlanSeleccionado(plan)
    }

    const toggleActivo = (activo) => {
        setActivosSeleccionados(prev => {
            if (prev.includes(activo.id)) {
                return prev.filter(id => id !== activo.id)
            } else {
                return [...prev, activo.id]
            }
        })
    }

    // Abrir modal para seleccionar activos de un equipo
    const abrirModalEquipo = (equipo) => {
        setEquipoParaModal(equipo)
        // Filtrar los activos disponibles de este equipo
        const activosEquipo = activos.filter(a => a.producto_id === equipo.id)
        setActivosDelEquipo(activosEquipo)
        setModalEquipoAbierto(true)
    }

    // Cerrar modal
    const cerrarModalEquipo = () => {
        setModalEquipoAbierto(false)
        setEquipoParaModal(null)
        setActivosDelEquipo([])
    }

    // Seleccionar/deseleccionar activo desde el modal
    const toggleActivoModal = (activo) => {
        setActivosSeleccionados(prev => {
            if (prev.includes(activo.id)) {
                return prev.filter(id => id !== activo.id)
            } else {
                return [...prev, activo.id]
            }
        })
    }

    // Obtener cantidad de activos seleccionados de un equipo
    const contarActivosSeleccionadosDeEquipo = (equipoId) => {
        return activos.filter(a => a.producto_id === equipoId && activosSeleccionados.includes(a.id)).length
    }

    // Obtener activos seleccionados de un equipo específico
    const obtenerActivosSeleccionadosDeEquipo = (equipoId) => {
        return activos.filter(a => a.producto_id === equipoId && activosSeleccionados.includes(a.id))
    }

    const validarPaso = (pasoActual) => {
        if (pasoActual === 1) {
            if (!clienteSeleccionado) {
                alert('Debe seleccionar un cliente')
                return false
            }
            if (!planSeleccionado) {
                alert('Debe seleccionar un plan')
                return false
            }
        }
        if (pasoActual === 2) {
            if (activosSeleccionados.length === 0) {
                alert('Debe seleccionar al menos un activo')
                return false
            }
            if (precioTotal <= 0) {
                alert('El precio total debe ser mayor a 0')
                return false
            }
            const pagoInicialMinimo = precioTotal * (planSeleccionado.pago_inicial_minimo_pct / 100)
            if (pagoInicial < pagoInicialMinimo) {
                alert(`El pago inicial debe ser mayor o igual a ${formatearMoneda(pagoInicialMinimo)}`)
                return false
            }
            const montoFinanciado = precioTotal - pagoInicial
            if (montoFinanciado <= 0) {
                alert('El monto a financiar debe ser mayor a 0. Ajuste el pago inicial.')
                return false
            }
            if (!fechaPrimerPago) {
                alert('Debe seleccionar la fecha del primer pago')
                return false
            }
        }
        if (pasoActual === 3) {
            if (requiereFiador || mostrarFiadorOpcional) {
                if (formData.nombre_fiador && (!formData.documento_fiador || !formData.telefono_fiador)) {
                    alert('Debe completar todos los datos del fiador')
                    return false
                }
            }
            if (requiereFiador && !formData.nombre_fiador) {
                alert('El plan requiere un fiador')
                return false
            }
        }
        return true
    }

    const handleNext = () => {
        if (validarPaso(step)) {
            setStep(step + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBack = () => {
        setStep(step - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const confirmarContrato = async () => {
        if (!validarPaso(3)) {
            return
        }

        // Validar crédito una última vez antes de crear
        if (clienteSeleccionado.tiene_credito) {
            const montoRequerido = precioTotal - pagoInicial
            if (montoRequerido > 0) {
                const validacion = await validarCreditoCliente(clienteSeleccionado.id, montoRequerido)
                if (!validacion.valido) {
                    alert(validacion.error || 'El cliente no tiene crédito suficiente')
                    return
                }
            }
        }

        setProcesando(true)
        try {
            const fechaPrimerPagoDate = new Date(fechaPrimerPago)
            const fechaUltimoPago = new Date(fechaPrimerPagoDate)
            fechaUltimoPago.setMonth(fechaUltimoPago.getMonth() + numeroCuotas - 1)

            const resultado = await crearContratoFinanciamiento({
                cliente_id: clienteSeleccionado.id,
                plan_id: planSeleccionado.id,
                venta_id: null,
                ncf: formData.ncf || '',
                precio_producto: precioTotal,
                pago_inicial: pagoInicial,
                monto_financiado: precioTotal - pagoInicial,
                numero_cuotas: numeroCuotas,
                fecha_primer_pago: fechaPrimerPago,
                fecha_ultimo_pago: fechaUltimoPago.toISOString().split('T')[0],
                fecha_contrato: new Date().toISOString().split('T')[0],
                activos: activosSeleccionados,
                nombre_fiador: (requiereFiador || mostrarFiadorOpcional) && formData.nombre_fiador ? formData.nombre_fiador : null,
                documento_fiador: (requiereFiador || mostrarFiadorOpcional) && formData.documento_fiador ? formData.documento_fiador : null,
                telefono_fiador: (requiereFiador || mostrarFiadorOpcional) && formData.telefono_fiador ? formData.telefono_fiador : null,
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

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const clientesFiltrados = busquedaCliente 
        ? clientes.filter(cliente => {
            const busqueda = busquedaCliente.toLowerCase()
            return (
                cliente.nombre?.toLowerCase().includes(busqueda) ||
                cliente.apellidos?.toLowerCase().includes(busqueda) ||
                cliente.numero_documento?.toLowerCase().includes(busqueda) ||
                cliente.telefono?.toLowerCase().includes(busqueda)
            )
        })
        : clientes.slice(0, 3) // Solo mostrar los 3 primeros si no hay búsqueda

    const pagoInicialMinimo = planSeleccionado && precioTotal > 0 
        ? precioTotal * (planSeleccionado.pago_inicial_minimo_pct / 100) 
        : 0

    const renderPaso = () => {
        switch (step) {
            case 1:
                return (
                    <div key="paso-1">
                        <div className={estilos.headerContenido}>
                            <h2 className={estilos.tituloSeccion}>
                                <ion-icon name="people-outline"></ion-icon>
                                Cliente y Plan
                            </h2>
                            <p className={estilos.descripcionSeccion}>
                                Seleccione el cliente y el plan de financiamiento
                            </p>
                        </div>

                        {/* Selección de Cliente */}
                        <div className={estilos.tarjeta}>
                            <h3 className={estilos.tituloTarjeta}>
                                <ion-icon name="person-outline"></ion-icon>
                                Cliente
                            </h3>

                            <div className={estilos.busquedaCliente}>
                                <ion-icon name="search-outline"></ion-icon>
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre, cédula, teléfono..."
                                    value={busquedaCliente}
                                    onChange={(e) => setBusquedaCliente(e.target.value)}
                                    className={estilos.inputBusqueda}
                                />
                                {busquedaCliente && (
                                    <button 
                                        className={estilos.btnLimpiar}
                                        onClick={() => setBusquedaCliente('')}
                                    >
                                        <ion-icon name="close-circle"></ion-icon>
                                    </button>
                                )}
                            </div>

                            {!busquedaCliente && clientes.length > 3 && (
                                <div className={estilos.ayudaBusqueda}>
                                    <ion-icon name="information-circle-outline"></ion-icon>
                                    <span>Mostrando los 3 primeros clientes. Use la búsqueda para encontrar otros.</span>
                                </div>
                            )}

                            <div className={estilos.listaClientes}>
                                {clientesFiltrados.length === 0 ? (
                                    <div className={estilos.sinDatos}>
                                        <ion-icon name="person-outline"></ion-icon>
                                        <p>No se encontraron clientes</p>
                                    </div>
                                ) : (
                                    clientesFiltrados.map(cliente => (
                                        <div 
                                            key={cliente.id}
                                            className={`${estilos.clienteCard} ${clienteSeleccionado?.id === cliente.id ? estilos.seleccionado : ''}`}
                                            onClick={() => seleccionarCliente(cliente)}
                                        >
                                            <div className={estilos.clienteAvatar}>
                                                {cliente.foto_url ? (
                                                    <img src={cliente.foto_url} alt={cliente.nombre} className={estilos.clienteFoto} />
                                                ) : (
                                                    <ion-icon name="person-circle-outline"></ion-icon>
                                                )}
                                            </div>
                                            <div className={estilos.clienteInfo}>
                                                <h4>{cliente.nombre} {cliente.apellidos || ''}</h4>
                                                <p><ion-icon name="card-outline"></ion-icon> {cliente.numero_documento}</p>
                                                {cliente.telefono && <p><ion-icon name="call-outline"></ion-icon> {cliente.telefono}</p>}
                                            </div>
                                            <div className={estilos.clienteCredito}>
                                                {cliente.tiene_credito ? (
                                                    <>
                                                        <div className={estilos.creditoBadge}>
                                                            <ion-icon name="wallet-outline"></ion-icon>
                                                            <span>{formatearMoneda(cliente.credito_disponible || 0)}</span>
                                                        </div>
                                                        <span className={`${estilos.clasificacionBadge} ${estilos['clasificacion' + cliente.clasificacion]}`}>
                                                            {cliente.clasificacion || 'N/A'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className={estilos.sinCredito}>Sin crédito</span>
                                                )}
                                            </div>
                                            {clienteSeleccionado?.id === cliente.id && (
                                                <div className={estilos.iconoCheckContainer}>
                                                    <ion-icon name="checkmark-circle"></ion-icon>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {clienteSeleccionado && validacionCredito && !validacionCredito.valido && (
                                <div className={estilos.alertaError}>
                                    <ion-icon name="alert-circle-outline"></ion-icon>
                                    <p>{validacionCredito.error}</p>
                                </div>
                            )}
                        </div>

                        {/* Selección de Plan */}
                        <div className={estilos.tarjeta}>
                            <h3 className={estilos.tituloTarjeta}>
                                <ion-icon name="card-outline"></ion-icon>
                                Plan de Financiamiento
                            </h3>

                            <div className={estilos.planesGrid}>
                                {planes.map(plan => (
                                    <div 
                                        key={plan.id}
                                        className={`${estilos.planCard} ${planSeleccionado?.id === plan.id ? estilos.activo : ''}`}
                                        onClick={() => seleccionarPlan(plan)}
                                    >
                                        <div className={estilos.planIcono}>
                                            <ion-icon name="trending-up-outline"></ion-icon>
                                        </div>
                                        <div className={estilos.planContenido}>
                                            <h4>{plan.nombre}</h4>
                                            <div className={estilos.planDetalles}>
                                                <div className={estilos.planDetalle}>
                                                    <ion-icon name="calendar-outline"></ion-icon>
                                                    <span>{plan.plazo_meses} meses</span>
                                                </div>
                                                <div className={estilos.planDetalle}>
                                                    <ion-icon name="analytics-outline"></ion-icon>
                                                    <span>{plan.tasa_interes_anual}% anual</span>
                                                </div>
                                                <div className={estilos.planDetalle}>
                                                    <ion-icon name="cash-outline"></ion-icon>
                                                    <span>{plan.pago_inicial_minimo_pct}% inicial</span>
                                                </div>
                                                {plan.requiere_fiador && (
                                                    <div className={`${estilos.planDetalle} ${estilos.requiereFiador}`}>
                                                        <ion-icon name="shield-checkmark-outline"></ion-icon>
                                                        <span>Requiere fiador</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {planSeleccionado?.id === plan.id && (
                                            <div className={estilos.planCheck}>
                                                <ion-icon name="checkmark-circle"></ion-icon>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div key="paso-2">
                        <div className={estilos.headerContenido}>
                            <h2 className={estilos.tituloSeccion}>
                                <ion-icon name="cube-outline"></ion-icon>
                                Equipos y Cálculos
                            </h2>
                            <p className={estilos.descripcionSeccion}>
                                Seleccione los equipos a financiar y revise los montos
                            </p>
                        </div>

                        {/* Selección de Equipos */}
                        <div className={estilos.tarjeta}>
                            <h3 className={estilos.tituloTarjeta}>
                                <ion-icon name="hardware-chip-outline"></ion-icon>
                                Equipos a Financiar
                            </h3>

                            {equipos.length === 0 ? (
                                <div className={estilos.sinDatos}>
                                    <ion-icon name="cube-outline"></ion-icon>
                                    <p>No hay equipos con activos disponibles en stock</p>
                                </div>
                            ) : (
                                <div className={estilos.equiposLista}>
                                    {equipos.map(equipo => {
                                        const seleccionadosDeEsteEquipo = contarActivosSeleccionadosDeEquipo(equipo.id)
                                        const tieneSeleccionados = seleccionadosDeEsteEquipo > 0
                                        return (
                                            <div 
                                                key={equipo.id} 
                                                className={`${estilos.equipoFila} ${tieneSeleccionados ? estilos.conSeleccion : ''}`}
                                                onClick={() => abrirModalEquipo(equipo)}
                                            >
                                                <div className={estilos.equipoFilaImagen}>
                                                    {equipo.imagen_url ? (
                                                        <img src={equipo.imagen_url} alt={equipo.nombre} />
                                                    ) : (
                                                        <div className={estilos.equipoFilaPlaceholder}>
                                                            <ion-icon name="cube-outline"></ion-icon>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={estilos.equipoFilaInfo}>
                                                    <h4 className={estilos.equipoFilaNombre}>{equipo.nombre}</h4>
                                                    <div className={estilos.equipoFilaMeta}>
                                                        {equipo.marca && (
                                                            <span className={estilos.equipoFilaMarca}>
                                                                <ion-icon name="pricetag-outline"></ion-icon>
                                                                {equipo.marca}
                                                            </span>
                                                        )}
                                                        {equipo.categoria && (
                                                            <span className={estilos.equipoFilaCategoria}>
                                                                <ion-icon name="folder-outline"></ion-icon>
                                                                {equipo.categoria}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={estilos.equipoFilaPrecio}>
                                                    {formatearMoneda(equipo.precio_venta)}
                                                </div>
                                                <div className={estilos.equipoFilaStock}>
                                                    <span className={`${estilos.stockBadge} ${equipo.activos_disponibles > 0 ? estilos.disponible : estilos.agotado}`}>
                                                        <ion-icon name="layers-outline"></ion-icon>
                                                        {equipo.activos_disponibles} unidades
                                                    </span>
                                                </div>
                                                <div className={estilos.equipoFilaAcciones}>
                                                    {tieneSeleccionados ? (
                                                        <div className={estilos.badgeSeleccionadosFila}>
                                                            <ion-icon name="checkmark-circle"></ion-icon>
                                                            <span>{seleccionadosDeEsteEquipo} seleccionados</span>
                                                        </div>
                                                    ) : (
                                                        <button className={estilos.btnSeleccionarFila}>
                                                            <ion-icon name="add-circle-outline"></ion-icon>
                                                            <span>Seleccionar</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {activosSeleccionados.length > 0 && (
                                <div className={estilos.resumenSeleccion}>
                                    <div className={estilos.resumenSeleccionHeader}>
                                        <ion-icon name="cart-outline"></ion-icon>
                                        <span>Activos Seleccionados ({activosSeleccionados.length})</span>
                                    </div>
                                    <div className={estilos.activosSeleccionadosLista}>
                                        {activos.filter(a => activosSeleccionados.includes(a.id)).map(activo => (
                                            <div key={activo.id} className={estilos.activoSeleccionadoItem}>
                                                <div className={estilos.activoSeleccionadoInfo}>
                                                    <span className={estilos.activoSeleccionadoNombre}>{activo.producto_nombre}</span>
                                                    <span className={estilos.activoSeleccionadoCodigo}>{activo.codigo_activo}</span>
                                                </div>
                                                <span className={estilos.activoSeleccionadoPrecio}>{formatearMoneda(activo.precio_venta)}</span>
                                                <button 
                                                    className={estilos.btnRemoverActivo}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleActivo(activo)
                                                    }}
                                                >
                                                    <ion-icon name="close-circle"></ion-icon>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={estilos.precioTotalCard}>
                                        <div className={estilos.precioTotalLabel}>
                                            <ion-icon name="calculator-outline"></ion-icon>
                                            <span>Precio total seleccionado</span>
                                        </div>
                                        <div className={estilos.precioTotalValor}>
                                            {formatearMoneda(precioTotal)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cálculos */}
                        {precioTotal > 0 && (
                            <>
                                <div className={estilos.tarjeta}>
                                    <h3 className={estilos.tituloTarjeta}>
                                        <ion-icon name="calculator-outline"></ion-icon>
                                        Cálculos del Financiamiento
                                    </h3>

                                    <div className={estilos.calculosGrid}>
                                        <div className={estilos.campoCalculado}>
                                            <label>Precio Total</label>
                                            <div className={estilos.valorCalculado}>
                                                <ion-icon name="lock-closed-outline"></ion-icon>
                                                <span>{formatearMoneda(precioTotal)}</span>
                                            </div>
                                            <small>Calculado desde los activos seleccionados</small>
                                        </div>

                                        <div className={estilos.grupoInput}>
                                            <label>
                                                <ion-icon name="wallet-outline"></ion-icon>
                                                Pago Inicial *
                                            </label>
                                            <input 
                                                type="number"
                                                value={pagoInicial}
                                                onChange={(e) => setPagoInicial(parseFloat(e.target.value) || 0)}
                                                min={0}
                                                step="0.01"
                                                className={pagoInicial < pagoInicialMinimo ? estilos.inputError : ''}
                                            />
                                            <div className={estilos.rangoVisual}>
                                                <div 
                                                    className={estilos.rangoFill} 
                                                    style={{ width: `${Math.min((pagoInicial / precioTotal) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <small className={estilos.ayuda}>
                                                Mínimo: {formatearMoneda(pagoInicialMinimo)} ({planSeleccionado?.pago_inicial_minimo_pct}%)
                                            </small>
                                            {pagoInicial < pagoInicialMinimo && (
                                                <span className={estilos.mensajeError}>
                                                    <ion-icon name="alert-circle-outline"></ion-icon>
                                                    El pago inicial es insuficiente
                                                </span>
                                            )}
                                        </div>

                                        <div className={estilos.grupoInput}>
                                            <label>
                                                <ion-icon name="calendar-outline"></ion-icon>
                                                Número de Cuotas
                                            </label>
                                            <input 
                                                type="number"
                                                value={numeroCuotas}
                                                onChange={(e) => setNumeroCuotas(parseInt(e.target.value) || 12)}
                                                min={1}
                                                max={60}
                                                disabled
                                            />
                                            <small className={estilos.ayuda}>
                                                Definido por el plan: {planSeleccionado?.plazo_meses} meses
                                            </small>
                                        </div>

                                        <div className={estilos.grupoInput}>
                                            <label>
                                                <ion-icon name="calendar-outline"></ion-icon>
                                                Fecha Primer Pago *
                                            </label>
                                            <input 
                                                type="date"
                                                value={fechaPrimerPago}
                                                onChange={(e) => setFechaPrimerPago(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {vistaPrevia && (
                                    <div className={estilos.tarjetaDestacada}>
                                        <h3 className={estilos.tituloTarjeta}>
                                            <ion-icon name="stats-chart-outline"></ion-icon>
                                            Resumen Financiero
                                        </h3>
                                        <div className={estilos.resumenFinancieroMejorado}>
                                            <div className={`${estilos.montoItemMejorado} ${estilos.montoFinanciado}`}>
                                                <div className={estilos.montoIcono}>
                                                    <ion-icon name="wallet-outline"></ion-icon>
                                                </div>
                                                <div className={estilos.montoDetalle}>
                                                    <span className={estilos.montoLabel}>Monto Financiado</span>
                                                    <strong className={estilos.montoValor}>{formatearMoneda(vistaPrevia.montoFinanciado)}</strong>
                                                    <span className={estilos.montoSubtexto}>Capital a financiar</span>
                                                </div>
                                            </div>
                                            <div className={`${estilos.montoItemMejorado} ${estilos.cuotaMensual}`}>
                                                <div className={estilos.montoIcono}>
                                                    <ion-icon name="calendar-outline"></ion-icon>
                                                </div>
                                                <div className={estilos.montoDetalle}>
                                                    <span className={estilos.montoLabel}>Cuota Mensual</span>
                                                    <strong className={estilos.montoValor}>{formatearMoneda(vistaPrevia.cuotaMensual)}</strong>
                                                    <span className={estilos.montoSubtexto}>{numeroCuotas} cuotas</span>
                                                </div>
                                            </div>
                                            <div className={`${estilos.montoItemMejorado} ${estilos.totalIntereses}`}>
                                                <div className={estilos.montoIcono}>
                                                    <ion-icon name="trending-up-outline"></ion-icon>
                                                </div>
                                                <div className={estilos.montoDetalle}>
                                                    <span className={estilos.montoLabel}>Total Intereses</span>
                                                    <strong className={estilos.montoValor}>{formatearMoneda(vistaPrevia.totalIntereses)}</strong>
                                                    <span className={estilos.montoSubtexto}>{planSeleccionado?.tasa_interes_anual}% anual</span>
                                                </div>
                                            </div>
                                            <div className={`${estilos.montoItemMejorado} ${estilos.totalPagar}`}>
                                                <div className={estilos.montoIcono}>
                                                    <ion-icon name="cash-outline"></ion-icon>
                                                </div>
                                                <div className={estilos.montoDetalle}>
                                                    <span className={estilos.montoLabel}>Total a Pagar</span>
                                                    <strong className={estilos.montoValorDestacado}>{formatearMoneda(vistaPrevia.totalPagar)}</strong>
                                                    <span className={estilos.montoSubtexto}>Incluye intereses</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {cronogramaPreview.length > 0 && (
                                    <div className={estilos.tarjeta}>
                                        <h3 className={estilos.tituloTarjeta}>
                                            <ion-icon name="list-outline"></ion-icon>
                                            Vista Previa del Cronograma
                                        </h3>
                                        <div className={estilos.tablaCronogramaContainer}>
                                            <table className={estilos.tablaCronograma}>
                                                <thead>
                                                    <tr>
                                                        <th>Cuota</th>
                                                        <th>Fecha</th>
                                                        <th>Capital</th>
                                                        <th>Interés</th>
                                                        <th>Total</th>
                                                        <th>Saldo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cronogramaPreview.map(cuota => (
                                                        <tr key={cuota.numero_cuota}>
                                                            <td>{cuota.numero_cuota}</td>
                                                            <td>{formatearFecha(cuota.fecha_vencimiento)}</td>
                                                            <td>{formatearMoneda(cuota.monto_capital)}</td>
                                                            <td>{formatearMoneda(cuota.monto_interes)}</td>
                                                            <td><strong>{formatearMoneda(cuota.monto_cuota)}</strong></td>
                                                            <td>{formatearMoneda(cuota.saldo_restante)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className={estilos.notaCronograma}>
                                            <ion-icon name="information-circle-outline"></ion-icon>
                                            Mostrando primeras 3 de {numeroCuotas} cuotas
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )

            case 3:
                return (
                    <div key="paso-3">
                        <div className={estilos.headerContenido}>
                            <h2 className={estilos.tituloSeccion}>
                                <ion-icon name="checkmark-done-outline"></ion-icon>
                                Confirmación
                            </h2>
                            <p className={estilos.descripcionSeccion}>
                                Revise todos los datos antes de crear el contrato
                            </p>
                        </div>

                        {/* Resumen */}
                        <div className={estilos.resumenCompleto}>
                            <div className={estilos.resumenSeccion}>
                                <h3>
                                    <ion-icon name="person-outline"></ion-icon>
                                    Cliente
                                </h3>
                                <div className={estilos.resumenContenido}>
                                    <div className={estilos.resumenItem}>
                                        <span>Nombre:</span>
                                        <strong>{clienteSeleccionado?.nombre} {clienteSeleccionado?.apellidos || ''}</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Documento:</span>
                                        <strong>{clienteSeleccionado?.numero_documento}</strong>
                                    </div>
                                    {clienteSeleccionado?.telefono && (
                                        <div className={estilos.resumenItem}>
                                            <span>Teléfono:</span>
                                            <strong>{clienteSeleccionado.telefono}</strong>
                                        </div>
                                    )}
                                    {clienteSeleccionado?.tiene_credito && (
                                        <div className={estilos.resumenItem}>
                                            <span>Crédito disponible:</span>
                                            <strong className={estilos.creditoVerde}>{formatearMoneda(clienteSeleccionado.credito_disponible || 0)}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={estilos.resumenSeccion}>
                                <h3>
                                    <ion-icon name="card-outline"></ion-icon>
                                    Plan
                                </h3>
                                <div className={estilos.resumenContenido}>
                                    <div className={estilos.resumenItem}>
                                        <span>Nombre:</span>
                                        <strong>{planSeleccionado?.nombre}</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Plazo:</span>
                                        <strong>{planSeleccionado?.plazo_meses} meses</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Tasa anual:</span>
                                        <strong>{planSeleccionado?.tasa_interes_anual}%</strong>
                                    </div>
                                </div>
                            </div>

                            <div className={estilos.resumenSeccion}>
                                <h3>
                                    <ion-icon name="cube-outline"></ion-icon>
                                    Activos Seleccionados
                                </h3>
                                <div className={estilos.resumenContenido}>
                                    {activos.filter(a => activosSeleccionados.includes(a.id)).map(activo => (
                                        <div key={activo.id} className={estilos.activoResumen}>
                                            {activo.imagen_url && (
                                                <img src={activo.imagen_url} alt={activo.producto_nombre} className={estilos.activoResumenImg} />
                                            )}
                                            <div>
                                                <strong>{activo.producto_nombre}</strong>
                                                <p>Serie: {activo.numero_serie || 'N/A'}</p>
                                            </div>
                                            <span className={estilos.activoResumenPrecio}>
                                                {formatearMoneda(activo.precio_venta)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={estilos.resumenSeccion}>
                                <h3>
                                    <ion-icon name="cash-outline"></ion-icon>
                                    Montos
                                </h3>
                                <div className={estilos.resumenContenido}>
                                    <div className={estilos.resumenItem}>
                                        <span>Precio total:</span>
                                        <strong>{formatearMoneda(precioTotal)}</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Pago inicial:</span>
                                        <strong>{formatearMoneda(pagoInicial)}</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Monto financiado:</span>
                                        <strong className={estilos.montoPrincipal}>{formatearMoneda(precioTotal - pagoInicial)}</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Cuota mensual:</span>
                                        <strong>{formatearMoneda(vistaPrevia?.cuotaMensual || 0)}</strong>
                                    </div>
                                    <div className={estilos.resumenItem}>
                                        <span>Total intereses:</span>
                                        <strong>{formatearMoneda(vistaPrevia?.totalIntereses || 0)}</strong>
                                    </div>
                                    <div className={estilos.resumenItemDestacado}>
                                        <span>Total a pagar:</span>
                                        <strong>{formatearMoneda(vistaPrevia?.totalPagar || 0)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fiador y Notas */}
                        <div className={estilos.tarjeta}>
                            <h3 className={estilos.tituloTarjeta}>
                                <ion-icon name="shield-checkmark-outline"></ion-icon>
                                Fiador {requiereFiador ? '(Requerido)' : '(Opcional)'}
                            </h3>

                            {requiereFiador && (
                                <div className={estilos.alertaFiador}>
                                    <ion-icon name="information-circle-outline"></ion-icon>
                                    <p>Este plan requiere un fiador o garante</p>
                                </div>
                            )}

                            {(!requiereFiador && !mostrarFiadorOpcional) ? (
                                <div className={estilos.noRequiereFiador}>
                                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                                    <p>Este plan no requiere fiador</p>
                                    <button 
                                        type="button"
                                        onClick={() => setMostrarFiadorOpcional(true)}
                                        className={estilos.btnToggle}
                                    >
                                        <ion-icon name="add-outline"></ion-icon>
                                        Agregar fiador opcional
                                    </button>
                                </div>
                            ) : (
                                <div className={estilos.fiadorForm}>
                                    {!requiereFiador && (
                                        <button 
                                            type="button"
                                            onClick={() => setMostrarFiadorOpcional(false)}
                                            className={estilos.btnOcultarFiador}
                                        >
                                            <ion-icon name="close-outline"></ion-icon>
                                            Quitar fiador opcional
                                        </button>
                                    )}
                                    <div className={estilos.grid2Columnas}>
                                        <div className={estilos.grupoInput}>
                                            <label>
                                                <ion-icon name="person-outline"></ion-icon>
                                                Nombre completo {requiereFiador ? '*' : ''}
                                            </label>
                                            <input 
                                                type="text" 
                                                name="nombre_fiador" 
                                                value={formData.nombre_fiador}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nombre_fiador: e.target.value }))}
                                                placeholder="Nombre del fiador"
                                                required={requiereFiador}
                                            />
                                        </div>
                                        <div className={estilos.grupoInput}>
                                            <label>
                                                <ion-icon name="card-outline"></ion-icon>
                                                Documento {requiereFiador ? '*' : ''}
                                            </label>
                                            <input 
                                                type="text" 
                                                name="documento_fiador" 
                                                value={formData.documento_fiador}
                                                onChange={(e) => setFormData(prev => ({ ...prev, documento_fiador: e.target.value }))}
                                                placeholder="Cédula del fiador"
                                                required={requiereFiador}
                                            />
                                        </div>
                                        <div className={estilos.grupoInput}>
                                            <label>
                                                <ion-icon name="call-outline"></ion-icon>
                                                Teléfono {requiereFiador ? '*' : ''}
                                            </label>
                                            <input 
                                                type="tel" 
                                                name="telefono_fiador" 
                                                value={formData.telefono_fiador}
                                                onChange={(e) => setFormData(prev => ({ ...prev, telefono_fiador: e.target.value }))}
                                                placeholder="Teléfono del fiador"
                                                required={requiereFiador}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={estilos.tarjeta}>
                            <h3 className={estilos.tituloTarjeta}>
                                <ion-icon name="document-text-outline"></ion-icon>
                                Información Adicional
                            </h3>
                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="receipt-outline"></ion-icon>
                                    NCF (Opcional)
                                </label>
                                <input 
                                    type="text"
                                    value={formData.ncf}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ncf: e.target.value }))}
                                    placeholder="Número de Comprobante Fiscal"
                                />
                            </div>
                            <div className={estilos.grupoInput}>
                                <label>
                                    <ion-icon name="create-outline"></ion-icon>
                                    Notas
                                </label>
                                <textarea
                                    name="notas"
                                    value={formData.notas}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                                    rows="4"
                                    placeholder="Notas adicionales sobre el contrato..."
                                />
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
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
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.layoutConSidebar}>
                {/* Sidebar con pasos */}
                <div className={estilos.sidebar}>
                    <div className={estilos.sidebarHeader}>
                        <h2 className={estilos.sidebarTitulo}>
                            <ion-icon name="document-text-outline"></ion-icon>
                            Nuevo Contrato
                        </h2>
                        <p className={estilos.sidebarSubtitulo}>Siga los pasos para crear el contrato</p>
                    </div>

                    <div className={estilos.pasosVerticales}>
                        {PASOS.map((paso) => (
                            <div 
                                key={paso.numero}
                                className={`${estilos.pasoItem} ${step === paso.numero ? estilos.activo : ''} ${step > paso.numero ? estilos.completado : ''}`}
                                onClick={() => {
                                    if (paso.numero < step) {
                                        setStep(paso.numero)
                                    }
                                }}
                            >
                                <div className={estilos.pasoIcono}>
                                    {step > paso.numero ? (
                                        <ion-icon name="checkmark"></ion-icon>
                                    ) : (
                                        <ion-icon name={paso.icon}></ion-icon>
                                    )}
                                </div>
                                <div className={estilos.pasoInfo}>
                                    <span className={estilos.pasoLabel}>{paso.label}</span>
                                    <span className={estilos.pasoDescripcion}>{paso.descripcion}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/admin/contratos" className={estilos.btnVolverSidebar}>
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        Volver a contratos
                    </Link>
                </div>

                {/* Contenido principal */}
                <div className={estilos.contenidoPrincipal}>
                    {renderPaso()}

                    {/* Navegación */}
                    <div className={estilos.navegacion}>
                        {step > 1 && (
                            <button onClick={handleBack} className={estilos.btnAnterior} disabled={procesando}>
                                <ion-icon name="chevron-back-outline"></ion-icon>
                                Anterior
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button 
                                onClick={handleNext} 
                                className={estilos.btnSiguiente}
                                disabled={procesando}
                            >
                                Siguiente
                                <ion-icon name="chevron-forward-outline"></ion-icon>
                            </button>
                        ) : (
                            <button 
                                onClick={confirmarContrato} 
                                className={estilos.btnConfirmar} 
                                disabled={procesando}
                            >
                                {procesando ? (
                                    <>
                                        <ion-icon name="hourglass-outline"></ion-icon>
                                        Creando contrato...
                                    </>
                                ) : (
                                    <>
                                        <ion-icon name="checkmark-circle-outline"></ion-icon>
                                        Confirmar y Crear Contrato
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para seleccionar activos de un equipo */}
            {modalEquipoAbierto && equipoParaModal && (
                <div className={estilos.modalOverlay} onClick={cerrarModalEquipo}>
                    <div className={estilos.modalContenido} onClick={(e) => e.stopPropagation()}>
                        <div className={estilos.modalHeader}>
                            <div className={estilos.modalHeaderInfo}>
                                <div className={estilos.modalEquipoImagen}>
                                    {equipoParaModal.imagen_url ? (
                                        <img src={equipoParaModal.imagen_url} alt={equipoParaModal.nombre} />
                                    ) : (
                                        <div className={estilos.modalImagenPlaceholder}>
                                            <ion-icon name="cube-outline"></ion-icon>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className={estilos.modalTitulo}>{equipoParaModal.nombre}</h3>
                                    {equipoParaModal.marca && (
                                        <p className={estilos.modalSubtitulo}>{equipoParaModal.marca}</p>
                                    )}
                                    <p className={estilos.modalPrecio}>{formatearMoneda(equipoParaModal.precio_venta)} c/u</p>
                                </div>
                            </div>
                            <button className={estilos.modalCerrar} onClick={cerrarModalEquipo}>
                                <ion-icon name="close-outline"></ion-icon>
                            </button>
                        </div>

                        <div className={estilos.modalCuerpo}>
                            <div className={estilos.modalInstrucciones}>
                                <ion-icon name="information-circle-outline"></ion-icon>
                                <span>Seleccione las unidades específicas que desea financiar</span>
                            </div>

                            <div className={estilos.activosModalGrid}>
                                {activosDelEquipo.map(activo => (
                                    <div 
                                        key={activo.id}
                                        className={`${estilos.activoModalCard} ${activosSeleccionados.includes(activo.id) ? estilos.activoModalSeleccionado : ''}`}
                                        onClick={() => toggleActivoModal(activo)}
                                    >
                                        <div className={estilos.activoModalCheck}>
                                            <input 
                                                type="checkbox"
                                                checked={activosSeleccionados.includes(activo.id)}
                                                onChange={() => {}}
                                            />
                                        </div>
                                        <div className={estilos.activoModalInfo}>
                                            <span className={estilos.activoModalCodigo}>
                                                <ion-icon name="barcode-outline"></ion-icon>
                                                {activo.codigo_activo}
                                            </span>
                                            {activo.numero_serie && (
                                                <span className={estilos.activoModalSerie}>
                                                    <ion-icon name="key-outline"></ion-icon>
                                                    Serie: {activo.numero_serie}
                                                </span>
                                            )}
                                            {activo.vin && (
                                                <span className={estilos.activoModalVin}>
                                                    <ion-icon name="car-outline"></ion-icon>
                                                    VIN: {activo.vin}
                                                </span>
                                            )}
                                        </div>
                                        <span className={estilos.activoModalPrecio}>
                                            {formatearMoneda(activo.precio_venta)}
                                        </span>
                                        {activosSeleccionados.includes(activo.id) && (
                                            <div className={estilos.activoModalCheckIcon}>
                                                <ion-icon name="checkmark-circle"></ion-icon>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={estilos.modalFooter}>
                            <div className={estilos.modalResumen}>
                                <span>{contarActivosSeleccionadosDeEquipo(equipoParaModal.id)} unidades seleccionadas</span>
                                <strong>{formatearMoneda(contarActivosSeleccionadosDeEquipo(equipoParaModal.id) * equipoParaModal.precio_venta)}</strong>
                            </div>
                            <button className={estilos.btnConfirmarModal} onClick={cerrarModalEquipo}>
                                <ion-icon name="checkmark-outline"></ion-icon>
                                Confirmar Selección
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
