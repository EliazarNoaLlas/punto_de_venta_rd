"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { obtenerContratoPorId, actualizarContratoFinanciamiento } from './servidor'
import { ESTADOS_CONTRATO } from '../../core/finance/estados'
import estilos from './editar.module.css'

export default function EditarContrato() {
    const router = useRouter()
    const params = useParams()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [contrato, setContrato] = useState(null)
    const [formData, setFormData] = useState({
        notas: '',
        notas_internas: '',
        estado: '',
        razon_estado: ''
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
        if (params.id) {
            cargarContrato()
        }
    }, [params.id])

    const cargarContrato = async () => {
        setCargando(true)
        try {
            const resultado = await obtenerContratoPorId(params.id)
            if (resultado.success) {
                setContrato(resultado.contrato)
                setFormData({
                    notas: resultado.contrato.notas || '',
                    notas_internas: resultado.contrato.notas_internas || '',
                    estado: resultado.contrato.estado || '',
                    razon_estado: resultado.contrato.razon_estado || ''
                })
            } else {
                alert(resultado.mensaje || 'No se pudo cargar el contrato')
                router.push('/admin/contratos')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al cargar contrato')
            router.push('/admin/contratos')
        } finally {
            setCargando(false)
        }
    }

    const manejarCambio = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const guardarCambios = async () => {
        if (!contrato) return

        // Validar que no se esté editando un contrato pagado o cancelado
        if (contrato.estado === ESTADOS_CONTRATO.PAGADO || contrato.estado === ESTADOS_CONTRATO.CANCELADO) {
            alert('No se puede editar un contrato pagado o cancelado')
            return
        }

        setProcesando(true)
        try {
            const datosActualizacion = {}
            
            if (formData.notas !== contrato.notas) {
                datosActualizacion.notas = formData.notas
            }
            if (formData.notas_internas !== (contrato.notas_internas || '')) {
                datosActualizacion.notas_internas = formData.notas_internas
            }
            if (formData.estado && formData.estado !== contrato.estado) {
                datosActualizacion.estado = formData.estado
                if (formData.razon_estado) {
                    datosActualizacion.razon_estado = formData.razon_estado
                }
            }

            if (Object.keys(datosActualizacion).length === 0) {
                alert('No hay cambios para guardar')
                setProcesando(false)
                return
            }

            const resultado = await actualizarContratoFinanciamiento(params.id, datosActualizacion)

            if (resultado.success) {
                alert(resultado.mensaje || 'Contrato actualizado exitosamente')
                router.push(`/admin/contratos/ver/${params.id}`)
            } else {
                alert(resultado.mensaje || 'Error al actualizar contrato')
            }
        } catch (error) {
            console.error('Error al actualizar contrato:', error)
            alert('Error al actualizar contrato')
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
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando contrato...</span>
                </div>
            </div>
        )
    }

    if (!contrato) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.error}>
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    <span>Contrato no encontrado</span>
                </div>
            </div>
        )
    }

    const puedeEditar = contrato.estado !== ESTADOS_CONTRATO.PAGADO && contrato.estado !== ESTADOS_CONTRATO.CANCELADO

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Editar Contrato: {contrato.numero_contrato}</h1>
                    <p className={estilos.subtitulo}>
                        Cliente: {contrato.cliente_nombre} {contrato.cliente_apellidos || ''}
                    </p>
                </div>
                <Link href={`/admin/contratos/ver/${params.id}`} className={estilos.btnVolver}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    Volver
                </Link>
            </div>

            {!puedeEditar && (
                <div className={estilos.alerta}>
                    <ion-icon name="warning-outline"></ion-icon>
                    <span>Este contrato está {contrato.estado} y no puede ser editado</span>
                </div>
            )}

            <div className={estilos.infoContrato}>
                <div className={estilos.infoItem}>
                    <span>Monto Financiado:</span>
                    <strong>{formatearMoneda(contrato.monto_financiado)}</strong>
                </div>
                <div className={estilos.infoItem}>
                    <span>Saldo Pendiente:</span>
                    <strong>{formatearMoneda(contrato.saldo_pendiente)}</strong>
                </div>
                <div className={estilos.infoItem}>
                    <span>Estado Actual:</span>
                    <strong>{contrato.estado}</strong>
                </div>
                <div className={estilos.infoItem}>
                    <span>Fecha Contrato:</span>
                    <strong>{formatearFecha(contrato.fecha_contrato)}</strong>
                </div>
            </div>

            <div className={estilos.formulario}>
                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Notas Públicas</h2>
                    <div className={estilos.formGroup}>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={manejarCambio}
                            rows="4"
                            placeholder="Notas visibles para el cliente..."
                            disabled={!puedeEditar}
                        />
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Notas Internas</h2>
                    <div className={estilos.formGroup}>
                        <textarea
                            name="notas_internas"
                            value={formData.notas_internas}
                            onChange={manejarCambio}
                            rows="4"
                            placeholder="Notas internas solo para administradores..."
                            disabled={!puedeEditar}
                        />
                    </div>
                </div>

                <div className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Cambiar Estado</h2>
                    <div className={estilos.formGrid}>
                        <div className={estilos.formGroup}>
                            <label>Nuevo Estado</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={manejarCambio}
                                disabled={!puedeEditar}
                            >
                                <option value="">Mantener estado actual</option>
                                <option value="activo">Activo</option>
                                <option value="incumplido">Incumplido</option>
                                <option value="reestructurado">Reestructurado</option>
                                <option value="pagado">Pagado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                        {formData.estado && formData.estado !== contrato.estado && (
                            <div className={estilos.formGroup}>
                                <label>Razón del Cambio</label>
                                <input
                                    type="text"
                                    name="razon_estado"
                                    value={formData.razon_estado}
                                    onChange={manejarCambio}
                                    placeholder="Explique el motivo del cambio..."
                                    disabled={!puedeEditar}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={estilos.acciones}>
                    <Link href={`/admin/contratos/ver/${params.id}`} className={estilos.btnCancelar}>
                        Cancelar
                    </Link>
                    <button
                        className={estilos.btnGuardar}
                        onClick={guardarCambios}
                        disabled={procesando || !puedeEditar}
                    >
                        {procesando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    )
}

