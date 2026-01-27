import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import ObrasAdmin from "@/_Pages/admin/obras/listar/listar";

export default function Page() {
  return (
    <ClienteWrapper>
      <ObrasAdmin />
    </ClienteWrapper>
  );
}

