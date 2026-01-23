import ImprimirCotizacion from "@/_Pages/admin/cotizaciones/ImprimirCotizacion"

export const metadata = {
    title: 'Imprimir Cotización - Admin',
}

export default async function ImprimirCotizacionPage({ params }) {
    const { id } = await params
    return <ImprimirCotizacion id={id} />
}
