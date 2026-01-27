import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import VerObra from "@/_Pages/admin/obras/ver/ver";

export default function Page({ params }) {
  return (
    <ClienteWrapper>
      <VerObra id={params.id} />
    </ClienteWrapper>
  );
}

