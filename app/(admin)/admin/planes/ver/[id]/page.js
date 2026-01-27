import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import VerPlan from "@/_Pages/admin/planes/ver/ver";

export default function Page({ params }) {
    return (
        <ClienteWrapper>
            <VerPlan planId={params.id} />
        </ClienteWrapper>
    );
}

