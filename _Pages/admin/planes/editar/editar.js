"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
        const tasaMensual = tasaAnualAMensual(formData.tasa_interes_anual)
        const factor = Math.pow(1 + tasaMensual, formData.plazo_meses)
        const cuota = montoEjemplo * (tasaMensual * factor) / (factor - 1)
        const totalIntereses = (cuota * formData.plazo_meses) - montoEjemplo

        return {
            monto: montoEjemplo,
            cuota: Math.round(cuota * 100) / 100,
            totalIntereses: Math.round(totalIntereses * 100) / 100,
            totalPagar: Math.round((cuota * formData.plazo_meses) * 100) / 100
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

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Editar Plan de Financiamiento</h1>
                    <p className={estilos.subtitulo}>Modifica los datos del plan</p>
                </div>
            </div>

            <div className={estilos.formContainer}>
                <div className={estilos.formGrid}>
                    <div className={estilos.formGroup}>
                        <label>Código *</label>
                        <input
                            type="text"
                            name="codigo"
                            value={formData.codigo}
                            onChange={manejarCambio}
                            required
                            disabled
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Nombre *</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className={`${estilos.formGroup} ${estilos.fullWidth}`}>
                        <label>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={manejarCambio}
                            rows="3"
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Plazo (meses) *</label>
                        <input
                            type="number"
                            name="plazo_meses"
                            value={formData.plazo_meses}
                            onChange={manejarCambio}
                            min="1"
                            max="60"
                            required
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Tasa Interés Anual (%) *</label>
                        <input
                            type="number"
                            name="tasa_interes_anual"
                            value={formData.tasa_interes_anual}
                            onChange={manejarCambio}
                            min="0"
                            max="100"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Pago Inicial Mínimo (%) *</label>
                        <input
                            type="number"
                            name="pago_inicial_minimo_pct"
                            value={formData.pago_inicial_minimo_pct}
                            onChange={manejarCambio}
                            min="0"
                            max="100"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Monto Mínimo</label>
                        <input
                            type="number"
                            name="monto_minimo"
                            value={formData.monto_minimo}
                            onChange={manejarCambio}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Monto Máximo</label>
                        <input
                            type="number"
                            name="monto_maximo"
                            value={formData.monto_maximo || ''}
                            onChange={manejarCambio}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Penalidad Mora (%) *</label>
                        <input
                            type="number"
                            name="penalidad_mora_pct"
                            value={formData.penalidad_mora_pct}
                            onChange={manejarCambio}
                            min="0"
                            max="100"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Días de Gracia *</label>
                        <input
                            type="number"
                            name="dias_gracia"
                            value={formData.dias_gracia}
                            onChange={manejarCambio}
                            min="0"
                            required
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Descuento Pago Anticipado (%)</label>
                        <input
                            type="number"
                            name="descuento_pago_anticipado_pct"
                            value={formData.descuento_pago_anticipado_pct}
                            onChange={manejarCambio}
                            min="0"
                            max="100"
                            step="0.01"
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label>Cuotas Mínimas Anticipadas</label>
                        <input
                            type="number"
                            name="cuotas_minimas_anticipadas"
                            value={formData.cuotas_minimas_anticipadas}
                            onChange={manejarCambio}
                            min="1"
                        />
                    </div>

                    <div className={estilos.formGroup}>
                        <label className={estilos.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo}
                                onChange={manejarCambio}
                            />
                            Plan activo
                        </label>
                    </div>

                    <div className={estilos.formGroup}>
                        <label className={estilos.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="permite_pago_anticipado"
                                checked={formData.permite_pago_anticipado}
                                onChange={manejarCambio}
                            />
                            Permite pago anticipado
                        </label>
                    </div>

                    <div className={estilos.formGroup}>
                        <label className={estilos.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="requiere_fiador"
                                checked={formData.requiere_fiador}
                                onChange={manejarCambio}
                            />
                            Requiere fiador
                        </label>
                    </div>
                </div>

                {/* Vista previa de cálculo */}
                {ejemploCuota && (
                    <div className={estilos.vistaPrevia}>
                        <h3>Vista Previa (Ejemplo: {formatearMoneda(ejemploCuota.monto)})</h3>
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
                )}

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
                    </button>
                </div>
            </div>
        </div>
    )
}

