"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { obtenerClientePorId } from "./servidor"
import estilos from "./ver.module.css"

export default function VerClienteAdmin() {
    const router = useRouter()
    const params = useParams()
    const [tema, setTema] = useState("light")
    const [cargando, setCargando] = useState(true)
    const [cliente, setCliente] = useState(null)

    // Detectar tema
    useEffect(() => {
        const temaLocal = localStorage.getItem("tema") || "light"
        setTema(temaLocal)

        const manejarCambioTema = () => {
            setTema(localStorage.getItem("tema") || "light")
        }

        window.addEventListener("temaChange", manejarCambioTema)
        window.addEventListener("storage", manejarCambioTema)

        return () => {
            window.removeEventListener("temaChange", manejarCambioTema)
            window.removeEventListener("storage", manejarCambioTema)
        }
    }, [])

    // Cargar datos del cliente
    useEffect(() => {
        if (params.id) {
            cargarDatos()
        }
    }, [params.id])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const resultado = await obtenerClientePorId(params.id)
            if (resultado.success && resultado.cliente) {
                setCliente(resultado.cliente)
            } else {
                alert(resultado.mensaje || "No se pudo cargar el cliente")
                router.push("/admin/clientes")
            }
        } catch (error) {
            console.error("Error al cargar cliente:", error)
            alert("Error al cargar cliente")
            router.push("/admin/clientes")
        } finally {
            setCargando(false)
        }
    }

    const formatearMoneda = (valor) =>
        new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(valor || 0)

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="sync-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando perfil del cliente...</span>
                </div>
            </div>
        )
    }

    if (!cliente) return null

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* HEADER */}
            <div className={estilos.header}>
                <div className={estilos.tituloArea}>
                    <h1>Detalle del Cliente</h1>
                    <p className={estilos.subtitulo}>Información detallada y resumen financiero</p>
                </div>
                <div className={estilos.accionesHeader}>
                    <button
                        className={`${estilos.btnAccion} ${estilos.secundario}`}
                        onClick={() => router.push('/admin/clientes')}
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        <span>Volver</span>
                    </button>
                    <button
                        className={`${estilos.btnAccion} ${estilos.primario}`}
                        onClick={() => router.push(`/admin/clientes/editar/${cliente.id}`)}
                    >
                        <ion-icon name="create-outline"></ion-icon>
                        <span>Editar Perfil</span>
                    </button>
                </div>
            </div>

            {/* LAYOUT PRINCIPAL */}
            <div className={estilos.layoutDetalle}>

                {/* COLUMNA PERFIL */}
                <div className={estilos.columnaPerfil}>
                    <div className={estilos.cardPerfil}>
                        <div className={estilos.fotoContenedor}>
                            {cliente.fotoUrl ? (
                                <img src={cliente.fotoUrl} alt={cliente.nombreCompleto} />
                            ) : (
                                <ion-icon name="person-outline" className={estilos.iconoFoto}></ion-icon>
                            )}
                        </div>

                        <span
                            className={`${estilos.badgeEstado} ${cliente.clienteActivo ? estilos.activo : estilos.inactivo}`}>
                            {cliente.clienteActivo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                        </span>

                        <div className={estilos.infoPrincipal}>
                            <h2>{cliente.nombreCompleto}</h2>
                            <p>{cliente.tipoDocumentoNombre} ({cliente.tipoDocumentoCodigo}): {cliente.numeroDocumento}</p>
                        </div>

                        <div className={estilos.divisor}></div>

                        <div className={estilos.estadMini}>
                            <div className={estilos.datoMini}>
                                <span className={estilos.labelMini}>Compras Totales</span>
                                <span className={estilos.valorMini}>{formatearMoneda(cliente.totalCompras)}</span>
                            </div>
                            <div className={estilos.datoMini}>
                                <span className={estilos.labelMini}>Puntos</span>
                                <span className={estilos.valorMini}>{cliente.puntosFidelidad || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA INFO */}
                <div className={estilos.columnaInfo}>

                    {/* DATOS DE CONTACTO */}
                    <div className={estilos.seccionInfo}>
                        <h3 className={estilos.tituloSeccion}>
                            <ion-icon name="call-outline"></ion-icon>
                            <span>Información de Contacto</span>
                        </h3>
                        <div className={estilos.gridInfo}>
                            <div className={estilos.campo}>
                                <span className={estilos.labelCampo}>Teléfono</span>
                                <span className={estilos.valorCampo}>{cliente.telefono || 'No registrado'}</span>
                            </div>
                            <div className={estilos.campo}>
                                <span className={estilos.labelCampo}>Correo Electrónico</span>
                                <span className={estilos.valorCampo}>{cliente.email || 'No registrado'}</span>
                            </div>
                            <div className={estilos.campo}>
                                <span className={estilos.labelCampo}>Dirección</span>
                                <span
                                    className={estilos.valorCampo}>{cliente.direccion || 'Sin dirección registrada'}</span>
                            </div>
                        </div>
                    </div>

                    {/* PERFIL CREDITICIO */}
                    {cliente.credito?.tienePerfil ? (
                        <div className={`${estilos.seccionInfo} ${estilos.cardCredito}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="card-outline"></ion-icon>
                                <span>Perfil Crediticio Profesional</span>
                            </h3>

                            <div className={estilos.gridInfo}>
                                <div className={estilos.campo}>
                                    <span className={estilos.labelCampo}>Límite Autorizado</span>
                                    <span
                                        className={estilos.valorCampo}>{formatearMoneda(cliente.credito.limite)}</span>
                                </div>
                                <div className={estilos.campo}>
                                    <span className={estilos.labelCampo}>Saldo Utilizado</span>
                                    <span className={estilos.valorCampo}
                                        style={{ color: '#ef4444' }}>{formatearMoneda(cliente.credito.utilizado)}</span>
                                </div>
                                <div className={estilos.campo}>
                                    <span className={estilos.labelCampo}>Saldo Disponible</span>
                                    <span className={estilos.valorCampo}
                                        style={{ color: '#10b981' }}>{formatearMoneda(cliente.credito.disponible)}</span>
                                </div>
                                <div className={estilos.campo}>
                                    <span className={estilos.labelCampo}>Frecuencia de Pago</span>
                                    <span className={estilos.valorCampo}
                                        style={{ textTransform: 'capitalize' }}>{cliente.credito.frecuenciaPago || 'N/A'}</span>
                                </div>
                                <div className={estilos.campo}>
                                    <span className={estilos.labelCampo}>Días de Plazo</span>
                                    <span className={estilos.valorCampo}>{cliente.credito.diasPlazo || 0} días</span>
                                </div>
                                <div className={estilos.campo}>
                                    <span className={estilos.labelCampo}>Clasificación</span>
                                    <span
                                        className={estilos.valorCampo}>Nivel {cliente.credito.clasificacion || 'A'} (Score: {cliente.credito.score || 100})</span>
                                </div>
                            </div>

                            {/* ALERTA DE CRÉDITO */}
                            {cliente.credito.limite > 0 ? (
                                <div
                                    className={`${estilos.alertaCredito} ${cliente.credito.disponible > 0 ? estilos.disponible : estilos.agotado}`}>
                                    <ion-icon
                                        name={cliente.credito.disponible > 0 ? "checkmark-circle" : "alert-circle"}></ion-icon>
                                    <span>
                                        {cliente.credito.disponible > 0
                                            ? `El cliente dispone de ${formatearMoneda(cliente.credito.disponible)} para nuevas compras a crédito.`
                                            : 'El límite de crédito ha sido alcanzado. Se requiere un abono para nuevas ventas a crédito.'}
                                    </span>
                                </div>
                            ) : (
                                <p style={{ marginTop: '20px', color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>
                                    Este cliente no tiene una línea de crédito habilitada actualmente.
                                </p>
                            )}
                        </div>
                    ) : (
                        <p style={{ marginTop: '20px', color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>
                            Este cliente no tiene un perfil crediticio registrado.
                        </p>
                    )}

                </div>
            </div>
        </div>
    )

}
