"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    CreditCard,
    FileText,
    Calendar,
    Percent,
    DollarSign,
    AlertCircle,
    Clock,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    TrendingUp,
    Shield,
    User,
    Wallet,
    Calculator,
    Loader2
} from 'lucide-react'
import { actualizarPlanFinanciamiento, obtenerPlanPorId } from './servidor'
import { tasaAnualAMensual } from '../../core/finance/calculos'
import estilos from './editar.module.css'

export default function EditarPlan({ planId }) {
    const router = useRouter()
    const params = useParams()
    const id = planId || params?.id
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        plazo_meses: 12,
        tasa_interes_anual: 18.00,
        pago_inicial_minimo_pct: 15.00,
        monto_minimo: 0,
        monto_maximo: null,
        penalidad_mora_pct: 5.00,
        dias_gracia: 5,
        descuento_pago_anticipado_pct: 0,
        cuotas_minimas_anticipadas: 3,
        activo: true,
        permite_pago_anticipado: true,
        requiere_fiador: false
    })

    // Plazos predefinidos para selección rápida
    const plazosComunes = [
        { meses: 6, label: '6 meses' },
        { meses: 12, label: '12 meses' },
        { meses: 18, label: '18 meses' },
        { meses: 24, label: '24 meses' },
        { meses: 36, label: '36 meses' }
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
        const cargarPlan = async () => {
            if (!id) return

            setCargando(true)
            setError(null)
            try {
                const resultado = await obtenerPlanPorId(id)

                if (resultado.success && resultado.plan) {
                    const plan = resultado.plan
                    setFormData({
                        codigo: plan.codigo,
                        nombre: plan.nombre,
                        descripcion: plan.descripcion || '',
                        plazo_meses: plan.plazo_meses,
                        tasa_interes_anual: plan.tasa_interes_anual,
                        pago_inicial_minimo_pct: plan.pago_inicial_minimo_pct,
                        monto_minimo: plan.monto_minimo || 0,
                        monto_maximo: plan.monto_maximo || null,
                        penalidad_mora_pct: plan.penalidad_mora_pct,
                        dias_gracia: plan.dias_gracia,
                        descuento_pago_anticipado_pct: plan.descuento_pago_anticipado_pct || 0,
                        cuotas_minimas_anticipadas: plan.cuotas_minimas_anticipadas || 3,
                        activo: plan.activo === 1,
                        permite_pago_anticipado: plan.permite_pago_anticipado === 1,
                        requiere_fiador: plan.requiere_fiador === 1
                    })
                } else {
                    setError(resultado.mensaje || 'Plan no encontrado')
                }
            } catch (error) {
                console.error('Error al cargar plan:', error)
                setError('Error al cargar plan')
            } finally {
                setCargando(false)
            }
        }

        cargarPlan()
    }, [id])

    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    const calcularEjemploCuota = () => {
        if (!formData.plazo_meses || !formData.tasa_interes_anual) return null

        const montoEjemplo = 100000
        const pagoInicial = montoEjemplo * (formData.pago_inicial_minimo_pct / 100)
        const montoFinanciado = montoEjemplo - pagoInicial
        const tasaMensual = tasaAnualAMensual(formData.tasa_interes_anual)
        const factor = Math.pow(1 + tasaMensual, formData.plazo_meses)
        const cuota = montoFinanciado * (tasaMensual * factor) / (factor - 1)
        const totalIntereses = (cuota * formData.plazo_meses) - montoFinanciado
        const totalPagar = cuota * formData.plazo_meses

        return {
            precioProducto: montoEjemplo,
            pagoInicial: Math.round(pagoInicial * 100) / 100,
            montoFinanciado: Math.round(montoFinanciado * 100) / 100,
            cuotaMensual: Math.round(cuota * 100) / 100,
            totalIntereses: Math.round(totalIntereses * 100) / 100,
            totalPagar: Math.round(totalPagar * 100) / 100,
            totalConInicial: Math.round((totalPagar + pagoInicial) * 100) / 100
        }
    }

    const guardarPlan = async () => {
        setProcesando(true)
        try {
            const resultado = await actualizarPlanFinanciamiento(id, formData)

            if (resultado.success) {
                alert(resultado.mensaje || 'Plan actualizado exitosamente')
                router.push('/admin/planes')
            } else {
                alert(resultado.mensaje || 'Error al actualizar plan')
            }
        } catch (error) {
            console.error('Error al actualizar plan:', error)
            alert('Error al actualizar plan')
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

    const ejemploCuota = calcularEjemploCuota()

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <Loader2 className={estilos.iconoCargando} />
                    <span>Cargando plan...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.error}>
                    <AlertCircle size={64} />
                    <p>{error}</p>
                    <button className={estilos.btnVolver} onClick={() => router.push('/admin/planes')}>
                        Volver a Planes
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <CreditCard className={estilos.iconoTitulo} />
                    <div>
                        <h1 className={estilos.titulo}>Editar Plan de Financiamiento</h1>
                        <p className={estilos.subtitulo}>Modifique la información del plan</p>
                    </div>
                </div>
            </div>

            <div className={estilos.contenedorPrincipal}>
                {/* Columna Izquierda - Formulario */}
                <div className={estilos.columnaFormulario}>
                    {/* Sección 1: Información Básica */}
                    <div className={estilos.seccion}>
                        <div className={estilos.seccionHeader}>
                            <FileText className={estilos.seccionIcono} />
                            <h2 className={estilos.seccionTitulo}>Información Básica</h2>
                        </div>
                        <div className={estilos.formGrid}>
                            <div className={estilos.formGroup}>
                                <label>
                                    <FileText size={16} />
                                    Código *
                                </label>
                                <input
                                    type="text"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={manejarCambio}
                                    disabled
                                    className={estilos.inputDeshabilitado}
                                />
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <CreditCard size={16} />
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={manejarCambio}
                                    placeholder="Ej: Plan 12 Meses"
                                    required
                                />
                            </div>

                            <div className={`${estilos.formGroup} ${estilos.fullWidth}`}>
                                <label>
                                    <FileText size={16} />
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={manejarCambio}
                                    placeholder="Descripción opcional del plan..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Términos Financieros */}
                    <div className={estilos.seccion}>
                        <div className={estilos.seccionHeader}>
                            <Calculator className={estilos.seccionIcono} />
                            <h2 className={estilos.seccionTitulo}>Términos Financieros</h2>
                        </div>
                        <div className={estilos.formGrid}>
                            {/* Selector de plazo con botones */}
                            <div className={`${estilos.formGroup} ${estilos.fullWidth}`}>
                                <label>
                                    <Calendar size={16} />
                                    Plazo de Financiamiento *
                                </label>
                                <div className={estilos.radioGroup}>
                                    {plazosComunes.map(plazo => (
                                        <button
                                            key={plazo.meses}
                                            type="button"
                                            className={`${estilos.radioBtn} ${formData.plazo_meses === plazo.meses ? estilos.activo : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, plazo_meses: plazo.meses }))}
                                        >
                                            <Calendar size={18} />
                                            {plazo.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    name="plazo_meses"
                                    value={formData.plazo_meses}
                                    onChange={manejarCambio}
                                    placeholder="O ingrese meses personalizados"
                                    min="1"
                                    max="60"
                                    className={estilos.inputPequeño}
                                />
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <TrendingUp size={16} />
                                    Tasa de Interés Anual (%) *
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <Percent className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="tasa_interes_anual"
                                        value={formData.tasa_interes_anual}
                                        onChange={manejarCambio}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="18.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <Wallet size={16} />
                                    Pago Inicial Mínimo (%) *
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <Percent className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="pago_inicial_minimo_pct"
                                        value={formData.pago_inicial_minimo_pct}
                                        onChange={manejarCambio}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="15.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <DollarSign size={16} />
                                    Monto Mínimo Financiable
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <DollarSign className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="monto_minimo"
                                        value={formData.monto_minimo}
                                        onChange={manejarCambio}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <small className={estilos.helperText}>
                                    Monto mínimo requerido para aplicar este plan. Dejar en 0 para sin límite mínimo.
                                </small>
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <DollarSign size={16} />
                                    Monto Máximo
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <DollarSign className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="monto_maximo"
                                        value={formData.monto_maximo || ''}
                                        onChange={manejarCambio}
                                        min="0"
                                        step="0.01"
                                        placeholder="Sin límite"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Penalidades y Descuentos */}
                    <div className={estilos.seccion}>
                        <div className={estilos.seccionHeader}>
                            <AlertCircle className={estilos.seccionIcono} />
                            <h2 className={estilos.seccionTitulo}>Penalidades y Descuentos</h2>
                        </div>
                        <div className={estilos.formGrid}>
                            <div className={estilos.formGroup}>
                                <label>
                                    <AlertCircle size={16} />
                                    Penalidad por Mora (%) *
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <Percent className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="penalidad_mora_pct"
                                        value={formData.penalidad_mora_pct}
                                        onChange={manejarCambio}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="5.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <Clock size={16} />
                                    Días de Gracia *
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <Calendar className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="dias_gracia"
                                        value={formData.dias_gracia}
                                        onChange={manejarCambio}
                                        min="0"
                                        placeholder="5"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <Sparkles size={16} />
                                    Descuento Pago Anticipado (%)
                                </label>
                                <div className={estilos.inputConIcono}>
                                    <Percent className={estilos.iconoInput} size={18} />
                                    <input
                                        type="number"
                                        name="descuento_pago_anticipado_pct"
                                        value={formData.descuento_pago_anticipado_pct}
                                        onChange={manejarCambio}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className={estilos.formGroup}>
                                <label>
                                    <Calendar size={16} />
                                    Cuotas Mínimas Anticipadas
                                </label>
                                <input
                                    type="number"
                                    name="cuotas_minimas_anticipadas"
                                    value={formData.cuotas_minimas_anticipadas}
                                    onChange={manejarCambio}
                                    min="1"
                                    placeholder="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 4: Configuración */}
                    <div className={estilos.seccion}>
                        <div className={estilos.seccionHeader}>
                            <Shield className={estilos.seccionIcono} />
                            <h2 className={estilos.seccionTitulo}>Configuración del Plan</h2>
                        </div>
                        <div className={estilos.togglesContainer}>
                            <div className={estilos.toggleItem}>
                                <div className={estilos.toggleInfo}>
                                    <CheckCircle2 size={20} />
                                    <div>
                                        <strong>Plan Activo</strong>
                                        <span>El plan estará disponible para usar inmediatamente</span>
                                    </div>
                                </div>
                                <label className={estilos.toggle}>
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo}
                                        onChange={manejarCambio}
                                    />
                                    <span className={estilos.toggleSlider}></span>
                                </label>
                            </div>

                            <div className={estilos.toggleItem}>
                                <div className={estilos.toggleInfo}>
                                    <Sparkles size={20} />
                                    <div>
                                        <strong>Permite Pago Anticipado</strong>
                                        <span>Los clientes pueden pagar cuotas por adelantado</span>
                                    </div>
                                </div>
                                <label className={estilos.toggle}>
                                    <input
                                        type="checkbox"
                                        name="permite_pago_anticipado"
                                        checked={formData.permite_pago_anticipado}
                                        onChange={manejarCambio}
                                    />
                                    <span className={estilos.toggleSlider}></span>
                                </label>
                            </div>

                            <div className={estilos.toggleItem}>
                                <div className={estilos.toggleInfo}>
                                    <User size={20} />
                                    <div>
                                        <strong>Requiere Fiador</strong>
                                        <span>Se necesitará un fiador para aprobar el financiamiento</span>
                                    </div>
                                </div>
                                <label className={estilos.toggle}>
                                    <input
                                        type="checkbox"
                                        name="requiere_fiador"
                                        checked={formData.requiere_fiador}
                                        onChange={manejarCambio}
                                    />
                                    <span className={estilos.toggleSlider}></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className={estilos.footer}>
                        <button 
                            className={estilos.btnCancelar} 
                            onClick={() => router.push('/admin/planes')}
                            disabled={procesando}
                        >
                            Cancelar
                        </button>
                        <button 
                            className={estilos.btnGuardar} 
                            onClick={guardarPlan}
                            disabled={procesando}
                        >
                            {procesando ? 'Actualizando...' : 'Actualizar Plan'}
                            <CheckCircle2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Columna Derecha - Vista Previa Paso a Paso */}
                <div className={estilos.columnaVista}>
                    <div className={estilos.vistaPrevia}>
                        <div className={estilos.vistaPreviaHeader}>
                            <Calculator size={24} />
                            <h3>Simulación del Plan</h3>
                            <p>Ejemplo con producto de {formatearMoneda(100000)}</p>
                        </div>

                        {ejemploCuota && (
                            <div className={estilos.pasosPlan}>
                                {/* Paso 1: Precio del Producto */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>
                                        <span>1</span>
                                    </div>
                                    <div className={estilos.pasoContenido}>
                                        <div className={estilos.pasoHeader}>
                                            <DollarSign size={20} />
                                            <h4>Precio del Producto</h4>
                                        </div>
                                        <div className={estilos.pasoValor}>
                                            {formatearMoneda(ejemploCuota.precioProducto)}
                                        </div>
                                        <p className={estilos.pasoDescripcion}>
                                            Precio total del producto o servicio
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaSeparador} />

                                {/* Paso 2: Pago Inicial */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>
                                        <span>2</span>
                                    </div>
                                    <div className={estilos.pasoContenido}>
                                        <div className={estilos.pasoHeader}>
                                            <Wallet size={20} />
                                            <h4>Pago Inicial</h4>
                                        </div>
                                        <div className={estilos.pasoValor}>
                                            {formatearMoneda(ejemploCuota.pagoInicial)}
                                        </div>
                                        <p className={estilos.pasoDescripcion}>
                                            {formData.pago_inicial_minimo_pct}% del precio total
                                        </p>
                                        <div className={estilos.pasoDetalle}>
                                            <span>Al momento de la compra</span>
                                        </div>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaSeparador} />

                                {/* Paso 3: Monto a Financiar */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>
                                        <span>3</span>
                                    </div>
                                    <div className={estilos.pasoContenido}>
                                        <div className={estilos.pasoHeader}>
                                            <CreditCard size={20} />
                                            <h4>Monto a Financiar</h4>
                                        </div>
                                        <div className={estilos.pasoValor}>
                                            {formatearMoneda(ejemploCuota.montoFinanciado)}
                                        </div>
                                        <p className={estilos.pasoDescripcion}>
                                            Diferencia después del pago inicial
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaSeparador} />

                                {/* Paso 4: Cuota Mensual */}
                                <div className={`${estilos.paso} ${estilos.pasoDestacado}`}>
                                    <div className={estilos.pasoNumero}>
                                        <span>4</span>
                                    </div>
                                    <div className={estilos.pasoContenido}>
                                        <div className={estilos.pasoHeader}>
                                            <Calendar size={20} />
                                            <h4>Cuota Mensual</h4>
                                        </div>
                                        <div className={estilos.pasoValor}>
                                            {formatearMoneda(ejemploCuota.cuotaMensual)}
                                        </div>
                                        <p className={estilos.pasoDescripcion}>
                                            Durante {formData.plazo_meses} meses
                                        </p>
                                        <div className={estilos.pasoDetalle}>
                                            <TrendingUp size={14} />
                                            <span>Tasa: {formData.tasa_interes_anual}% anual</span>
                                        </div>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaSeparador} />

                                {/* Paso 5: Total a Pagar */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>
                                        <span>5</span>
                                    </div>
                                    <div className={estilos.pasoContenido}>
                                        <div className={estilos.pasoHeader}>
                                            <Calculator size={20} />
                                            <h4>Total con Financiamiento</h4>
                                        </div>
                                        <div className={estilos.pasoValor}>
                                            {formatearMoneda(ejemploCuota.totalConInicial)}
                                        </div>
                                        <div className={estilos.resumenTotal}>
                                            <div className={estilos.resumenItem}>
                                                <span>Pago inicial:</span>
                                                <strong>{formatearMoneda(ejemploCuota.pagoInicial)}</strong>
                                            </div>
                                            <div className={estilos.resumenItem}>
                                                <span>{formData.plazo_meses} cuotas:</span>
                                                <strong>{formatearMoneda(ejemploCuota.totalPagar)}</strong>
                                            </div>
                                            <div className={estilos.resumenSeparador}></div>
                                            <div className={estilos.resumenItem}>
                                                <span>Intereses:</span>
                                                <strong className={estilos.textoInteres}>
                                                    {formatearMoneda(ejemploCuota.totalIntereses)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información Adicional */}
                                <div className={estilos.infoAdicional}>
                                    <div className={estilos.infoItem}>
                                        <Clock size={16} />
                                        <span>{formData.dias_gracia} días de gracia</span>
                                    </div>
                                    <div className={estilos.infoItem}>
                                        <AlertCircle size={16} />
                                        <span>{formData.penalidad_mora_pct}% penalidad por mora</span>
                                    </div>
                                    {formData.permite_pago_anticipado && (
                                        <div className={estilos.infoItem}>
                                            <Sparkles size={16} />
                                            <span>Permite pago anticipado</span>
                                        </div>
                                    )}
                                    {formData.requiere_fiador && (
                                        <div className={estilos.infoItem}>
                                            <User size={16} />
                                            <span>Requiere fiador</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
