import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import EditarObra from "@/_Pages/admin/obras/editar/editar";

export default function Page({ params }) {
  return (
    <ClienteWrapper>
      <EditarObra id={params.id} />
    </ClienteWrapper>
  );
}

