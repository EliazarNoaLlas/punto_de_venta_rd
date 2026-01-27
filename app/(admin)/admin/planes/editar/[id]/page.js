import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import EditarPlan from "@/_Pages/admin/planes/editar/editar";

export default function Page({ params }) {
    return (
        <ClienteWrapper>
            <EditarPlan planId={params.id} />
        </ClienteWrapper>
    );
}

