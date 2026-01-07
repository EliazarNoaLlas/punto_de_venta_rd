import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, Phone, MapPin, DollarSign, Calendar, Filter, Search, TrendingUp } from 'lucide-react';

const mockPedidos = [
  {
    id: 1,
    numero: 'PED-20260104-001',
    cliente: {
      nombre: 'Juan Pérez',
      telefono: '809-555-1234',
      email: 'juan@example.com',
      direccion: 'Calle Principal #123, Sector Los Mina'
    },
    items: [
      { nombre: 'Mesa Star Wars', cantidad: 1, precio: 12000, imagen: '🪑' },
      { nombre: 'Lámpara LED', cantidad: 2, precio: 1999, imagen: '💡' }
    ],
    subtotal: 15998,
    envio: 200,
    total: 16198,
    metodo_pago: 'contra_entrega',
    metodo_entrega: 'delivery',
    estado: 'pendiente',
    fecha: '2026-01-04 10:30 AM',
    notas: 'Tocar el timbre dos veces'
  },
  {
    id: 2,
    numero: 'PED-20260104-002',
    cliente: {
      nombre: 'María García',
      telefono: '809-555-5678',
      email: null,
      direccion: null
    },
    items: [
      { nombre: 'Silla Gaming Pro', cantidad: 1, precio: 8500, imagen: '🎮' },
      { nombre: 'Cojines Decorativos', cantidad: 3, precio: 999, imagen: '🛋️' }
    ],
    subtotal: 11497,
    envio: 0,
    total: 11497,
    metodo_pago: 'efectivo',
    metodo_entrega: 'pickup',
    estado: 'confirmado',
    fecha: '2026-01-04 11:15 AM',
    notas: null
  },
  {
    id: 3,
    numero: 'PED-20260104-003',
    cliente: {
      nombre: 'Carlos Rodríguez',
      telefono: '809-555-9012',
      email: 'carlos@example.com',
      direccion: 'Av. Winston Churchill #456'
    },
    items: [
      { nombre: 'Set de Cocina Premium', cantidad: 1, precio: 5500, imagen: '🍳' }
    ],
    subtotal: 5500,
    envio: 200,
    total: 5700,
    metodo_pago: 'transferencia',
    metodo_entrega: 'delivery',
    estado: 'en_proceso',
    fecha: '2026-01-04 09:45 AM',
    notas: 'Llamar antes de llegar'
  },
  {
    id: 4,
    numero: 'PED-20260103-015',
    cliente: {
      nombre: 'Ana Martínez',
      telefono: '809-555-3456',
      email: 'ana@example.com',
      direccion: null
    },
    items: [
      { nombre: 'Espejo de Pared Grande', cantidad: 1, precio: 4500, imagen: '🪞' },
      { nombre: 'Lámpara LED', cantidad: 1, precio: 1999, imagen: '💡' }
    ],
    subtotal: 6499,
    envio: 0,
    total: 6499,
    metodo_pago: 'efectivo',
    metodo_entrega: 'pickup',
    estado: 'listo',
    fecha: '2026-01-03 04:20 PM',
    notas: null
  },
  {
    id: 5,
    numero: 'PED-20260103-012',
    cliente: {
      nombre: 'Pedro López',
      telefono: '809-555-7890',
      email: null,
      direccion: 'Calle Duarte #789'
    },
    items: [
      { nombre: 'Mesa Star Wars', cantidad: 1, precio: 12000, imagen: '🪑' }
    ],
    subtotal: 12000,
    envio: 200,
    total: 12200,
    metodo_pago: 'contra_entrega',
    metodo_entrega: 'delivery',
    estado: 'entregado',
    fecha: '2026-01-03 02:10 PM',
    notas: null
  }
];

const estadosConfig = {
  pendiente: { label: 'Pendiente', color: 'yellow', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'blue', icon: CheckCircle },
  en_proceso: { label: 'En Proceso', color: 'purple', icon: Package },
  listo: { label: 'Listo', color: 'green', icon: CheckCircle },
  entregado: { label: 'Entregado', color: 'emerald', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'red', icon: XCircle }
};

export default function DashboardPedidos() {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const pedidosFiltrados = mockPedidos.filter(pedido => {
    const matchEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchBusqueda = 
      pedido.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const contarPorEstado = (estado) => {
    return mockPedidos.filter(p => p.estado === estado).length;
  };

  const calcularTotalVentas = () => {
    return mockPedidos
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + p.total, 0);
  };

  const cambiarEstado = (pedidoId, nuevoEstado) => {
    // Aquí iría la lógica para actualizar el estado
    console.log(`Cambiar pedido ${pedidoId} a estado ${nuevoEstado}`);
    setPedidoSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Pedidos Online</h1>
              <p className="text-gray-600 font-medium mt-1">
                Gestiona todos los pedidos del catálogo
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="text-xs font-bold opacity-80">Pedidos Nuevos</div>
                <div className="text-3xl font-black">{contarPorEstado('pendiente')}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-black text-gray-900">
                {contarPorEstado('pendiente')}
              </span>
            </div>
            <h3 className="font-black text-gray-900">Pendientes</h3>
            <p className="text-sm text-gray-600 font-medium">Requieren atención</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-black text-gray-900">
                {contarPorEstado('en_proceso')}
              </span>
            </div>
            <h3 className="font-black text-gray-900">En Proceso</h3>
            <p className="text-sm text-gray-600 font-medium">Siendo preparados</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-black text-gray-900">
                {contarPorEstado('entregado')}
              </span>
            </div>
            <h3 className="font-black text-gray-900">Entregados</h3>
            <p className="text-sm text-gray-600 font-medium">Completados hoy</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black">
                RD$ {(calcularTotalVentas() / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="font-black">Ventas Totales</h3>
            <p className="text-sm text-purple-100 font-medium">Pedidos entregados</p>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
              />
            </div>

            {/* Filtros de Estado */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  filtroEstado === 'todos'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {Object.entries(estadosConfig).map(([estado, config]) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
                    filtroEstado === estado
                      ? `bg-${config.color}-500 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => {
            const estadoConfig = estadosConfig[pedido.estado];
            const EstadoIcon = estadoConfig.icon;
            
            return (
              <div
                key={pedido.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-orange-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-black text-gray-900">
                          {pedido.numero}
                        </h3>
                        <span className={`bg-${estadoConfig.color}-100 text-${estadoConfig.color}-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1`}>
                          <EstadoIcon className="w-4 h-4" />
                          <span>{estadoConfig.label}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{pedido.fecha}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {pedido.metodo_entrega === 'delivery' ? (
                            <Truck className="w-4 h-4" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                          <span>
                            {pedido.metodo_entrega === 'delivery' ? 'Delivery' : 'Pickup'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-orange-600">
                        RD$ {pedido.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-bold mb-1">Cliente</div>
                          <div className="font-black text-gray-900">{pedido.cliente.nombre}</div>
                          <div className="text-sm text-gray-600 font-medium">
                            {pedido.cliente.telefono}
                          </div>
                        </div>
                      </div>
                    </div>

                    {pedido.metodo_entrega === 'delivery' && pedido.cliente.direccion && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-bold mb-1">Dirección</div>
                            <div className="text-sm text-gray-700 font-medium">
                              {pedido.cliente.direccion}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {pedido.notas && (
                      <div className="bg-yellow-50 rounded-xl p-4 md:col-span-2">
                        <div className="flex items-start space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-bold mb-1">Notas</div>
                            <div className="text-sm text-gray-700 font-medium">
                              {pedido.notas}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Productos */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="text-xs text-gray-500 font-bold mb-3">Productos</div>
                    <div className="space-y-2">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.imagen}</span>
                            <div>
                              <div className="font-bold text-gray-900">{item.nombre}</div>
                              <div className="text-xs text-gray-600 font-medium">
                                {item.cantidad} x RD$ {item.precio.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="font-black text-gray-900">
                            RD$ {(item.precio * item.cantidad).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Ver Detalle</span>
                    </button>
                    
                    {pedido.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'confirmado')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                      >
                        Confirmar Pedido
                      </button>
                    )}
                    
                    {pedido.estado === 'confirmado' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'en_proceso')}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                      >
                        Iniciar Preparación
                      </button>
                    )}
                    
                    {pedido.estado === 'en_proceso' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'listo')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                      >
                        Marcar como Listo
                      </button>
                    )}
                    
                    {pedido.estado === 'listo' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'entregado')}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
                      >
                        Marcar como Entregado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pedidosFiltrados.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-4">📦</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No hay pedidos
            </h3>
            <p className="text-gray-600 font-medium">
              No se encontraron pedidos con los filtros seleccionados
            </p>
          </div>
        )}
      </div>

      {/* Modal Detalle Pedido */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-1">
                    Detalle del Pedido
                  </h2>
                  <p className="text-orange-100 font-medium">
                    {pedidoSeleccionado.numero}
                  </p>
                </div>
                <button
                  onClick={() => setPedidoSeleccionado(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Estado y Fecha */}
              <div className="flex items-center justify-between">
                <div>
                  {(() => {
                    const estadoConfig = estadosConfig[pedidoSeleccionado.estado];
                    const EstadoIcon = estadoConfig.icon;
                    return (
                      <span className={`inline-flex items-center space-x-2 bg-${estadoConfig.color}-100 text-${estadoConfig.color}-700 px-4 py-2 rounded-xl text-sm font-black`}>
                        <EstadoIcon className="w-5 h-5" />
                        <span>{estadoConfig.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Fecha</div>
                  <div className="font-black text-gray-900">{pedidoSeleccionado.fecha}</div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-black text-gray-900 mb-4 flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>Información del Cliente</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-bold mb-1">Nombre</div>
                    <div className="font-black text-gray-900 text-lg">
                      {pedidoSeleccionado.cliente.nombre}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-1">Teléfono</div>
                      <a
                        href={`tel:${pedidoSeleccionado.cliente.telefono}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        {pedidoSeleccionado.cliente.telefono}
                      </a>
                    </div>
                    {pedidoSeleccionado.cliente.email && (
                      <div>
                        <div className="text-xs text-gray-500 font-bold mb-1">Email</div>
                        <a
                          href={`mailto:${pedidoSeleccionado.cliente.email}`}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          {pedidoSeleccionado.cliente.email}
                        </a>
                      </div>
                    )}
                  </div>
                  {pedidoSeleccionado.cliente.direccion && (
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-1">Dirección</div>
                      <div className="text-gray-700 font-medium">
                        {pedidoSeleccionado.cliente.direccion}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-black text-gray-900 mb-4">Productos</h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{item.imagen}</div>
                        <div>
                          <div className="font-black text-gray-900">{item.nombre}</div>
                          <div className="text-sm text-gray-600 font-medium">
                            {item.cantidad} x RD$ {item.precio.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-black text-gray-900">
                        RD$ {(item.precio * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Subtotal</span>
                  <span>RD$ {pedidoSeleccionado.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Envío</span>
                  <span>
                    {pedidoSeleccionado.envio === 0
                      ? 'Gratis'
                      : `RD$ ${pedidoSeleccionado.envio.toLocaleString()}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-black text-orange-600 pt-3 border-t-2 border-gray-200">
                  <span>Total</span>
                  <span>RD$ {pedidoSeleccionado.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Método de Pago y Entrega */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-bold mb-2">Método de Pago</div>
                  <div className="font-black text-gray-900">
                    {pedidoSeleccionado.metodo_pago === 'contra_entrega' ? 'Contra Entrega' :
                     pedidoSeleccionado.metodo_pago === 'efectivo' ? 'Efectivo' :
                     pedidoSeleccionado.metodo_pago === 'transferencia' ? 'Transferencia' :
                     'Tarjeta'}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-bold mb-2">Método de Entrega</div>
                  <div className="font-black text-gray-900">
                    {pedidoSeleccionado.metodo_entrega === 'delivery' ? 'Delivery' : 'Pickup'}
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                <a
                  href={`https://wa.me/${pedidoSeleccionado.cliente.telefono.replace(/\D/g, '')}`}
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-black text-center hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                  📱 Contactar por WhatsApp
                </a>
                <button
                  onClick={() => window.open(`tel:${pedidoSeleccionado.cliente.telefono}`)}
                  className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-black hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  📞 Llamar al Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
