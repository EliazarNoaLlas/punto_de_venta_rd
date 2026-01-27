"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
        const tasaMensual = tasaAnualAMensual(plan.tasa_interes_anual)
        const factor = Math.pow(1 + tasaMensual, plan.plazo_meses)
        const cuota = montoEjemplo * (tasaMensual * factor) / (factor - 1)
        const totalIntereses = (cuota * plan.plazo_meses) - montoEjemplo

        return {
            monto: montoEjemplo,
            cuota: Math.round(cuota * 100) / 100,
            totalIntereses: Math.round(totalIntereses * 100) / 100,
            totalPagar: Math.round((cuota * plan.plazo_meses) * 100) / 100
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
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando plan...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.error}>
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    <p>{error}</p>
                    <button className={estilos.btnVolver} onClick={() => router.push('/admin/planes')}>
                        Volver a Planes
                    </button>
                </div>
            </div>
        )
    }

    if (!plan) return null

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>{plan.nombre}</h1>
                    <p className={estilos.subtitulo}>Detalles del plan de financiamiento</p>
                </div>
                <div className={estilos.badges}>
                    {plan.activo === 1 ? (
                        <span className={`${estilos.badge} ${estilos.success}`}>Activo</span>
                    ) : (
                        <span className={`${estilos.badge} ${estilos.secondary}`}>Inactivo</span>
                    )}
                </div>
            </div>

            <div className={estilos.detallesContainer}>
                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Información General</h2>
                    <div className={estilos.detallesGrid}>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Código:</span>
                            <span className={estilos.detalleValor}>{plan.codigo}</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Nombre:</span>
                            <span className={estilos.detalleValor}>{plan.nombre}</span>
                        </div>
                        {plan.descripcion && (
                            <div className={`${estilos.detalleItem} ${estilos.fullWidth}`}>
                                <span className={estilos.detalleLabel}>Descripción:</span>
                                <span className={estilos.detalleValor}>{plan.descripcion}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Términos Financieros</h2>
                    <div className={estilos.detallesGrid}>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Plazo:</span>
                            <span className={estilos.detalleValor}>{plan.plazo_meses} meses</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Tasa Interés Anual:</span>
                            <span className={estilos.detalleValor}>{plan.tasa_interes_anual}%</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Tasa Interés Mensual:</span>
                            <span className={estilos.detalleValor}>{plan.tasa_interes_mensual?.toFixed(4)}%</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Pago Inicial Mínimo:</span>
                            <span className={estilos.detalleValor}>{plan.pago_inicial_minimo_pct}%</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Monto Mínimo:</span>
                            <span className={estilos.detalleValor}>
                                {plan.monto_minimo ? formatearMoneda(plan.monto_minimo) : 'Sin límite'}
                            </span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Monto Máximo:</span>
                            <span className={estilos.detalleValor}>
                                {plan.monto_maximo ? formatearMoneda(plan.monto_maximo) : 'Sin límite'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Penalidades y Descuentos</h2>
                    <div className={estilos.detallesGrid}>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Penalidad Mora:</span>
                            <span className={estilos.detalleValor}>{plan.penalidad_mora_pct}%</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Días de Gracia:</span>
                            <span className={estilos.detalleValor}>{plan.dias_gracia} días</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Descuento Pago Anticipado:</span>
                            <span className={estilos.detalleValor}>{plan.descuento_pago_anticipado_pct || 0}%</span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Cuotas Mínimas Anticipadas:</span>
                            <span className={estilos.detalleValor}>{plan.cuotas_minimas_anticipadas || 3}</span>
                        </div>
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Configuración</h2>
                    <div className={estilos.detallesGrid}>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Estado:</span>
                            <span className={estilos.detalleValor}>
                                {plan.activo === 1 ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Permite Pago Anticipado:</span>
                            <span className={estilos.detalleValor}>
                                {plan.permite_pago_anticipado === 1 ? 'Sí' : 'No'}
                            </span>
                        </div>
                        <div className={estilos.detalleItem}>
                            <span className={estilos.detalleLabel}>Requiere Fiador:</span>
                            <span className={estilos.detalleValor}>
                                {plan.requiere_fiador === 1 ? 'Sí' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Vista previa de cálculo */}
                {ejemploCuota && (
                    <div className={estilos.seccion}>
                        <h2 className={estilos.seccionTitulo}>Ejemplo de Cálculo</h2>
                        <div className={estilos.vistaPrevia}>
                            <p className={estilos.ejemploTexto}>
                                Ejemplo con un monto financiado de {formatearMoneda(ejemploCuota.monto)}:
                            </p>
                            <div className={estilos.vistaPreviaDetalle}>
                                <div>
                                    <span>Cuota Mensual:</span>
                                    <strong>{formatearMoneda(ejemploCuota.cuota)}</strong>
                                </div>
                                <div>
                                    <span>Total Intereses:</span>
                                    <strong>{formatearMoneda(ejemploCuota.totalIntereses)}</strong>
                                </div>
                                <div>
                                    <span>Total a Pagar:</span>
                                    <strong>{formatearMoneda(ejemploCuota.totalPagar)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={estilos.footer}>
                    <button 
                        className={estilos.btnVolver} 
                        onClick={() => router.push('/admin/planes')}
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        Volver
                    </button>
                    <button 
                        className={estilos.btnEditar} 
                        onClick={() => router.push(`/admin/planes/editar/${id}`)}
                    >
                        <ion-icon name="create-outline"></ion-icon>
                        Editar
                    </button>
                </div>
            </div>
        </div>
    )
}

