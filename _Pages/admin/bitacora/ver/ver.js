"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerBitacoraPorId } from '../servidor'
import estilos from '../bitacora.module.css'

export default function VerBitacora({ id }) {
    const router = useRouter()
    const [bitacora, setBitacora] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarBitacora()
    }, [id])

    async function cargarBitacora() {
        setCargando(true)
        const res = await obtenerBitacoraPorId(id)
        if (res.success && res.bitacora) {
            setBitacora(res.bitacora)
        } else {
            alert(res.mensaje || 'Error al cargar la bitácora')
            router.push('/admin/bitacora')
        }
        setCargando(false)
    }

    if (cargando) {
        return (
            <div className={estilos.contenedor}>
                <div className={estilos.cargando}>Cargando bitácora...</div>
            </div>
        )
    }

    if (!bitacora) {
        return (
            <div className={estilos.contenedor}>
                <div className={estilos.cargando}>Bitácora no encontrada</div>
            </div>
        )
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Bitácora del Día</h1>
                    <p className={estilos.subtitulo}>
                        {bitacora.obra_nombre && (
                            <span>{bitacora.codigo_obra} - {bitacora.obra_nombre}</span>
                        )}
                        <span className={estilos.fecha}>
                            {new Date(bitacora.fecha_bitacora).toLocaleDateString()}
                        </span>
                    </p>
                </div>
                <button className={estilos.btnNuevo} onClick={() => router.back()}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    <span>Volver</span>
                </button>
            </div>

            <div className={estilos.detalleBitacora}>
                <section className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Información General</h2>
                    <div className={estilos.gridInfo}>
                        {bitacora.zona && (
                            <div className={estilos.itemInfo}>
                                <label>Zona / Sitio</label>
                                <p>{bitacora.zona}</p>
                            </div>
                        )}
                        {bitacora.condiciones_clima && (
                            <div className={estilos.itemInfo}>
                                <label>Condiciones Climáticas</label>
                                <p>{bitacora.condiciones_clima}</p>
                            </div>
                        )}
                        {bitacora.trabajadores && bitacora.trabajadores.length > 0 && (
                            <div className={estilos.itemInfo}>
                                <label>Trabajadores Presentes</label>
                                <p>{bitacora.trabajadores.length}</p>
                            </div>
                        )}
                    </div>
                </section>

                {bitacora.trabajadores && bitacora.trabajadores.length > 0 && (
                    <section className={estilos.seccion}>
                        <h2 className={estilos.seccionTitulo}>Personal Presente</h2>
                        <div className={estilos.listaTrabajadores}>
                            {bitacora.trabajadores.map(t => (
                                <div key={t.id} className={estilos.trabajadorRow}>
                                    <div className={estilos.trabajadorInfo}>
                                        <strong>{t.trabajador_nombre}</strong>
                                        <span>{t.trabajador_rol}</span>
                                    </div>
                                    {t.horas_trabajadas > 0 && (
                                        <div className={estilos.horas}>
                                            {t.horas_trabajadas} horas
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className={estilos.seccion}>
                    <h2 className={estilos.seccionTitulo}>Trabajo Realizado</h2>
                    <div className={estilos.trabajoRealizado}>
                        <p>{bitacora.trabajo_realizado}</p>
                    </div>
                </section>

                {bitacora.observaciones && (
                    <section className={estilos.seccion}>
                        <h2 className={estilos.seccionTitulo}>Observaciones</h2>
                        <div className={estilos.observaciones}>
                            <p>{bitacora.observaciones}</p>
                        </div>
                    </section>
                )}

                {bitacora.fotos_json && (
                    <section className={estilos.seccion}>
                        <h2 className={estilos.seccionTitulo}>Fotos</h2>
                        <div className={estilos.galeriaFotos}>
                            {JSON.parse(bitacora.fotos_json).map((foto, index) => (
                                <img key={index} src={foto} alt={`Foto ${index + 1}`} className={estilos.foto} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

