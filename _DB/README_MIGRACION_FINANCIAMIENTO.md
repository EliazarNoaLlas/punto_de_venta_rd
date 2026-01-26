# 📋 Guía de Migración: Sistema de Financiamiento

**Fecha:** 2025-01-25  
**Versión:** 1.0

---

## 📑 Archivos de Migración

### 1. `migracion_financiamiento.sql`
Script principal de migración que:
- ✅ Crea 8 nuevas tablas de financiamiento
- ✅ Modifica 4 tablas existentes (productos, clientes, credito_clientes, ventas)
- ✅ Agrega índices y foreign keys
- ✅ Inserta planes de ejemplo
- ✅ Verifica la creación de tablas

### 2. `rollback_financiamiento.sql`
Script de rollback que revierte todos los cambios (usar con precaución).

---

## 🚀 Instrucciones de Ejecución

### Paso 1: Backup de Base de Datos

**⚠️ IMPORTANTE:** Antes de ejecutar la migración, crear un backup completo:

```bash
# Ejemplo con mysqldump
mysqldump -u usuario -p nombre_base_datos > backup_antes_financiamiento.sql
```

### Paso 2: Ejecutar Migración

**Opción A: Desde MySQL CLI**
```bash
mysql -u usuario -p nombre_base_datos < _DB/migracion_financiamiento.sql
```

**Opción B: Desde MySQL Workbench / phpMyAdmin**
1. Abrir el archivo `migracion_financiamiento.sql`
2. Ejecutar el script completo
3. Verificar que no hay errores

**Opción C: Desde Node.js (si tienes script de migración)**
```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');

async function ejecutarMigracion() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'usuario',
    password: 'password',
    database: 'nombre_base_datos',
    multipleStatements: true
  });

  const sql = fs.readFileSync('_DB/migracion_financiamiento.sql', 'utf8');
  await connection.query(sql);
  await connection.end();
  
  console.log('Migración completada exitosamente');
}
```

### Paso 3: Verificar Migración

Después de ejecutar, verificar que todas las tablas se crearon:

```sql
-- Verificar tablas creadas
SHOW TABLES LIKE '%financiamiento%';
SHOW TABLES LIKE '%activos%';
SHOW TABLES LIKE '%notificaciones%';

-- Verificar estructura de una tabla
DESCRIBE planes_financiamiento;

-- Verificar planes de ejemplo
SELECT * FROM planes_financiamiento;
```

---

## 📊 Tablas Creadas

### Tablas Principales

1. **`planes_financiamiento`** - Planes de financiamiento configurables
2. **`contratos_financiamiento`** - Contratos individuales por cliente
3. **`cuotas_financiamiento`** - Cuotas de cada contrato
4. **`pagos_financiamiento`** - Registro de pagos realizados
5. **`activos_productos`** - Unidades físicas rastreables
6. **`alertas_financiamiento`** - Sistema de alertas y cobranza
7. **`plantillas_notificaciones`** - Plantillas para notificaciones
8. **`historial_notificaciones`** - Historial de notificaciones enviadas

### Modificaciones a Tablas Existentes

1. **`productos`** - Agregados campos para activos rastreables y financiamiento
2. **`clientes`** - Agregados campos para scoring crediticio y contacto
3. **`credito_clientes`** - Agregados campos para contratos activos
4. **`ventas`** - Agregados campos para asociar con contratos

---

## ✅ Verificación Post-Migración

### Checklist de Verificación

- [ ] Todas las tablas se crearon sin errores
- [ ] Los planes de ejemplo se insertaron correctamente
- [ ] Los índices se crearon correctamente
- [ ] Las foreign keys funcionan correctamente
- [ ] Los campos nuevos en tablas existentes se agregaron
- [ ] No hay errores en el log de MySQL

### Queries de Verificación

```sql
-- 1. Verificar tablas creadas
SELECT COUNT(*) as total_tablas
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND (
    table_name LIKE '%financiamiento%' 
    OR table_name = 'activos_productos'
    OR table_name LIKE '%notificaciones%'
);

-- 2. Verificar planes de ejemplo
SELECT codigo, nombre, plazo_meses, tasa_interes_anual, activo
FROM planes_financiamiento;

-- 3. Verificar campos agregados a productos
SHOW COLUMNS FROM productos LIKE '%rastreable%';
SHOW COLUMNS FROM productos LIKE '%financiamiento%';

-- 4. Verificar campos agregados a clientes
SHOW COLUMNS FROM clientes LIKE '%crediticio%';
SHOW COLUMNS FROM clientes LIKE '%whatsapp%';

-- 5. Verificar foreign keys
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME LIKE '%financiamiento%';
```

---

## 🔄 Rollback (Si es Necesario)

**⚠️ ADVERTENCIA:** El rollback eliminará TODAS las tablas y datos de financiamiento.

```bash
mysql -u usuario -p nombre_base_datos < _DB/rollback_financiamiento.sql
```

**O desde MySQL CLI:**
```sql
SOURCE _DB/rollback_financiamiento.sql;
```

---

## 📝 Notas Importantes

### 1. Tasa de Interés Mensual

La tasa mensual se calcula usando la fórmula:
```
tasa_mensual = (1 + tasa_anual/100)^(1/12) - 1
```

Ejemplo: 18% anual = (1.18)^(1/12) - 1 = 0.013888 = 1.3888%

### 2. Campos Opcionales

Algunos campos son opcionales y pueden ser NULL:
- `caja_id` en `pagos_financiamiento` (solo si existe tabla `cajas`)
- `empresa_id` en `planes_financiamiento` (NULL = plan global)

### 3. Datos de Ejemplo

El script inserta 4 planes de ejemplo:
- Plan 6 Meses - 15%
- Plan 12 Meses - 18%
- Plan 18 Meses - 20%
- Plan 24 Meses - 22%

Puedes modificar o eliminar estos planes según tus necesidades.

### 4. Compatibilidad

El script es **idempotente** (se puede ejecutar múltiples veces):
- Usa `CREATE TABLE IF NOT EXISTS`
- Verifica existencia de columnas antes de agregarlas
- Usa `INSERT IGNORE` para datos iniciales

---

## 🐛 Solución de Problemas

### Error: "Table already exists"
**Solución:** El script usa `CREATE TABLE IF NOT EXISTS`, esto no debería ocurrir. Si ocurre, verificar que la tabla no tenga estructura diferente.

### Error: "Column already exists"
**Solución:** El script verifica existencia antes de agregar columnas. Si ocurre, puede ser que la columna exista con diferente tipo. Revisar manualmente.

### Error: "Foreign key constraint fails"
**Solución:** Verificar que las tablas referenciadas existan:
- `empresas`
- `clientes`
- `usuarios`
- `ventas`
- `productos`
- `cajas` (opcional)

### Error: "Unknown table 'cajas'"
**Solución:** El script maneja esto automáticamente. Si no existe `cajas`, la foreign key no se crea (es opcional).

---

## 📚 Referencias

- Documentación completa: `documentacion/Financiamiento/arquitectura.md`
- Metodología de refactorización: `documentacion/Financiamiento/METODOLOGIA_REFACTORIZACION.md`
- Análisis del código: `documentacion/Financiamiento/ANALISIS_CODIGO_FINANCIAMIENTO.md`

---

## ✅ Próximos Pasos

Después de ejecutar la migración:

1. ✅ Verificar que todas las tablas se crearon
2. ✅ Probar crear un plan de financiamiento desde la UI
3. ✅ Verificar que los campos nuevos aparecen en productos/clientes
4. ✅ Continuar con la implementación del código según la metodología

---

**Documento creado:** 2025-01-25  
**Versión:** 1.0

