import React, { useState } from 'react';
import { Settings, Globe, Palette, Link2, QrCode, Eye, EyeOff, Save, Copy, Check, Image, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const mockCatalogo = {
  nombre: "Barra 4 Vientos",
  descripcion: "Los mejores productos para tu hogar",
  slug: "barra4vientos",
  logo: null,
  colorPrimario: "#FF6B35",
  colorSecundario: "#004E89",
  activo: true,
  whatsapp: "809-555-1234",
  direccion: "Calle Principal #123, Santo Domingo",
  horario: "Lun-Vie: 9AM-6PM"
};

const mockProductos = [
  { id: 1, nombre: "Mesa Star Wars", precio: 15000, precioOferta: 12000, categoria: "Muebles", visible: true, destacado: true, stock: 5, imagen: "🪑" },
  { id: 2, nombre: "Silla Gaming Pro", precio: 8500, precioOferta: null, categoria: "Muebles", visible: true, destacado: true, stock: 12, imagen: "🎮" },
  { id: 3, nombre: "Lámpara LED", precio: 2500, precioOferta: 1999, categoria: "Electrónica", visible: true, destacado: false, stock: 25, imagen: "💡" },
  { id: 4, nombre: "Set de Cocina", precio: 5500, precioOferta: null, categoria: "Hogar", visible: false, destacado: false, stock: 8, imagen: "🍳" },
  { id: 5, nombre: "Cojines Decorativos", precio: 1200, precioOferta: 999, categoria: "Decoración", visible: true, destacado: false, stock: 30, imagen: "🛋️" },
  { id: 6, nombre: "Espejo de Pared", precio: 4500, precioOferta: null, categoria: "Decoración", visible: false, destacado: false, stock: 6, imagen: "🪞" }
];

export default function ConfiguracionCatalogo() {
  const [config, setConfig] = useState(mockCatalogo);
  const [productos, setProductos] = useState(mockProductos);
  const [guardando, setGuardando] = useState(false);
  const [mostrandoUrl, setMostrandoUrl] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  const urlCatalogo = `https://isiweek.com/c/${config.slug}`;

  const toggleVisibilidad = (id) => {
    setProductos(productos.map(p =>
      p.id === id ? { ...p, visible: !p.visible } : p
    ));
  };

  const toggleDestacado = (id) => {
    setProductos(productos.map(p =>
      p.id === id ? { ...p, destacado: !p.destacado } : p
    ));
  };

  const guardarCambios = () => {
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
    }, 1500);
  };

  const copiarUrl = () => {
    navigator.clipboard.writeText(urlCatalogo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const productosVisibles = productos.filter(p => p.visible).length;
  const productosDestacados = productos.filter(p => p.destacado).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Catálogo Online</h1>
              <p className="text-gray-600 font-medium mt-1">
                Configura y gestiona tu tienda online
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setVistaPrevia(true)}
                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-200 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Vista Previa</span>
              </button>
              <button
                onClick={guardarCambios}
                disabled={guardando}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas Rápidas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                config.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {config.activo ? 'Activo' : 'Inactivo'}
              </div>
            </div>
            <h3 className="font-black text-gray-900 text-2xl mb-1">Estado</h3>
            <p className="text-sm text-gray-600 font-medium">
              Catálogo {config.activo ? 'publicado' : 'en borrador'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-black text-blue-600">{productosVisibles}</span>
            </div>
            <h3 className="font-black text-gray-900 text-2xl mb-1">Productos</h3>
            <p className="text-sm text-gray-600 font-medium">
              Visibles en catálogo
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-black text-purple-600">{productosDestacados}</span>
            </div>
            <h3 className="font-black text-gray-900 text-2xl mb-1">Destacados</h3>
            <p className="text-sm text-gray-600 font-medium">
              Productos en portada
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-black text-green-600">248</span>
            </div>
            <h3 className="font-black text-gray-900 text-2xl mb-1">Visitas</h3>
            <p className="text-sm text-gray-600 font-medium">
              Últimos 7 días
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración General */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Información Básica</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Nombre del Catálogo *
                  </label>
                  <input
                    type="text"
                    value={config.nombre}
                    onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Descripción Corta
                  </label>
                  <textarea
                    value={config.descripcion}
                    onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    URL del Catálogo
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 font-medium">isiweek.com/c/</span>
                    <input
                      type="text"
                      value={config.slug}
                      onChange={(e) => setConfig({ ...config, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-2">
                    Solo letras minúsculas, números y guiones
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={config.whatsapp}
                      onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                      placeholder="809-555-1234"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={config.horario}
                      onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                      placeholder="Lun-Vie: 9AM-6PM"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={config.direccion}
                    onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                    placeholder="Calle Principal #123"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Apariencia */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Apariencia</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Logo del Negocio
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600 mb-1">
                      Arrastra tu logo aquí o haz clic para subir
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      PNG, JPG hasta 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      Color Primario
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.colorPrimario}
                        onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                        className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.colorPrimario}
                        onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      Color Secundario
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.colorSecundario}
                        onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                        className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.colorSecundario}
                        onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gestión de Productos */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Productos del Catálogo</h2>
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {productosVisibles} de {productos.length} visibles
                </div>
              </div>

              <div className="space-y-3">
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className={`border-2 rounded-2xl p-4 transition-all ${
                      producto.visible
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{producto.imagen}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-black text-gray-900">{producto.nombre}</h3>
                          {producto.destacado && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium">
                          <span className="font-bold text-gray-900">
                            RD$ {producto.precio.toLocaleString()}
                          </span>
                          {producto.precioOferta && (
                            <span className="text-orange-600 font-bold">
                              Oferta: RD$ {producto.precioOferta.toLocaleString()}
                            </span>
                          )}
                          <span className="text-blue-600">
                            Stock: {producto.stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleDestacado(producto.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            producto.destacado
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title="Destacar producto"
                        >
                          <TrendingUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleVisibilidad(producto.id)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
                            producto.visible
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {producto.visible ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span>Oculto</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado de Publicación */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="font-black text-gray-900 mb-4">Publicación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Estado del Catálogo</span>
                  <button
                    onClick={() => setConfig({ ...config, activo: !config.activo })}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      config.activo ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        config.activo ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {config.activo
                    ? 'Tu catálogo está visible públicamente'
                    : 'Tu catálogo está oculto del público'
                  }
                </p>
              </div>
            </div>

            {/* Compartir */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Link2 className="w-6 h-6" />
                <h3 className="font-black text-xl">Compartir Catálogo</h3>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold truncate flex-1">{urlCatalogo}</span>
                  <button
                    onClick={copiarUrl}
                    className="bg-white/30 hover:bg-white/40 p-2 rounded-lg transition-colors ml-2"
                  >
                    {copiado ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Generar Código QR</span>
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold transition-colors">
                  📱 Compartir por WhatsApp
                </button>
              </div>
            </div>

            {/* Ayuda */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6">
              <h3 className="font-black text-gray-900 mb-3">💡 Consejo</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                Activa productos destacados para mostrarlos en la portada. 
                Los productos con ofertas atraen más atención de los clientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
