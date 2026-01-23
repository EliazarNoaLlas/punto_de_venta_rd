import DetalleCotizacion from "@/_Pages/admin/cotizaciones/DetalleCotizacion"

export const metadata = {
    title: 'Detalle de Cotización - Admin',
}

export default async function VerCotizacionPage({ params }) {
    const { id } = await params
    return <DetalleCotizacion id={id} />
}
