"use client"
import { useEffect, useState } from 'react'
import { obtenerCotizacionPorId } from '@/_Pages/admin/cotizaciones/servidor'
import estilos from './cotizaciones.module.css'

export default function ImprimirCotizacion({ id }) {
    const [cotizacion, setCotizacion] = useState(null)
    const [detalle, setDetalle] = useState([])

    useEffect(() => {
        const cargarData = async () => {
            const res = await obtenerCotizacionPorId(id)
            if (res.success) {
                setCotizacion(res.cotizacion)
                setDetalle(res.detalle)
                // Disparar impresión después de cargar datos
                setTimeout(() => {
                    window.print()
                }, 1000)
            }
        }
        cargarData()
    }, [id])

    if (!cotizacion) return <div>Cargando...</div>

    return (
        <div className={estilos.printContainer}>
            <div className={estilos.printHeader}>
                <h1>COTIZACIÓN</h1>
                <div className={estilos.printNumero}>No. {cotizacion.numero_cotizacion}</div>
            </div>

            <div className={estilos.printInfo}>
                <div className={estilos.printCol}>
                    <strong>CLIENTE:</strong>
                    <p>{cotizacion.cliente_nombre}</p>
                    <p>Doc: {cotizacion.cliente_documento || 'N/A'}</p>
                    <p>Tel: {cotizacion.cliente_telefono || 'N/A'}</p>
                </div>
                <div className={estilos.printCol}>
                    <p><strong>FECHA EMISIÓN:</strong> {new Date(cotizacion.fecha_emision).toLocaleDateString()}</p>
                    <p><strong>VENCE:</strong> {new Date(cotizacion.fecha_vencimiento).toLocaleDateString()}</p>
                </div>
            </div>

            <table className={estilos.printTabla}>
                <thead>
                    <tr>
                        <th>CANT.</th>
                        <th>DESCRIPCIÓN</th>
                        <th>PRECIO</th>
                        <th>ITBIS</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {detalle.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.cantidad}</td>
                            <td>{item.nombre_producto}</td>
                            <td>{parseFloat(item.precio_unitario).toFixed(2)}</td>
                            <td>{parseFloat(item.itbis).toFixed(2)}</td>
                            <td>{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={estilos.printFooter}>
                <div className={estilos.printObservaciones}>
                    <strong>Observaciones:</strong>
                    <p>{cotizacion.observaciones || 'Gracias por su preferencia.'}</p>
                </div>
                <div className={estilos.printTotales}>
                    <div className={estilos.printLinTotal}>
                        <span>SUBTOTAL:</span>
                        <span>RD$ {parseFloat(cotizacion.subtotal).toLocaleString()}</span>
                    </div>
                    <div className={estilos.printLinTotal}>
                        <span>ITBIS:</span>
                        <span>RD$ {parseFloat(cotizacion.itbis).toLocaleString()}</span>
                    </div>
                    <div className={`${estilos.printLinTotal} ${estilos.printFinal}`}>
                        <span>TOTAL:</span>
                        <span>RD$ {parseFloat(cotizacion.total).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    nav, button, .no-print { display: none !important; }
                    body { background: white !important; }
                    .contenedor { padding: 0 !important; }
                }
            `}</style>
        </div>
    )
}
