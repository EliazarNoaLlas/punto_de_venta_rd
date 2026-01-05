import React, { useState } from 'react';
import { ShoppingCart, Package, Search, Filter, TrendingUp, Star, Clock, X, Plus, Minus, Check, Building2, CreditCard, FileText } from 'lucide-react';

const mockProductosB2B = [
  {
    id: 1,
    nombre: "Papel Térmico 80mm (Caja 50 rollos)",
    descripcion: "Papel térmico premium para impresoras POS de 80mm",
    categoria: "Suministros",
    precio: 2500,
    precioVolumen: { cantidad: 5, precio: 2300 },
    stock: 120,
    imagen: "📄",
    destacado: true,
    tiempoEntrega: "2-3 días",
    sku: "PT-80-50"
  },
  {
    id: 2,
    nombre: "Impresora Térmica Star TSP143",
    descripcion: "Impresora térmica de alta velocidad con auto-corte",
    categoria: "Equipos",
    precio: 18500,
    precioVolumen: null,
    stock: 15,
    imagen: "🖨️",
    destacado: true,
    tiempoEntrega: "5-7 días",
    sku: "IMP-STAR-143"
  },
  {
    id: 3,
    nombre: "Gaveta para Dinero Manual",
    descripcion: "Gaveta metálica con 5 compartimentos para billetes y monedas",
    categoria: "Equipos",
    precio: 3200,
    precioVolumen: null,
    stock: 25,
    imagen: "💰",
    destacado: false,
    tiempoEntrega: "3-4 días",
    sku: "GAV-MAN-01"
  },
  {
    id: 4,
    nombre: "Lector de Código de Barras USB",
    descripcion: "Escáner 1D/2D compatible con todos los códigos",
    categoria: "Equipos",
    precio: 4500,
    precioVolumen: { cantidad: 3, precio: 4200 },
    stock: 30,
    imagen: "📊",
    destacado: true,
    tiempoEntrega: "2-3 días",
    sku: "LCB-USB-2D"
  },
  {
    id: 5,
    nombre: "Rollo Térmico 57mm (Caja 100 unidades)",
    descripcion: "Rollos térmicos de 57mm para mini impresoras",
    categoria: "Suministros",
    precio: 3800,
    precioVolumen: { cantidad: 5, precio: 3500 },
    stock: 200,
    imagen: "🧻",
    destacado: false,
    tiempoEntrega: "1-2 días",
    sku: "RT-57-100"
  },
  {
    id: 6,
    nombre: "Licencia IsiWeek Premium (Anual)",
    descripcion: "Incluye todas las funcionalidades avanzadas y soporte prioritario",
    categoria: "Licencias",
    precio: 12000,
    precioVolumen: null,
    stock: 999,
    imagen: "🔑",
    destacado: true,
    tiempoEntrega: "Inmediato",
    sku: "LIC-PREM-12M"
  },
  {
    id: 7,
    nombre: "Báscula Digital para Comercio",
    descripcion: "Báscula electrónica de hasta 30kg con pantalla LED",
    categoria: "Equipos",
    precio: 5800,
    precioVolumen: null,
    stock: 18,
    imagen: "⚖️",
    destacado: false,
    tiempoEntrega: "4-5 días",
    sku: "BAS-DIG-30"
  },
  {
    id: 8,
    nombre: "Terminal Tablet Android para POS",
    descripcion: "Tablet Android 10\" optimizada para punto de venta",
    categoria: "Equipos",
    precio: 28000,
    precioVolumen: null,
    stock: 8,
    imagen: "📱",
    destacado: true,
    tiempoEntrega: "7-10 días",
    sku: "TAB-POS-10"
  }
];

const categorias = ["Todos", "Suministros", "Equipos", "Licencias"];

export default function TiendaB2B() {
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);

  const productosFiltrados = mockProductosB2B.filter(p => {
    const matchCategoria = categoriaSeleccionada === "Todos" || p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.sku.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
  };

  const calcularPrecioItem = (item) => {
    if (item.precioVolumen && item.cantidad >= item.precioVolumen.cantidad) {
      return item.precioVolumen.precio * item.cantidad;
    }
    return item.precio * item.cantidad;
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + calcularPrecioItem(item), 0);
  };

  const calcularDescuentoVolumen = () => {
    return carrito.reduce((total, item) => {
      if (item.precioVolumen && item.cantidad >= item.precioVolumen.cantidad) {
        const descuento = (item.precio - item.precioVolumen.precio) * item.cantidad;
        return total + descuento;
      }
      return total;
    }, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-2xl">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">IsiWeek Store</h1>
                <p className="text-blue-100 font-bold">Tienda B2B - Solo para Empresas</p>
              </div>
            </div>

            {/* Carrito */}
            <button
              onClick={() => setMostrarCarrito(true)}
              className="relative bg-white text-blue-600 px-6 py-3 rounded-full font-black shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center space-x-3"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Mi Pedido</span>
              {carrito.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-sm font-black rounded-full w-8 h-8 flex items-center justify-center animate-bounce">
                  {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="pb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-gray-900 font-bold text-lg"
              />
            </div>

            <div className="flex space-x-3 overflow-x-auto pb-2">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-6 py-3 rounded-xl font-black whitespace-nowrap transition-all ${
                    categoriaSeleccionada === cat
                      ? 'bg-white text-blue-600 shadow-xl'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Banner Destacado */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">
                🔥 Ofertas por Volumen
              </h2>
              <p className="text-xl text-orange-100 font-bold">
                Ahorra hasta 15% comprando en cantidad
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
              <div className="text-white">
                <div className="text-sm font-bold opacity-80">Envío Gratis</div>
                <div className="text-2xl font-black">+RD$ 5,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden border-2 border-gray-700 hover:border-purple-500 transform hover:-translate-y-2"
            >
              {/* Imagen */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 h-48 flex items-center justify-center">
                <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {producto.imagen}
                </div>
                
                {producto.destacado && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-2 rounded-full shadow-lg flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>POPULAR</span>
                  </div>
                )}

                {producto.precioVolumen && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-black px-3 py-2 rounded-full shadow-lg">
                    💰 DESCUENTO
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                      {producto.categoria}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      SKU: {producto.sku}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mb-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium line-clamp-2">
                    {producto.descripcion}
                  </p>
                </div>

                {/* Stock y Entrega */}
                <div className="flex items-center justify-between mb-4 text-xs">
                  <div className="flex items-center space-x-1 text-green-400 font-bold">
                    <Package className="w-4 h-4" />
                    <span>{producto.stock} disponibles</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>{producto.tiempoEntrega}</span>
                  </div>
                </div>

                {/* Precio */}
                <div className="mb-4">
                  <div className="text-3xl font-black text-white mb-1">
                    RD$ {producto.precio.toLocaleString()}
                  </div>
                  {producto.precioVolumen && (
                    <div className="bg-green-900/50 border border-green-500 rounded-lg p-2">
                      <div className="text-xs text-green-300 font-bold mb-1">
                        Precio por volumen:
                      </div>
                      <div className="text-sm font-black text-green-400">
                        RD$ {producto.precioVolumen.precio.toLocaleString()} c/u
                        <span className="text-xs font-bold text-green-300 ml-2">
                          (comprando {producto.precioVolumen.cantidad}+)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-black hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Agregar</span>
                  </button>
                  <button
                    onClick={() => setProductoSeleccionado(producto)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-purple-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white">Mi Pedido</h2>
                  <p className="text-purple-100 font-bold">
                    {carrito.reduce((sum, item) => sum + item.cantidad, 0)} productos
                  </p>
                </div>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto max-h-96 p-6">
              {carrito.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-4">🛒</div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-400 font-medium mb-6">
                    Agrega productos para comenzar tu pedido
                  </p>
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-full font-black hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Ver Productos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => {
                    const tieneDescuentoVolumen = item.precioVolumen && item.cantidad >= item.precioVolumen.cantidad;
                    const precioUnitario = tieneDescuentoVolumen ? item.precioVolumen.precio : item.precio;
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-4"
                      >
                        <div className="flex items-start space-x-4 mb-3">
                          <div className="text-4xl">{item.imagen}</div>
                          <div className="flex-1">
                            <h4 className="font-black text-white mb-1">{item.nombre}</h4>
                            <p className="text-xs text-gray-400 font-bold mb-2">SKU: {item.sku}</p>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                className="bg-gray-700 border-2 border-gray-600 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                <Minus className="w-4 h-4 text-white" />
                              </button>
                              <span className="font-black text-xl text-white w-12 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-xl text-white">
                              RD$ {calcularPrecioItem(item).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                              RD$ {precioUnitario.toLocaleString()} c/u
                            </div>
                          </div>
                        </div>
                        
                        {tieneDescuentoVolumen && (
                          <div className="bg-green-900/30 border border-green-500 rounded-lg p-2 flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-bold text-green-400">
                              Descuento por volumen aplicado: Ahorras RD$ {((item.precio - item.precioVolumen.precio) * item.cantidad).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {carrito.length > 0 && (
              <div className="border-t-2 border-gray-700 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300 font-medium">
                    <span>Subtotal:</span>
                    <span>RD$ {calcularSubtotal().toLocaleString()}</span>
                  </div>
                  {calcularDescuentoVolumen() > 0 && (
                    <div className="flex justify-between text-green-400 font-bold">
                      <span>Descuento por volumen:</span>
                      <span>- RD$ {calcularDescuentoVolumen().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-3xl font-black text-white pt-3 border-t-2 border-gray-700">
                    <span>Total:</span>
                    <span className="text-purple-400">
                      RD$ {calcularTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMostrarCarrito(false);
                    setMostrarCheckout(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-black text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <FileText className="w-6 h-6" />
                  <span>Finalizar Pedido</span>
                </button>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="w-full bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
                >
                  Seguir Comprando
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Checkout */}
      {mostrarCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-purple-500">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white">Confirmar Pedido B2B</h2>
                  <p className="text-purple-100 font-bold">Pedido para: Barra 4 Vientos</p>
                </div>
                <button
                  onClick={() => setMostrarCheckout(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Resumen */}
              <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6">
                <h3 className="font-black text-white mb-4">Resumen del Pedido</h3>
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-300 font-medium">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span className="font-black text-white">
                        RD$ {calcularPrecioItem(item).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-700 mt-4 pt-4 flex justify-between text-2xl font-black text-purple-400">
                  <span>Total:</span>
                  <span>RD$ {calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6">
                <h3 className="font-black text-white mb-4">Método de Pago</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6" />
                      <span>Crédito Empresarial (30 días)</span>
                    </div>
                    <Check className="w-6 h-6" />
                  </button>
                  <button className="w-full bg-gray-700 text-white p-4 rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center space-x-3">
                    <span className="text-2xl">💳</span>
                    <span>Transferencia Bancaria</span>
                  </button>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">
                  Notas o Instrucciones
                </label>
                <textarea
                  placeholder="Ej: Entregar en horario de la tarde..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 text-white rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium resize-none"
                />
              </div>

              {/* Acciones */}
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-black text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg">
                  Confirmar Pedido
                </button>
                <button
                  onClick={() => setMostrarCheckout(false)}
                  className="w-full bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
