"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerBitacorasPorObra } from './servidor'
import { obtenerObras } from '../obras/servidor'
import estilos from './bitacora.module.css'

export default function BitacoraAdmin() {
    const router = useRouter()
    const [obras, setObras] = useState([])
    const [obraSeleccionada, setObraSeleccionada] = useState('')
    const [bitacoras, setBitacoras] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarObras()
    }, [])

    useEffect(() => {
        if (obraSeleccionada) {
            cargarBitacoras()
        } else {
            setBitacoras([])
        }
    }, [obraSeleccionada])

    async function cargarObras() {
        setCargando(true)
        const res = await obtenerObras({ estado: 'activa' })
        if (res.success) {
            setObras(res.obras)
        }
        setCargando(false)
    }

    async function cargarBitacoras() {
        setCargando(true)
        const res = await obtenerBitacorasPorObra(obraSeleccionada)
        if (res.success) {
            setBitacoras(res.bitacoras)
        }
        setCargando(false)
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Bitácoras Diarias</h1>
                    <p className={estilos.subtitulo}>Registro de actividades y personal en campo</p>
                </div>
                <button 
                    className={estilos.btnNuevo} 
                    onClick={() => router.push('/admin/bitacora/nuevo')}
                >
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Nueva Bitácora</span>
                </button>
            </div>

            <div className={estilos.filtros}>
                <div className={estilos.grupo}>
                    <label>Seleccionar Obra</label>
                    <select 
                        value={obraSeleccionada} 
                        onChange={(e) => setObraSeleccionada(e.target.value)}
                    >
                        <option value="">Todas las obras</option>
                        {obras.map(obra => (
                            <option key={obra.id} value={obra.id}>
                                {obra.codigo_obra} - {obra.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {cargando ? (
                <div className={estilos.cargando}>Cargando bitácoras...</div>
            ) : bitacoras.length === 0 ? (
                <div className={estilos.vacio}>
                    {obraSeleccionada 
                        ? 'No hay bitácoras registradas para esta obra'
                        : 'Seleccione una obra para ver sus bitácoras'}
                </div>
            ) : (
                <div className={estilos.lista}>
                    {bitacoras.map(bitacora => (
                        <div key={bitacora.id} className={estilos.tarjeta}>
                            <div className={estilos.tarjetaHeader}>
                                <div>
                                    <h3>{new Date(bitacora.fecha_bitacora).toLocaleDateString()}</h3>
                                    {bitacora.obra_nombre && (
                                        <p className={estilos.obraNombre}>{bitacora.obra_nombre}</p>
                                    )}
                                </div>
                                <button 
                                    className={estilos.btnVer}
                                    onClick={() => router.push(`/admin/bitacora/ver/${bitacora.id}`)}
                                >
                                    Ver Detalle
                                </button>
                            </div>
                            <div className={estilos.tarjetaBody}>
                                {bitacora.zona && (
                                    <div className={estilos.itemInfo}>
                                        <ion-icon name="location-outline"></ion-icon>
                                        <span>{bitacora.zona}</span>
                                    </div>
                                )}
                                {bitacora.trabajadores_presentes > 0 && (
                                    <div className={estilos.itemInfo}>
                                        <ion-icon name="people-outline"></ion-icon>
                                        <span>{bitacora.trabajadores_presentes} trabajadores</span>
                                    </div>
                                )}
                                {bitacora.trabajo_realizado && (
                                    <div className={estilos.resumen}>
                                        <p>{bitacora.trabajo_realizado.substring(0, 150)}...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

