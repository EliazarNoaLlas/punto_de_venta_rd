"use client"
import {useEffect, useState} from 'react'
import Link from 'next/link'
import {obtenerCotizaciones} from '@/_Pages/admin/cotizaciones/servidor'
import {Plus, Search, Eye, Printer} from 'lucide-react'
import estilos from './cotizaciones.module.css'

export default function ListaCotizaciones() {
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [cotizaciones, setCotizaciones] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos')

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)
        cargarCotizaciones()
    }, [])

    const cargarCotizaciones = async () => {
        setCargando(true)
        try {
            const resultado = await obtenerCotizaciones({
                buscar: busqueda,
                estado: filtroEstado
            })
            if (resultado.success) {
                setCotizaciones(resultado.cotizaciones)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            cargarCotizaciones()
        }, 500)
        return () => clearTimeout(timer)
    }, [busqueda, filtroEstado])

    const getEstadoBadge = (estado) => {
        // Mapeo directo a las clases del módulo CSS
        const clases = {
            borrador: estilos.borrador,
            enviada: estilos.enviada,
            aprobada: estilos.aprobada,
            convertida: estilos.convertida,
            vencida: estilos.vencida,
            anulada: estilos.anulada
        }
        return clases[estado.toLowerCase()] || estilos.borrador
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            {/* Header */}
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Cotizaciones</h1>
                    <p className={estilos.subtitulo}>Gestiona tus presupuestos y cotizaciones</p>
                </div>
                <Link href="/admin/cotizaciones/crear" className={estilos.btnPrimario}>
                    <Plus className="w-5 h-5"/>
                    <span>Nueva Cotización</span>
                </Link>
            </div>

            {/* Filtros */}
            <div className={estilos.card}>
                <div className={estilos.filtrosGrid}>
                    <div className={estilos.inputGroup}>
                        <label className={estilos.label}>Buscar</label>
                        <div style={{position: 'relative'}}>
                            <Search className="w-5 h-5" style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }}/>
                            <input
                                type="text"
                                placeholder="Buscar por número o cliente..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className={estilos.input}
                                style={{paddingLeft: '2.5rem'}}
                            />
                        </div>
                    </div>

                    <div className={estilos.inputGroup}>
                        <label className={estilos.label}>Estado</label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className={estilos.select}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="borrador">Borrador</option>
                            <option value="enviada">Enviada</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="convertida">Convertida</option>
                            <option value="anulada">Anulada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {cargando ? (
                <div className={estilos.emptyState}>
                    <span>Cargando cotizaciones...</span>
                </div>
            ) : cotizaciones.length === 0 ? (
                <div className={estilos.emptyState}>
                    <span>No se encontraron cotizaciones</span>
                </div>
            ) : (
                <div className={estilos.tablaContenedor}>
                    <table className={estilos.tabla}>
                        <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Vencimiento</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th style={{textAlign: 'right'}}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cotizaciones.map((cot) => (
                            <tr key={cot.id}>
                                <td style={{fontWeight: 500}}>{cot.numero_cotizacion}</td>
                                <td>{cot.cliente_nombre || 'Consumidor Final'}</td>
                                <td>{new Date(cot.fecha_emision).toLocaleDateString()}</td>
                                <td>{new Date(cot.fecha_vencimiento).toLocaleDateString()}</td>
                                <td style={{fontWeight: 600}}>RD$ {parseFloat(cot.total).toLocaleString()}</td>
                                <td>
                                        <span className={`${estilos.badge} ${getEstadoBadge(cot.estado)}`}>
                                            {cot.estado.charAt(0).toUpperCase() + cot.estado.slice(1)}
                                        </span>
                                </td>
                                <td className={estilos.acciones}>
                                    <Link href={`/admin/cotizaciones/${cot.id}`} title="Ver Detalle"
                                          className={estilos.btnIcono}>
                                        <Eye className="w-5 h-5"/>
                                    </Link>
                                    <Link href={`/admin/cotizaciones/${cot.id}/imprimir`} title="Imprimir"
                                          className={estilos.btnIcono}>
                                        <Printer className="w-5 h-5"/>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
