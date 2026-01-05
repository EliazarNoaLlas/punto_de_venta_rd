import React, { useState } from 'react';
import { CreditCard, MapPin, User, Phone, Mail, Clock, Package, Check, ArrowLeft, Truck, Store } from 'lucide-react';

const mockCarrito = [
  {
    id: 1,
    nombre: "Mesa Star Wars Edición Especial",
    precio: 12000,
    cantidad: 1,
    imagen: "🪑"
  },
  {
    id: 3,
    nombre: "Lámpara LED Inteligente",
    precio: 1999,
    cantidad: 2,
    imagen: "💡"
  },
  {
    id: 5,
    nombre: "Cojines Decorativos",
    precio: 999,
    cantidad: 3,
    imagen: "🛋️"
  }
];

export default function CheckoutPublico() {
  const [paso, setPaso] = useState(1);
  const [metodoPago, setMetodoPago] = useState('contra_entrega');
  const [metodoEntrega, setMetodoEntrega] = useState('pickup');
  const [pedidoCreado, setPedidoCreado] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState('PED-20260104-001');
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  });

  const calcularSubtotal = () => {
    return mockCarrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const calcularEnvio = () => {
    return metodoEntrega === 'delivery' ? 200 : 0;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularEnvio();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simular creación de pedido
    setTimeout(() => {
      setPedidoCreado(true);
      setNumeroPedido(`PED-${Date.now()}`);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (pedidoCreado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Gracias por tu compra 🎉
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-8">
            <div className="text-white/80 text-sm font-bold mb-2">
              Tu número de pedido
            </div>
            <div className="text-4xl font-black text-white tracking-wider">
              {numeroPedido}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 mb-1">Estado del Pedido</h3>
                <p className="text-gray-600 font-medium">
                  Tu pedido está siendo procesado. Recibirás una confirmación pronto.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 mb-1">Tiempo Estimado</h3>
                <p className="text-gray-600 font-medium">
                  {metodoEntrega === 'pickup' 
                    ? 'Listo para recoger en 30-45 minutos'
                    : 'Entrega en 1-2 horas'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 mb-1">Método de Pago</h3>
                <p className="text-gray-600 font-medium">
                  {metodoPago === 'contra_entrega' ? 'Pago contra entrega' :
                   metodoPago === 'efectivo' ? 'Efectivo' :
                   metodoPago === 'transferencia' ? 'Transferencia bancaria' :
                   'Tarjeta de crédito'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`https://wa.me/18095551234?text=Hola, mi número de pedido es ${numeroPedido}`}
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-black text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              📱 Contactar por WhatsApp
            </a>
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-bold transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Carrito</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Finalizar Pedido</h1>
              <p className="text-gray-600 font-medium mt-1">
                {mockCarrito.length} productos - RD$ {calcularTotal().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Indicador de Pasos */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-lg transition-all ${
                  paso >= num
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`h-1 w-16 rounded-full transition-all ${
                    paso > num ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Paso 1: Información Personal */}
              {paso === 1 && (
                <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                      Información Personal
                    </h2>
                    <p className="text-gray-600 font-medium">
                      ¿Cómo te contactamos?
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      <span>Nombre Completo *</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Juan Pérez"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>Teléfono *</span>
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="809-555-1234"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>Email (opcional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="juan@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaso(2)}
                    disabled={!formData.nombre || !formData.telefono}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-black text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {/* Paso 2: Método de Entrega y Pago */}
              {paso === 2 && (
                <div className="space-y-6">
                  {/* Método de Entrega */}
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">
                      Método de Entrega
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setMetodoEntrega('pickup')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          metodoEntrega === 'pickup'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            metodoEntrega === 'pickup' ? 'bg-orange-500' : 'bg-gray-100'
                          }`}>
                            <Store className={`w-6 h-6 ${
                              metodoEntrega === 'pickup' ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="text-left">
                            <div className="font-black text-gray-900">Recoger en Tienda</div>
                            <div className="text-sm text-gray-600 font-medium">Gratis</div>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMetodoEntrega('delivery')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          metodoEntrega === 'delivery'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            metodoEntrega === 'delivery' ? 'bg-orange-500' : 'bg-gray-100'
                          }`}>
                            <Truck className={`w-6 h-6 ${
                              metodoEntrega === 'delivery' ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="text-left">
                            <div className="font-black text-gray-900">Entrega a Domicilio</div>
                            <div className="text-sm text-gray-600 font-medium">RD$ 200</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {metodoEntrega === 'delivery' && (
                      <div className="mt-6">
                        <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>Dirección de Entrega *</span>
                        </label>
                        <textarea
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                          placeholder="Calle Principal #123, Sector..."
                          required={metodoEntrega === 'delivery'}
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium resize-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Método de Pago */}
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">
                      Método de Pago
                    </h2>
                    <div className="space-y-3">
                      {[
                        { value: 'contra_entrega', label: 'Pago contra entrega', icon: '💵' },
                        { value: 'efectivo', label: 'Efectivo al recoger', icon: '💰' },
                        { value: 'transferencia', label: 'Transferencia bancaria', icon: '🏦' },
                        { value: 'tarjeta', label: 'Tarjeta de crédito', icon: '💳', disabled: true }
                      ].map((metodo) => (
                        <button
                          key={metodo.value}
                          type="button"
                          onClick={() => !metodo.disabled && setMetodoPago(metodo.value)}
                          disabled={metodo.disabled}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                            metodoPago === metodo.value
                              ? 'border-orange-500 bg-orange-50'
                              : metodo.disabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{metodo.icon}</span>
                            <div>
                              <div className="font-black text-gray-900">{metodo.label}</div>
                              {metodo.disabled && (
                                <div className="text-xs text-gray-500 font-medium">Próximamente</div>
                              )}
                            </div>
                          </div>
                          {metodoPago === metodo.value && (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaso(3)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-black text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 3: Confirmación */}
              {paso === 3 && (
                <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                      Confirmar Pedido
                    </h2>
                    <p className="text-gray-600 font-medium">
                      Revisa que todo esté correcto antes de confirmar
                    </p>
                  </div>

                  {/* Resumen de Información */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-black text-gray-900 mb-4">Información de Contacto</h3>
                      <div className="space-y-2 text-gray-700 font-medium">
                        <p><strong>Nombre:</strong> {formData.nombre}</p>
                        <p><strong>Teléfono:</strong> {formData.telefono}</p>
                        {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-black text-gray-900 mb-4">Detalles de Entrega</h3>
                      <div className="space-y-2 text-gray-700 font-medium">
                        <p>
                          <strong>Método:</strong>{' '}
                          {metodoEntrega === 'pickup' ? 'Recoger en tienda' : 'Entrega a domicilio'}
                        </p>
                        {metodoEntrega === 'delivery' && (
                          <p><strong>Dirección:</strong> {formData.direccion}</p>
                        )}
                        <p>
                          <strong>Pago:</strong>{' '}
                          {metodoPago === 'contra_entrega' ? 'Contra entrega' :
                           metodoPago === 'efectivo' ? 'Efectivo' :
                           metodoPago === 'transferencia' ? 'Transferencia' : 'Tarjeta'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas Adicionales */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      Notas o Instrucciones (opcional)
                    </label>
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      placeholder="Ej: Tocar el timbre dos veces..."
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium resize-none"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setPaso(2)}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-black text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                    >
                      Confirmar Pedido
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Resumen del Pedido (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">
                Resumen del Pedido
              </h3>

              <div className="space-y-4 mb-6">
                {mockCarrito.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="text-3xl">{item.imagen}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">
                        {item.nombre}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {item.cantidad} x RD$ {item.precio.toLocaleString()}
                      </div>
                    </div>
                    <div className="font-black text-gray-900">
                      RD$ {(item.precio * item.cantidad).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Subtotal</span>
                  <span>RD$ {calcularSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Envío</span>
                  <span>{calcularEnvio() === 0 ? 'Gratis' : `RD$ ${calcularEnvio()}`}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-orange-600 pt-3 border-t-2 border-gray-200">
                  <span>Total</span>
                  <span>RD$ {calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-black text-gray-900 mb-1">
                      Tiempo estimado
                    </div>
                    <div className="text-gray-600 font-medium">
                      {metodoEntrega === 'pickup'
                        ? '30-45 minutos para recoger'
                        : '1-2 horas para entrega'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
