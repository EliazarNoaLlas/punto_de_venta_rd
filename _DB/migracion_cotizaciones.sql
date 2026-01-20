-- Migración para Módulo de Cotizaciones

USE punto_venta_rd;

-- 1. Tabla de Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (venta_generada_id) REFERENCES ventas(id) ON DELETE SET NULL,
    INDEX idx_empresa (empresa_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_emision)
) ENGINE=InnoDB;

-- 2. Tabla de Detalle de Cotizaciones
CREATE TABLE IF NOT EXISTS detalle_cotizaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cotizacion_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    itbis DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_cotizacion (cotizacion_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB;

-- 3. Permisos para el módulo
INSERT INTO permisos (modulo, nombre, clave, descripcion) VALUES
('cotizaciones', 'Ver Cotizaciones', 'ver_cotizaciones', 'Permite visualizar el listado de cotizaciones'),
('cotizaciones', 'Crear Cotizaciones', 'crear_cotizaciones', 'Permite crear nuevas cotizaciones'),
('cotizaciones', 'Editar Cotizaciones', 'editar_cotizaciones', 'Permite editar cotizaciones existentes'),
('cotizaciones', 'Eliminar/Anular Cotizaciones', 'eliminar_cotizaciones', 'Permite anular cotizaciones');

-- 4. Asignar permisos a roles (Superadmin, Admin, Vendedor)
-- Obtener IDs de permisos recién creados y asignar (Lógica simplificada asumiendo IDs autoincrementales, 
-- en producción se haría con subqueries o scripts de aplicación)

-- Asignar todos a admin (ID 2 usualmente) y superadmin (ID 1)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE p.modulo = 'cotizaciones' AND r.nombre IN ('admin', 'superadmin', 'vendedor');
