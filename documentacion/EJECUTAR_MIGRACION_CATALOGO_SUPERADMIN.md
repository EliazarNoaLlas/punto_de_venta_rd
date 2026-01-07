# Ejecutar Migración - Catálogo Superadministrador

## ⚠️ IMPORTANTE
**Las tablas del catálogo del superadministrador no existen aún.** Necesitas ejecutar la migración SQL antes de usar esta funcionalidad.

## 📋 Pasos para Ejecutar la Migración

### Opción 1: Desde MySQL Command Line

```bash
mysql -u root -p punto_venta_rd < _DB/migracion_catalogo_superadmin.sql
```

### Opción 2: Desde MySQL Workbench

1. Abre MySQL Workbench
2. Conecta a tu base de datos `punto_venta_rd`
3. Abre el archivo `_DB/migracion_catalogo_superadmin.sql`
4. Ejecuta todo el script (Query > Execute All)

### Opción 3: Desde phpMyAdmin

1. Abre phpMyAdmin
2. Selecciona la base de datos `punto_venta_rd`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido completo de `_DB/migracion_catalogo_superadmin.sql`
5. Haz clic en "Ejecutar"

### Opción 4: Desde PowerShell (si tienes MySQL en el PATH)

```powershell
Get-Content _DB/migracion_catalogo_superadmin.sql | mysql -u root -p punto_venta_rd
```

## ✅ Verificación

Después de ejecutar la migración, verifica que las tablas se crearon:

```sql
SHOW TABLES LIKE '%superadmin%';
```

Deberías ver:
- `catalogo_superadmin_config`
- `superadmin_productos_catalogo`
- `pedidos_superadmin`
- `pedidos_superadmin_items`

## 🔧 Configuración Inicial

Después de ejecutar la migración, la configuración inicial se creará automáticamente:
- **URL Slug:** `tienda`
- **Estado:** Inactivo (debes activarlo desde el panel de administración)

## 📝 Notas

- La migración es segura (usa `CREATE TABLE IF NOT EXISTS`)
- Puedes ejecutarla múltiples veces sin problemas
- Si necesitas ayuda, revisa los logs de error en la consola del servidor

