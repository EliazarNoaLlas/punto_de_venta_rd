"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
    CreditCard,
    Calendar,
    TrendingUp,
    DollarSign,
    AlertCircle,
    Clock,
    Sparkles,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Edit,
    Wallet,
    User,
    Calculator,
    Percent,
    Shield,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { obtenerPlanPorId } from './servidor'
import { tasaAnualAMensual } from '../../core/finance/calculos'
import estilos from './ver.module.css'

export default function VerPlan({ planId }) {
    const router = useRouter()
    const params = useParams()
    const id = planId || params?.id
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [plan, setPlan] = useState(null)

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
                    setPlan(resultado.plan)
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

    const calcularEjemploCuota = () => {
        if (!plan || !plan.plazo_meses || !plan.tasa_interes_anual) return null

        const montoEjemplo = 100000
        const pagoInicial = montoEjemplo * (plan.pago_inicial_minimo_pct / 100)
        const montoFinanciado = montoEjemplo - pagoInicial
        const tasaMensual = tasaAnualAMensual(plan.tasa_interes_anual)
        const factor = Math.pow(1 + tasaMensual, plan.plazo_meses)
        const cuota = montoFinanciado * (tasaMensual * factor) / (factor - 1)
        const totalIntereses = (cuota * plan.plazo_meses) - montoFinanciado
        const totalPagar = cuota * plan.plazo_meses

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
                    <span>Cargando plan de financiamiento...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.error}>
                    <div className={estilos.errorIcono}>
                        <AlertCircle size={64} />
                    </div>
                    <h2>Error al cargar el plan</h2>
                    <p>{error}</p>
                    <button className={estilos.btnVolver} onClick={() => router.push('/admin/planes')}>
                        <ArrowLeft size={20} />
                        Volver a Planes
                    </button>
                </div>
            </div>
        )
    }

    if (!plan) return null

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Hero Section */}
            <div className={estilos.hero}>
                <div className={estilos.heroContent}>
                    <div className={estilos.heroIcono}>
                        <Image 
                            src="/financias/credit-card.svg" 
                            alt="Plan de Financiamiento"
                            width={80}
                            height={80}
                        />
                    </div>
                    <div className={estilos.heroInfo}>
                        <div className={estilos.heroCodigoWrapper}>
                            <span className={estilos.heroCodigo}>{plan.codigo}</span>
                            {plan.activo === 1 ? (
                                <span className={`${estilos.badge} ${estilos.success}`}>
                                    <CheckCircle2 size={16} />
                                    Activo
                                </span>
                            ) : (
                                <span className={`${estilos.badge} ${estilos.inactive}`}>
                                    <XCircle size={16} />
                                    Inactivo
                                </span>
                            )}
                        </div>
                        <h1 className={estilos.heroTitulo}>{plan.nombre}</h1>
                        {plan.descripcion && (
                            <p className={estilos.heroDescripcion}>{plan.descripcion}</p>
                        )}
                    </div>
                </div>
                
                <div className={estilos.heroAcciones}>
                    <button 
                        className={estilos.btnSecundario} 
                        onClick={() => router.push('/admin/planes')}
                    >
                        <ArrowLeft size={20} />
                        Volver
                    </button>
                    <button 
                        className={estilos.btnPrimario} 
                        onClick={() => router.push(`/admin/planes/editar/${id}`)}
                    >
                        <Edit size={20} />
                        Editar Plan
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={estilos.statsGrid}>
                <div className={`${estilos.statCard} ${estilos.purple}`}>
                    <div className={estilos.statIcono}>
                        <Calendar size={28} />
                    </div>
                    <div className={estilos.statInfo}>
                        <span className={estilos.statLabel}>Plazo</span>
                        <span className={estilos.statValor}>{plan.plazo_meses}</span>
                        <span className={estilos.statUnidad}>meses</span>
                    </div>
                    <div className={estilos.statIlustracion}>
                        <Image 
                            src="/financias/bill-receipt.svg" 
                            alt="Plazo"
                            width={60}
                            height={60}
                        />
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.blue}`}>
                    <div className={estilos.statIcono}>
                        <TrendingUp size={28} />
                    </div>
                    <div className={estilos.statInfo}>
                        <span className={estilos.statLabel}>Tasa Anual</span>
                        <span className={estilos.statValor}>{plan.tasa_interes_anual}%</span>
                        <span className={estilos.statUnidad}>interés</span>
                    </div>
                    <div className={estilos.statIlustracion}>
                        <Image 
                            src="/financias/transaction 1.svg" 
                            alt="Tasa"
                            width={60}
                            height={60}
                        />
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.green}`}>
                    <div className={estilos.statIcono}>
                        <Wallet size={28} />
                    </div>
                    <div className={estilos.statInfo}>
                        <span className={estilos.statLabel}>Pago Inicial</span>
                        <span className={estilos.statValor}>{plan.pago_inicial_minimo_pct}%</span>
                        <span className={estilos.statUnidad}>mínimo</span>
                    </div>
                    <div className={estilos.statIlustracion}>
                        <Image 
                            src="/financias/wallet 2.svg" 
                            alt="Pago Inicial"
                            width={60}
                            height={60}
                        />
                    </div>
                </div>

                <div className={`${estilos.statCard} ${estilos.orange}`}>
                    <div className={estilos.statIcono}>
                        <AlertCircle size={28} />
                    </div>
                    <div className={estilos.statInfo}>
                        <span className={estilos.statLabel}>Penalidad Mora</span>
                        <span className={estilos.statValor}>{plan.penalidad_mora_pct}%</span>
                        <span className={estilos.statUnidad}>por atraso</span>
                    </div>
                    <div className={estilos.statIlustracion}>
                        <Image 
                            src="/financias/atm.svg" 
                            alt="Mora"
                            width={60}
                            height={60}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={estilos.contentGrid}>
                {/* Columna Izquierda - Detalles */}
                <div className={estilos.detallesColumna}>
                    {/* Términos Financieros */}
                    <div className={estilos.card}>
                        <div className={estilos.cardHeader}>
                            <div className={estilos.cardHeaderIcono}>
                                <DollarSign size={24} />
                            </div>
                            <h2 className={estilos.cardTitulo}>Términos Financieros</h2>
                        </div>
                        <div className={estilos.cardBody}>
                            <div className={estilos.detalleRow}>
                                <div className={estilos.detalleIcono}>
                                    <Percent size={20} />
                                </div>
                                <div className={estilos.detalleInfo}>
                                    <span className={estilos.detalleLabel}>Tasa Mensual</span>
                                    <span className={estilos.detalleValor}>
                                        {plan.tasa_interes_anual 
                                            ? tasaAnualAMensual(plan.tasa_interes_anual).toFixed(4)
                                            : '0.0000'
                                        }%
                                    </span>
                                </div>
                            </div>

                            <div className={estilos.detalleRow}>
                                <div className={estilos.detalleIcono}>
                                    <DollarSign size={20} />
                                </div>
                                <div className={estilos.detalleInfo}>
                                    <span className={estilos.detalleLabel}>Monto Mínimo</span>
                                    <span className={estilos.detalleValor}>
                                        {plan.monto_minimo ? formatearMoneda(plan.monto_minimo) : 'Sin límite'}
                                    </span>
                                </div>
                            </div>

                            <div className={estilos.detalleRow}>
                                <div className={estilos.detalleIcono}>
                                    <DollarSign size={20} />
                                </div>
                                <div className={estilos.detalleInfo}>
                                    <span className={estilos.detalleLabel}>Monto Máximo</span>
                                    <span className={estilos.detalleValor}>
                                        {plan.monto_maximo ? formatearMoneda(plan.monto_maximo) : 'Sin límite'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Penalidades y Beneficios */}
                    <div className={estilos.card}>
                        <div className={estilos.cardHeader}>
                            <div className={estilos.cardHeaderIcono}>
                                <Shield size={24} />
                            </div>
                            <h2 className={estilos.cardTitulo}>Penalidades y Beneficios</h2>
                        </div>
                        <div className={estilos.cardBody}>
                            <div className={estilos.detalleRow}>
                                <div className={estilos.detalleIcono}>
                                    <Clock size={20} />
                                </div>
                                <div className={estilos.detalleInfo}>
                                    <span className={estilos.detalleLabel}>Días de Gracia</span>
                                    <span className={estilos.detalleValor}>{plan.dias_gracia} días</span>
                                </div>
                            </div>

                            <div className={estilos.detalleRow}>
                                <div className={estilos.detalleIcono}>
                                    <Sparkles size={20} />
                                </div>
                                <div className={estilos.detalleInfo}>
                                    <span className={estilos.detalleLabel}>Descuento Pago Anticipado</span>
                                    <span className={estilos.detalleValor}>{plan.descuento_pago_anticipado_pct || 0}%</span>
                                </div>
                            </div>

                            <div className={estilos.detalleRow}>
                                <div className={estilos.detalleIcono}>
                                    <Calendar size={20} />
                                </div>
                                <div className={estilos.detalleInfo}>
                                    <span className={estilos.detalleLabel}>Cuotas Mínimas Anticipadas</span>
                                    <span className={estilos.detalleValor}>{plan.cuotas_minimas_anticipadas || 3}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuración */}
                    <div className={estilos.card}>
                        <div className={estilos.cardHeader}>
                            <div className={estilos.cardHeaderIcono}>
                                <Shield size={24} />
                            </div>
                            <h2 className={estilos.cardTitulo}>Configuración</h2>
                        </div>
                        <div className={estilos.cardBody}>
                            <div className={estilos.configGrid}>
                                <div className={estilos.configItem}>
                                    <div className={estilos.configIcono}>
                                        {plan.permite_pago_anticipado === 1 ? (
                                            <CheckCircle2 size={20} className={estilos.iconoSuccess} />
                                        ) : (
                                            <XCircle size={20} className={estilos.iconoError} />
                                        )}
                                    </div>
                                    <div className={estilos.configInfo}>
                                        <strong>Pago Anticipado</strong>
                                        <span>{plan.permite_pago_anticipado === 1 ? 'Permitido' : 'No permitido'}</span>
                                    </div>
                                </div>

                                <div className={estilos.configItem}>
                                    <div className={estilos.configIcono}>
                                        {plan.requiere_fiador === 1 ? (
                                            <CheckCircle2 size={20} className={estilos.iconoWarning} />
                                        ) : (
                                            <XCircle size={20} className={estilos.iconoSuccess} />
                                        )}
                                    </div>
                                    <div className={estilos.configInfo}>
                                        <strong>Fiador</strong>
                                        <span>{plan.requiere_fiador === 1 ? 'Requerido' : 'No requerido'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Ejemplo de Cálculo */}
                <div className={estilos.ejemploColumna}>
                    <div className={estilos.ejemploCard}>
                        <div className={estilos.ejemploHeader}>
                            <div className={estilos.ejemploIlustracion}>
                                <Image 
                                    src="/financias/pos-machine.svg" 
                                    alt="Calculadora"
                                    width={100}
                                    height={100}
                                />
                            </div>
                            <h3>Simulador de Financiamiento</h3>
                            <p>Ejemplo con producto de {formatearMoneda(100000)}</p>
                        </div>

                        {ejemploCuota && (
                            <div className={estilos.ejemploPasos}>
                                {/* Paso 1 */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>1</div>
                                    <div className={estilos.pasoInfo}>
                                        <div className={estilos.pasoHeader}>
                                            <DollarSign size={18} />
                                            <h4>Precio del Producto</h4>
                                        </div>
                                        <p className={estilos.pasoValor}>{formatearMoneda(ejemploCuota.precioProducto)}</p>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaPaso} />

                                {/* Paso 2 */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>2</div>
                                    <div className={estilos.pasoInfo}>
                                        <div className={estilos.pasoHeader}>
                                            <Wallet size={18} />
                                            <h4>Pago Inicial ({plan.pago_inicial_minimo_pct}%)</h4>
                                        </div>
                                        <p className={estilos.pasoValor}>{formatearMoneda(ejemploCuota.pagoInicial)}</p>
                                        <span className={estilos.pasoDescripcion}>Al momento de la compra</span>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaPaso} />

                                {/* Paso 3 */}
                                <div className={estilos.paso}>
                                    <div className={estilos.pasoNumero}>3</div>
                                    <div className={estilos.pasoInfo}>
                                        <div className={estilos.pasoHeader}>
                                            <CreditCard size={18} />
                                            <h4>Monto a Financiar</h4>
                                        </div>
                                        <p className={estilos.pasoValor}>{formatearMoneda(ejemploCuota.montoFinanciado)}</p>
                                    </div>
                                </div>

                                <ArrowRight className={estilos.flechaPaso} />

                                {/* Paso 4 */}
                                <div className={`${estilos.paso} ${estilos.pasoDestacado}`}>
                                    <div className={estilos.pasoNumero}>4</div>
                                    <div className={estilos.pasoInfo}>
                                        <div className={estilos.pasoHeader}>
                                            <Calendar size={18} />
                                            <h4>Cuota Mensual</h4>
                                        </div>
                                        <p className={estilos.pasoValor}>{formatearMoneda(ejemploCuota.cuotaMensual)}</p>
                                        <span className={estilos.pasoDescripcion}>Durante {plan.plazo_meses} meses</span>
                                    </div>
                                </div>

                                {/* Resumen Final */}
                                <div className={estilos.resumenFinal}>
                                    <div className={estilos.resumenHeader}>
                                        <Calculator size={24} />
                                        <h4>Resumen Total</h4>
                                    </div>
                                    <div className={estilos.resumenBody}>
                                        <div className={estilos.resumenItem}>
                                            <span>Pago inicial</span>
                                            <strong>{formatearMoneda(ejemploCuota.pagoInicial)}</strong>
                                        </div>
                                        <div className={estilos.resumenItem}>
                                            <span>{plan.plazo_meses} cuotas mensuales</span>
                                            <strong>{formatearMoneda(ejemploCuota.totalPagar)}</strong>
                                        </div>
                                        <div className={estilos.resumenSeparador}></div>
                                        <div className={estilos.resumenItem}>
                                            <span>Intereses totales</span>
                                            <strong className={estilos.intereses}>
                                                {formatearMoneda(ejemploCuota.totalIntereses)}
                                            </strong>
                                        </div>
                                        <div className={estilos.resumenSeparador}></div>
                                        <div className={estilos.resumenTotal}>
                                            <span>Total a pagar</span>
                                            <strong>{formatearMoneda(ejemploCuota.totalConInicial)}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Adicional */}
                                <div className={estilos.infoAdicional}>
                                    <div className={estilos.infoItem}>
                                        <Clock size={16} />
                                        <span>{plan.dias_gracia} días de gracia</span>
                                    </div>
                                    <div className={estilos.infoItem}>
                                        <AlertCircle size={16} />
                                        <span>{plan.penalidad_mora_pct}% penalidad por mora</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
