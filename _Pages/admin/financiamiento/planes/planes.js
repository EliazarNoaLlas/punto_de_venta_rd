"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    obtenerPlanesFinanciamiento,
    crearPlanFinanciamiento,
    actualizarPlanFinanciamiento
} from './servidor'
import { tasaAnualAMensual } from '@/Pages/admin/core/finance/calculos'
import estilos from './planes.module.css'

export default function PlanesFinanciamiento() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [planes, setPlanes] = useState([])
    const [mostrarModal, setMostrarModal] = useState(false)
    const [planEditando, setPlanEditando] = useState(null)
    const [filtroActivo, setFiltroActivo] = useState('')
    const [buscar, setBuscar] = useState('')

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
        cargarPlanes()
    }, [filtroActivo, buscar])

    const cargarPlanes = async () => {
        setCargando(true)
        try {
            const resultado = await obtenerPlanesFinanciamiento({
                activo: filtroActivo === 'activo' ? true : filtroActivo === 'inactivo' ? false : undefined,
                buscar: buscar || undefined
            })

            if (resultado.success) {
                setPlanes(resultado.planes)
            } else {
                alert(resultado.mensaje || 'Error al cargar planes')
            }
        } catch (error) {
            console.error('Error al cargar planes:', error)
            alert('Error al cargar planes')
        } finally {
            setCargando(false)
        }
    }

    const abrirModalCrear = () => {
        setPlanEditando(null)
        setFormData({
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
        setMostrarModal(true)
    }

    const abrirModalEditar = (plan) => {
        setPlanEditando(plan)
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
        setMostrarModal(true)
    }

    const cerrarModal = () => {
        setMostrarModal(false)
        setPlanEditando(null)
    }

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
        try {
            let resultado

            if (planEditando) {
                resultado = await actualizarPlanFinanciamiento(planEditando.id, formData)
            } else {
                resultado = await crearPlanFinanciamiento(formData)
            }

            if (resultado.success) {
                alert(resultado.mensaje || 'Plan guardado exitosamente')
                cerrarModal()
                cargarPlanes()
            } else {
                alert(resultado.mensaje || 'Error al guardar plan')
            }
        } catch (error) {
            console.error('Error al guardar plan:', error)
            alert('Error al guardar plan')
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
    const planesFiltrados = planes.filter(plan => {
        if (filtroActivo === 'activo' && plan.activo !== 1) return false
        if (filtroActivo === 'inactivo' && plan.activo !== 0) return false
        if (buscar && !plan.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
            !plan.codigo.toLowerCase().includes(buscar.toLowerCase())) return false
        return true
    })

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando planes...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <h1 className={estilos.titulo}>
                        <ion-icon name="card-outline"></ion-icon>
                        Planes de Financiamiento
                    </h1>
                    <p className={estilos.subtitulo}>Gestiona los planes disponibles para financiamiento</p>
                </div>
                <button className={estilos.btnPrimario} onClick={abrirModalCrear}>
                    <ion-icon name="add-outline"></ion-icon>
                    Nuevo Plan
                </button>
            </div>

            {/* Filtros */}
            <div className={estilos.filtros}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    className={estilos.inputBuscar}
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                />
                <select
                    className={estilos.selectFiltro}
                    value={filtroActivo}
                    onChange={(e) => setFiltroActivo(e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>
            </div>

            {/* Lista de planes */}
            <div className={estilos.listaPlanes}>
                {planesFiltrados.length === 0 ? (
                    <div className={estilos.sinDatos}>
                        <ion-icon name="document-outline"></ion-icon>
                        <p>No hay planes para mostrar</p>
                    </div>
                ) : (
                    planesFiltrados.map(plan => (
                        <div key={plan.id} className={`${estilos.planCard} ${plan.activo === 0 ? estilos.inactivo : ''}`}>
                            <div className={estilos.planHeader}>
                                <div>
                                    <h3 className={estilos.planNombre}>{plan.nombre}</h3>
                                    <span className={estilos.planCodigo}>{plan.codigo}</span>
                                </div>
                                <div className={estilos.planBadges}>
                                    {plan.activo === 1 ? (
                                        <span className={`${estilos.badge} ${estilos.success}`}>Activo</span>
                                    ) : (
                                        <span className={`${estilos.badge} ${estilos.secondary}`}>Inactivo</span>
                                    )}
                                </div>
                            </div>

                            {plan.descripcion && (
                                <p className={estilos.planDescripcion}>{plan.descripcion}</p>
                            )}

                            <div className={estilos.planDetalles}>
                                <div className={estilos.detalleItem}>
                                    <span className={estilos.detalleLabel}>
                                        <ion-icon name="calendar-outline"></ion-icon>
                                        Plazo
                                    </span>
                                    <span className={estilos.detalleValor}>{plan.plazo_meses} meses</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <span className={estilos.detalleLabel}>
                                        <ion-icon name="trending-up-outline"></ion-icon>
                                        Tasa Anual
                                    </span>
                                    <span className={estilos.detalleValor}>{plan.tasa_interes_anual}%</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <span className={estilos.detalleLabel}>
                                        <ion-icon name="cash-outline"></ion-icon>
                                        Inicial Mínimo
                                    </span>
                                    <span className={estilos.detalleValor}>{plan.pago_inicial_minimo_pct}%</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <span className={estilos.detalleLabel}>
                                        <ion-icon name="alert-circle-outline"></ion-icon>
                                        Mora
                                    </span>
                                    <span className={estilos.detalleValor}>{plan.penalidad_mora_pct}%</span>
                                </div>
                                <div className={estilos.detalleItem}>
                                    <span className={estilos.detalleLabel}>
                                        <ion-icon name="time-outline"></ion-icon>
                                        Días Gracia
                                    </span>
                                    <span className={estilos.detalleValor}>{plan.dias_gracia}</span>
                                </div>
                            </div>

                            <div className={estilos.planAcciones}>
                                <button
                                    className={estilos.btnEditar}
                                    onClick={() => abrirModalEditar(plan)}
                                >
                                    <ion-icon name="create-outline"></ion-icon>
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal crear/editar */}
            {mostrarModal && (
                <div className={estilos.modalOverlay} onClick={cerrarModal}>
                    <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={estilos.modalHeader}>
                            <h2>{planEditando ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                            <button className={estilos.btnCerrar} onClick={cerrarModal}>
                                <ion-icon name="close-outline"></ion-icon>
                            </button>
                        </div>

                        <div className={estilos.modalBody}>
                            <div className={estilos.formGrid}>
                                <div className={estilos.formGroup}>
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={manejarCambio}
                                        required
                                        disabled={!!planEditando}
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
                        </div>

                        <div className={estilos.modalFooter}>
                            <button className={estilos.btnCancelar} onClick={cerrarModal}>
                                Cancelar
                            </button>
                            <button className={estilos.btnGuardar} onClick={guardarPlan}>
                                {planEditando ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}




