import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Heart, Star, ChevronRight, Share2, X, Plus, Minus, MapPin, Clock, Phone } from 'lucide-react';

// Datos de prueba
const mockCatalogo = {
  nombre: "Barra 4 Vientos",
  descripcion: "Los mejores productos para tu hogar",
  logo: "🏪",
  colorPrimario: "#FF6B35",
  colorSecundario: "#004E89"
};

const mockProductos = [
  {
    id: 1,
    nombre: "Mesa Star Wars Edición Especial",
    descripcion: "Mesa temática de Star Wars con detalles únicos",
    precio: 15000,
    precioOferta: 12000,
    imagen: "🪑",
    categoria: "Muebles",
    stock: 5,
    destacado: true,
    rating: 4.8
  },
  {
    id: 2,
    nombre: "Silla Gaming Pro",
    descripcion: "Comodidad extrema para largas sesiones",
    precio: 8500,
    precioOferta: null,
    imagen: "🎮",
    categoria: "Muebles",
    stock: 12,
    destacado: true,
    rating: 4.9
  },
  {
    id: 3,
    nombre: "Lámpara LED Inteligente",
    descripcion: "Control por voz y 16 millones de colores",
    precio: 2500,
    precioOferta: 1999,
    imagen: "💡",
    categoria: "Electrónica",
    stock: 25,
    destacado: false,
    rating: 4.6
  },
  {
    id: 4,
    nombre: "Set de Cocina Premium",
    descripcion: "10 piezas de acero inoxidable",
    precio: 5500,
    precioOferta: null,
    imagen: "🍳",
    categoria: "Hogar",
    stock: 8,
    destacado: true,
    rating: 4.7
  },
  {
    id: 5,
    nombre: "Cojines Decorativos",
    descripcion: "Pack de 4 unidades con diseños únicos",
    precio: 1200,
    precioOferta: 999,
    imagen: "🛋️",
    categoria: "Decoración",
    stock: 30,
    destacado: false,
    rating: 4.5
  },
  {
    id: 6,
    nombre: "Espejo de Pared Grande",
    descripcion: "Marco dorado vintage, 120x80cm",
    precio: 4500,
    precioOferta: null,
    imagen: "🪞",
    categoria: "Decoración",
    stock: 6,
    destacado: false,
    rating: 4.8
  }
];

const categorias = ["Todos", "Muebles", "Electrónica", "Hogar", "Decoración"];

export default function CatalogoPublico() {
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);

  const productosFiltrados = mockProductos.filter(p => {
    const matchCategoria = categoriaSeleccionada === "Todos" || p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
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

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const precio = item.precioOferta || item.precio;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const toggleFavorito = (id) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(fav => fav !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo y Nombre */}
            <div className="flex items-center space-x-3">
              <div className="text-5xl transform hover:scale-110 transition-transform">
                {mockCatalogo.logo}
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {mockCatalogo.nombre}
                </h1>
                <p className="text-sm text-gray-500 font-medium">{mockCatalogo.descripcion}</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Heart className="w-6 h-6 text-gray-600" />
                {favoritos.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritos.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMostrarCarrito(true)}
                className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito</span>
                {carrito.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center animate-bounce">
                    {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
              />
            </div>

            {/* Categorías */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                    categoriaSeleccionada === cat
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Productos Destacados Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-blue-600 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black mb-1">🔥 Productos Destacados</h2>
              <p className="text-orange-100 font-medium">Las mejores ofertas de la semana</p>
            </div>
            <div className="hidden sm:flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
              <Clock className="w-5 h-5" />
              <span className="font-bold">Ofertas limitadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-orange-300 transform hover:-translate-y-1"
            >
              {/* Imagen */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-56 flex items-center justify-center overflow-hidden">
                <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                  {producto.imagen}
                </div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {producto.destacado && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                      ⭐ DESTACADO
                    </span>
                  )}
                  {producto.precioOferta && (
                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                      🔥 OFERTA
                    </span>
                  )}
                </div>

                {/* Favorito */}
                <button
                  onClick={() => toggleFavorito(producto.id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favoritos.includes(producto.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>

                {/* Stock bajo */}
                {producto.stock < 10 && (
                  <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ¡Solo {producto.stock} disponibles!
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                      {producto.categoria}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 mt-1 leading-tight">
                      {producto.nombre}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-medium">
                  {producto.descripcion}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(producto.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-bold text-gray-700 ml-2">
                    {producto.rating}
                  </span>
                </div>

                {/* Precio */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    {producto.precioOferta ? (
                      <>
                        <div className="text-sm text-gray-500 line-through font-medium">
                          RD$ {producto.precio.toLocaleString()}
                        </div>
                        <div className="text-3xl font-black text-orange-600">
                          RD$ {producto.precioOferta.toLocaleString()}
                        </div>
                        <div className="text-xs font-bold text-green-600">
                          Ahorras RD$ {(producto.precio - producto.precioOferta).toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl font-black text-gray-900">
                        RD$ {producto.precio.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Agregar</span>
                  </button>
                  <button
                    onClick={() => setProductoSeleccionado(producto)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">🔍</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No encontramos productos
            </h3>
            <p className="text-gray-600 font-medium">
              Intenta con otra búsqueda o categoría
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-black mb-4">{mockCatalogo.nombre}</h3>
              <p className="text-gray-300 font-medium">
                Los mejores productos para tu hogar con entrega rápida y segura.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-black mb-4">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">809-555-1234</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">Santo Domingo, RD</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-black mb-4">Horarios</h4>
              <div className="space-y-2 text-gray-300 font-medium">
                <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
                <p>Sábados: 9:00 AM - 2:00 PM</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 font-medium">
            <p>© 2026 {mockCatalogo.nombre} - Powered by IsiWeek POS</p>
          </div>
        </div>
      </footer>

      {/* Modal Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header Carrito */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black">Tu Carrito</h2>
                  <p className="text-orange-100 font-medium">
                    {carrito.reduce((sum, item) => sum + item.cantidad, 0)} productos
                  </p>
                </div>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido Carrito */}
            <div className="overflow-y-auto max-h-96 p-6">
              {carrito.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-4">🛒</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-600 font-medium mb-6">
                    ¡Agrega productos para comenzar!
                  </p>
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                  >
                    Ver Productos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border-2 border-gray-100"
                    >
                      <div className="text-4xl">{item.imagen}</div>
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900">{item.nombre}</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          RD$ {(item.precioOferta || item.precio).toLocaleString()} c/u
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="bg-white border-2 border-gray-300 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-black text-xl w-8 text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-black text-xl text-gray-900">
                        RD$ {((item.precioOferta || item.precio) * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Carrito */}
            {carrito.length > 0 && (
              <div className="border-t-2 border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between text-2xl font-black">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    RD$ {calcularTotal().toLocaleString()}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-black text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl">
                  Finalizar Pedido
                </button>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Seguir Comprando
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Detalle Producto */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              <button
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-80 flex items-center justify-center">
                <div className="text-9xl">{productoSeleccionado.imagen}</div>
              </div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-bold text-orange-600 uppercase tracking-wider">
                      {productoSeleccionado.categoria}
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mt-2">
                      {productoSeleccionado.nombre}
                    </h2>
                  </div>
                  <button
                    onClick={() => toggleFavorito(productoSeleccionado.id)}
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        favoritos.includes(productoSeleccionado.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(productoSeleccionado.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold text-gray-700">
                    {productoSeleccionado.rating}
                  </span>
                </div>

                <p className="text-lg text-gray-700 mb-6 font-medium leading-relaxed">
                  {productoSeleccionado.descripcion}
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-1">Precio</div>
                      {productoSeleccionado.precioOferta ? (
                        <>
                          <div className="text-xl text-gray-500 line-through font-medium">
                            RD$ {productoSeleccionado.precio.toLocaleString()}
                          </div>
                          <div className="text-5xl font-black text-orange-600">
                            RD$ {productoSeleccionado.precioOferta.toLocaleString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-5xl font-black text-gray-900">
                          RD$ {productoSeleccionado.precio.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium mb-1">Disponibilidad</div>
                      <div className="text-2xl font-black text-green-600">
                        {productoSeleccionado.stock} en stock
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      agregarAlCarrito(productoSeleccionado);
                      setProductoSeleccionado(null);
                      setMostrarCarrito(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-black text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>Agregar al Carrito</span>
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded-xl transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
