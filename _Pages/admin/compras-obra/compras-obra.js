"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { obtenerComprasObra, obtenerObrasParaCompra } from './servidor'
import estilos from './compras-obra.module.css'

export default function ComprasObraAdmin() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const obraIdParam = searchParams.get('obra')
    
    const [compras, setCompras] = useState([])
    const [obras, setObras] = useState([])
    const [filtros, setFiltros] = useState({
        obra_id: obraIdParam || '',
        estado: '',
        tipo_compra: ''
    })
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarObras()
    }, [])

    useEffect(() => {
        cargarCompras()
    }, [filtros])

    async function cargarObras() {
        const res = await obtenerObrasParaCompra()
        if (res.success) {
            setObras(res.obras)
        }
    }

    async function cargarCompras() {
        setCargando(true)
        const res = await obtenerComprasObra(filtros)
        if (res.success) {
            setCompras(res.compras)
        }
        setCargando(false)
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Compras de Obra</h1>
                    <p className={estilos.subtitulo}>Registro de compras de materiales para obras</p>
                </div>
                <button 
                    className={estilos.btnNuevo} 
                    onClick={() => router.push('/admin/compras-obra/nuevo')}
                >
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Nueva Compra</span>
                </button>
            </div>

            {/* Filtros */}
            <div className={estilos.filtros}>
                <select
                    value={filtros.obra_id}
                    onChange={(e) => setFiltros(prev => ({ ...prev, obra_id: e.target.value }))}
                >
                    <option value="">Todas las obras</option>
                    {obras.map(obra => (
                        <option key={obra.id} value={obra.id}>
                            {obra.codigo_obra} - {obra.nombre}
                        </option>
                    ))}
                </select>
                <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                >
                    <option value="">Todos los estados</option>
                    <option value="registrada">Registrada</option>
                    <option value="validada">Validada</option>
                    <option value="anulada">Anulada</option>
                </select>
                <select
                    value={filtros.tipo_compra}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tipo_compra: e.target.value }))}
                >
                    <option value="">Todos los tipos</option>
                    <option value="planificada">Planificada</option>
                    <option value="imprevista">Imprevista</option>
                </select>
            </div>

            {/* Lista */}
            {cargando ? (
                <div className={estilos.cargando}>Cargando compras...</div>
            ) : compras.length === 0 ? (
                <div className={estilos.vacio}>No se encontraron compras</div>
            ) : (
                <div className={estilos.lista}>
                    {compras.map(compra => (
                        <div key={compra.id} className={estilos.tarjeta}>
                            <div className={estilos.tarjetaHeader}>
                                <div>
                                    <h3>Factura #{compra.numero_factura}</h3>
                                    {compra.obra_nombre && (
                                        <p className={estilos.obraNombre}>
                                            {compra.codigo_obra} - {compra.obra_nombre}
                                        </p>
                                    )}
                                </div>
                                <span className={`${estilos.estado} ${estilos[compra.estado]}`}>
                                    {compra.estado}
                                </span>
                            </div>
                            <div className={estilos.tarjetaBody}>
                                <div className={estilos.info}>
                                    {compra.proveedor_nombre && (
                                        <div className={estilos.itemInfo}>
                                            <ion-icon name="storefront-outline"></ion-icon>
                                            <span>{compra.proveedor_nombre}</span>
                                        </div>
                                    )}
                                    <div className={estilos.itemInfo}>
                                        <ion-icon name="calendar-outline"></ion-icon>
                                        <span>{new Date(compra.fecha_compra).toLocaleDateString()}</span>
                                    </div>
                                    <div className={estilos.itemInfo}>
                                        <ion-icon name="cube-outline"></ion-icon>
                                        <span>{compra.cantidad_items || 0} items</span>
                                    </div>
                                    <div className={estilos.itemInfo}>
                                        <ion-icon name="cash-outline"></ion-icon>
                                        <span className={estilos.monto}>RD$ {parseFloat(compra.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={estilos.tarjetaFooter}>
                                <button 
                                    className={estilos.btnVer}
                                    onClick={() => router.push(`/admin/compras-obra/ver/${compra.id}`)}
                                >
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

