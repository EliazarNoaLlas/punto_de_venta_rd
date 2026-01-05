# 💾 Guía: Restaurar Backup de Base de Datos en VPS

## 🎯 Objetivo
Restaurar el backup `base_datos.sql` en el VPS **sin perder los datos actuales**.

---

## ⚠️ IMPORTANTE: Hacer Backup ANTES de Restaurar

**SIEMPRE haz un backup de la base de datos actual antes de restaurar un nuevo backup.**

---

## 📋 Información del VPS

- **IP:** `72.62.128.63`
- **Usuario:** `root`
- **Base de Datos:** `punto_venta_rd` (según el dump)
- **Archivo Backup:** `base_datos.sql`

---

## 🛠️ Paso 1: Hacer Backup de la Base de Datos Actual (OBLIGATORIO)

### Desde tu Computadora (PowerShell)

```powershell
# Conectarse al VPS y hacer backup de la BD actual
ssh root@72.62.128.63 "mysqldump -u root -p punto_venta_rd > /tmp/punto_venta_rd_backup_$(date +%Y%m%d_%H%M%S).sql"
```

**O hacerlo manualmente desde SSH:**

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Hacer backup de la BD actual
mysqldump -u root -p punto_venta_rd > /tmp/punto_venta_rd_backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar que se creó
ls -lh /tmp/punto_venta_rd_backup_*.sql
```

**Nota:** Te pedirá la contraseña de MySQL. Si no la sabes, verifica las credenciales.

---

## 📤 Paso 2: Subir el Archivo `base_datos.sql` al VPS

### Desde tu Computadora (PowerShell)

```powershell
# Navegar a la raíz del proyecto
cd C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd

# Subir el archivo base_datos.sql al VPS (en /tmp por seguridad)
scp base_datos.sql root@72.62.128.63:/tmp/
```

**Verificar que se subió:**

```bash
# En el VPS
ssh root@72.62.128.63
ls -lh /tmp/base_datos.sql
```

---

## 🔄 Paso 3: Restaurar el Backup (CUIDADO: Esto BORRA datos existentes)

### Opción A: Restaurar Completo (BORRA todo lo actual)

⚠️ **ADVERTENCIA:** Este comando **BORRARÁ todos los datos actuales** y los reemplazará con el backup.

```bash
# En el VPS (SSH)
ssh root@72.62.128.63

# Restaurar el backup
mysql -u root -p punto_venta_rd < /tmp/base_datos.sql
```

**Nota:** Si necesitas crear la base de datos primero:

```bash
# Crear la base de datos (si no existe)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS punto_venta_rd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restaurar el backup
mysql -u root -p punto_venta_rd < /tmp/base_datos.sql
```

---

## 🔀 Opción B: Restaurar Solo Tablas Específicas (MÁS SEGURO)

Si solo quieres restaurar ciertas tablas sin perder datos de otras:

### Paso 1: Ver qué tablas tiene el backup

```bash
# En el VPS
grep "CREATE TABLE" /tmp/base_datos.sql | grep -o "`[^`]*`"
```

### Paso 2: Hacer backup de tablas específicas antes de restaurar

```bash
# Ejemplo: Hacer backup de la tabla 'productos' antes de restaurar
mysqldump -u root -p punto_venta_rd productos > /tmp/backup_productos_antes_restaurar.sql
```

### Paso 3: Restaurar solo tablas específicas

**NO RECOMENDADO** - El archivo SQL tiene `DROP TABLE IF EXISTS`, así que restaurar borrará los datos actuales.

---

## 🔄 Opción C: Comparar y Hacer Merge Manual (MÁS SEGURO pero MANUAL)

Si quieres **combinar datos** sin perder nada:

1. **Hacer backup completo** (Paso 1)
2. **Restaurar el backup** en una base de datos temporal
3. **Comparar datos**
4. **Hacer merge manual** usando queries SQL

```bash
# Crear base de datos temporal
mysql -u root -p -e "CREATE DATABASE punto_venta_rd_temp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restaurar backup en BD temporal
mysql -u root -p punto_venta_rd_temp < /tmp/base_datos.sql

# Comparar datos (ejemplo con tabla productos)
mysql -u root -p -e "SELECT COUNT(*) FROM punto_venta_rd.productos;"
mysql -u root -p -e "SELECT COUNT(*) FROM punto_venta_rd_temp.productos;"

# Luego hacer merge manual según necesidad
```

---

## ✅ Paso 4: Verificar que la Restauración Funcionó

```bash
# Conectarse a MySQL
mysql -u root -p punto_venta_rd

# Ver tablas
SHOW TABLES;

# Verificar datos en alguna tabla (ejemplo: productos)
SELECT COUNT(*) FROM productos;

# Verificar datos en usuarios
SELECT COUNT(*) FROM usuarios;

# Salir
EXIT;
```

---

## 🔄 Paso 5: Reiniciar la Aplicación (si es necesario)

Después de restaurar la BD, puede ser necesario reiniciar la aplicación:

```bash
# Reiniciar PM2
pm2 restart punto-venta-2025

# Ver logs
pm2 logs punto-venta-2025 --lines 20
```

---

## 📋 Comandos Completos (Copiar y Pegar)

### Desde PowerShell (Todo en Uno)

```powershell
# 1. Hacer backup de BD actual
Write-Host "Haciendo backup de BD actual..." -ForegroundColor Yellow
ssh root@72.62.128.63 "mysqldump -u root -p punto_venta_rd > /tmp/punto_venta_rd_backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. Subir archivo base_datos.sql
Write-Host "Subiendo base_datos.sql al VPS..." -ForegroundColor Yellow
cd C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd
scp base_datos.sql root@72.62.128.63:/tmp/

# 3. Conectarse al VPS para restaurar
Write-Host "Conectandose al VPS para restaurar..." -ForegroundColor Yellow
Write-Host "Ejecuta manualmente: mysql -u root -p punto_venta_rd < /tmp/base_datos.sql" -ForegroundColor Cyan
ssh root@72.62.128.63
```

### En el VPS (SSH) - Pasos Manuales

```bash
# 1. Hacer backup de BD actual
mysqldump -u root -p punto_venta_rd > /tmp/punto_venta_rd_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Verificar que el archivo base_datos.sql está en /tmp
ls -lh /tmp/base_datos.sql

# 3. Restaurar el backup
mysql -u root -p punto_venta_rd < /tmp/base_datos.sql

# 4. Verificar que funcionó
mysql -u root -p punto_venta_rd -e "SHOW TABLES;"

# 5. Reiniciar aplicación (opcional)
pm2 restart punto-venta-2025
```

---

## 🚨 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

**Solución:** Verifica las credenciales de MySQL o usa otro usuario:

```bash
# Ver si MySQL tiene usuario configurado diferente
mysql -u root -p
# O intenta sin contraseña (según configuración)
mysql -u root
```

### Error: "Unknown database 'punto_venta_rd'"

**Solución:** Crear la base de datos primero:

```bash
mysql -u root -p -e "CREATE DATABASE punto_venta_rd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p punto_venta_rd < /tmp/base_datos.sql
```

### Error: "No such file or directory"

**Solución:** Verificar que el archivo se subió correctamente:

```bash
# Verificar que existe
ls -lh /tmp/base_datos.sql

# Si no existe, subirlo de nuevo
# Desde PowerShell:
scp base_datos.sql root@72.62.128.63:/tmp/
```

### Error: "File too large" o timeout

**Solución:** Usar compresión:

```bash
# Comprimir antes de subir (desde PowerShell)
# Usar gzip en el VPS
gzip /tmp/base_datos.sql

# Restaurar desde archivo comprimido
gunzip < /tmp/base_datos.sql.gz | mysql -u root -p punto_venta_rd
```

---

## 📊 Verificación Post-Restauración

### Checklist de Verificación

```bash
# En el VPS (SSH)
mysql -u root -p punto_venta_rd

# Verificar tablas principales
SELECT COUNT(*) as total_empresas FROM empresas;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_productos FROM productos;
SELECT COUNT(*) as total_ventas FROM ventas;

# Verificar datos de ejemplo
SELECT id, nombre_empresa FROM empresas LIMIT 5;
SELECT id, nombre, email FROM usuarios LIMIT 5;

# Salir
EXIT;
```

---

## 🔐 Mejores Prácticas

1. ✅ **SIEMPRE hacer backup antes de restaurar**
2. ✅ **Verificar el tamaño del archivo antes de subir**
3. ✅ **Probar en base de datos temporal primero** (si es posible)
4. ✅ **Verificar que la aplicación funciona después de restaurar**
5. ✅ **Mantener múltiples backups con fecha**

---

## 📝 Notas Importantes

- ⚠️ **Restaurar el backup BORRARÁ todos los datos actuales**
- ⚠️ **El archivo SQL contiene `DROP TABLE IF EXISTS`**, así que las tablas serán recreadas
- ✅ **Hacer backup antes es OBLIGATORIO** para poder revertir si algo sale mal
- ✅ **El backup incluye estructura Y datos**

---

## 🔄 Comandos Rápidos de Referencia

### Backup de BD Actual
```bash
mysqldump -u root -p punto_venta_rd > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Subir Backup al VPS
```powershell
scp base_datos.sql root@72.62.128.63:/tmp/
```

### Restaurar Backup
```bash
mysql -u root -p punto_venta_rd < /tmp/base_datos.sql
```

### Verificar Tablas
```bash
mysql -u root -p punto_venta_rd -e "SHOW TABLES;"
```

---

**Última actualización:** Guía para restaurar backup de BD en VPS  
**IP VPS:** `72.62.128.63`  
**Base de Datos:** `punto_venta_rd`

