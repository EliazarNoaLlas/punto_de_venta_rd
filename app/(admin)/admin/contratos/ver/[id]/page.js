import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import VerContratoFinanciamiento from "@/_Pages/admin/contratos/ver/[id]/ver";

export default function Page({ params }) {
  return (
    <ClienteWrapper>
      <VerContratoFinanciamiento />
    </ClienteWrapper>
  );
}

