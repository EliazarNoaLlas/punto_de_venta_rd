# Planificación e Implementación del Módulo de Cotizaciones

Este documento detalla los requerimientos funcionales, casos de uso y la especificación técnica para la implementación del módulo de **Cotizaciones** en el sistema Punto de Venta RD.

---

## 1. Visión General

El módulo de Cotizaciones permitirá a los usuarios (vendedores y administradores) generar presupuestos formales para clientes sin afectar el inventario ni la contabilidad inmediatamente. Estas cotizaciones podrán ser convertidas posteriormente en ventas reales con un solo clic.

**Objetivos Principales:**
- Permitir la creación de documentos de preventa.
- Gestionar el ciclo de vida de una cotización (Borrador, Enviada, Aceptada/Facturada, Rechazada, Vencida).
- Agilizar el proceso de venta al convertir cotizaciones aprobadas.

---

## 2. Requerimientos Funcionales (Formato IEEE 830)

### 2.1 Gestión de Cotizaciones
- **RF-001 Crear Cotización:** El sistema debe permitir crear una nueva cotización seleccionando un cliente existente o genérico y agregando productos del inventario.
- **RF-002 Calcular Totales:** El sistema debe calcular automáticamente subtotal, ITBIS (impuestos) y total general, respetando las configuraciones de precios del sistema.
- **RF-003 Vigencia:** El sistema debe permitir establecer una fecha de vencimiento para la cotización (por defecto 15 o 30 días).
- **RF-004 Estado de Cotización:** El sistema debe gestionar los siguientes estados: `Pendiente`, `Facturada` (Convertida a Venta), `Vencida`, `Cancelada`.
- **RF-005 Sin Reserva de Stock:** La creación de una cotización **NO** debe descontar inventario, pero puede mostrar advertencias si el stock actual es bajo.

### 2.2 Conversión y Acciones
- **RF-006 Convertir a Venta:** El sistema debe permitir transformar una cotización en estado `Pendiente` a una Venta real, transfiriendo todos los ítems y precios, y descontando el inventario en ese momento.
- **RF-007 Impresión/PDF:** El sistema debe generar un documento PDF de la cotización con el logo de la empresa, datos del cliente y desglose de productos, apto para impresión o envío digital.
- **RF-008 Envío por Correo (Opcional/Fase 2):** El sistema podrá enviar la cotización directamente al correo del cliente.

### 2.3 Listados y Consultas
- **RF-009 Historial:** El sistema debe mostrar un listado de todas las cotizaciones con filtros por fecha, cliente, estado y vendedor.
- **RF-010 Indicadores:** Visualización rápida de cotizaciones próximas a vencer.

---

## 3. Casos de Uso (Formato Detallado)

### CU-01: Crear Nueva Cotización
**Actor:** Vendedor / Administrador
**Precondición:** El usuario está autenticado y tiene permisos de venta.
**Flujo Principal:**
1. El usuario accede al módulo "Cotizaciones" y selecciona "Nueva Cotización".
2. El sistema muestra el formulario de cotización (similar al POS pero simplificado).
3. El usuario busca y selecciona un Cliente.
4. El usuario busca y agrega productos al detalle.
5. El sistema calcula los montos en tiempo real.
6. El usuario define una fecha de vencimiento (opcional) y notas.
7. El usuario guarda la cotización.
8. El sistema registra la cotización con estado `Pendiente` y muestra opción de Imprimir.

### CU-02: Convertir Cotización a Venta
**Actor:** Vendedor / Administrador
**Precondición:** Existe una cotización en estado `Pendiente`.
**Flujo Principal:**
1. El usuario busca la cotización en el listado.
2. Selecciona la opción "Facturar" o "Convertir a Venta".
3. El sistema carga los datos de la cotización en la pantalla de Ventas/POS.
4. El sistema valida el stock actual de los productos (alerta si no hay suficiente).
5. El usuario confirma el método de pago y procesa la venta.
6. El sistema crea la Venta, descuenta inventario y actualiza el estado de la cotización original a `Facturada`.

---

## 4. Especificación Técnica y Base de Datos

Para implementar este módulo sin alterar la integridad de las ventas actuales, se crearán tablas espejo a `ventas` y `detalle_ventas`.

### 4.1 Nuevas Tablas en Base de Datos

#### Tabla: `cotizaciones`
Almacena la cabecera del documento.
```sql
CREATE TABLE cotizaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    numero_cotizacion VARCHAR(20) NOT NULL, -- Secuencial único por empresa (ej. COT-0001)
    cliente_id INT,
    usuario_id INT NOT NULL, -- Vendedor que la creó
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0.00,
    itbis DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'facturada', 'vencida', 'cancelada') DEFAULT 'pendiente',
    venta_generada_id INT NULL, -- ID de la venta si fue convertida
    notas TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (venta_generada_id) REFERENCES ventas(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

#### Tabla: `detalle_cotizaciones`
Almacena los productos de la cotización.
```sql
CREATE TABLE detalle_cotizaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cotizacion_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    itbis DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### 4.2 Lógica de Backend (Server Actions)

Se requerirán las siguientes acciones en `_Pages/cotizaciones/servidor.js` (o ruta similar):

1.  `crearCotizacion(datos)`: Inserta en `cotizaciones` y `detalle_cotizaciones`. Genera el número secuencial.
2.  `obtenerCotizaciones(filtros)`: Consulta con paginación y filtros.
3.  `obtenerCotizacionPorId(id)`: Para ver detalle o cargar en edición.
4.  `anularCotizacion(id)`: Cambia estado a `cancelada`.
5.  `convertirAVenta(cotizacionId)`: Lógica compleja que:
    *   Verifica stock.
    *   Llama a la lógica existente de crear Venta.
    *   Actualiza `cotizaciones.estado = 'facturada'`.

---

## 5. Plan de Implementación

1.  **Base de Datos**: Ejecutar scripts SQL para crear las tablas.
2.  **Backend**: Crear Server Actions para CRUD de cotizaciones.
3.  **Frontend (Listado)**: Crear página `/admin/cotizaciones` con tabla de gestión.
4.  **Frontend (Creación/Edición)**: Crear formulario (reutilizando componentes del POS si es posible, o una versión simplificada).
5.  **Conversión**: Implementar botón "Facturar" que redirija al POS con los datos precargados.
6.  **PDF**: Implementar generación de documento visual.
