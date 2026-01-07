# 🚀 Metodología CI/CD Mejorada - Punto de Venta RD

## 📋 Resumen Ejecutivo

Esta metodología evoluciona tu proceso de deploy manual a un **CI/CD automatizado con GitHub Actions**, manteniendo **100% de compatibilidad** con tu estado actual y sin romper producción.

### ✅ Lo que NO cambia (se mantiene igual)
- ✅ Estructura de Next.js (App Router + _Pages)
- ✅ Imágenes y uploads (siguen en shared/)
- ✅ Base de datos MySQL
- ✅ PM2 como proceso manager
- ✅ Variables de entorno (.env)

### 🆕 Lo que SÍ mejora
- 🆕 Deploy automático con `git push`
- 🆕 Sistema de releases (rollback fácil)
- 🆕 Migraciones versionadas (no se repiten)
- 🆕 Usuario dedicado para deploy (no más root)
- 🆕 Validaciones automáticas

---

## 🏗️ Arquitectura del Sistema

```
GitHub (repo)
   ↓ git push main
GitHub Actions
   ↓ SSH
VPS (72.62.128.63)
   ↓
/var/www/punto_de_venta_2025
   ├── repo/              # Clon del repositorio Git
   ├── releases/          # Historial de releases
   │   ├── 20260105_1200/
   │   ├── 20260105_1400/
   │   └── 20260105_1600/
   ├── shared/            # Datos persistentes
   │   ├── .env
   │   ├── uploads/
   │   └── public/images/productos/
   └── current -> releases/20260105_1600  # Symlink al release activo
```

---

## 🔐 FASE 0 – Seguridad (OBLIGATORIA - Primera vez)

### ⚠️ CRÍTICO: Cambiar contraseña root

Si has expuesto la contraseña root, cámbiala **INMEDIATAMENTE**:

```bash
ssh root@72.62.128.63
passwd root
```

### Crear usuario deploy dedicado

```bash
# En el VPS
adduser deploy
usermod -aG sudo deploy

# Configurar SSH sin contraseña (opcional pero recomendado)
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
# Copiar tu clave pública SSH aquí
chown -R deploy:deploy /home/deploy/.ssh
```

### Crear usuario MySQL dedicado

```sql
-- Conectarse a MySQL como root
mysql -u root -p

-- Crear usuario dedicado para deploy
CREATE USER 'pos_deploy'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_FUERTE_AQUI';
GRANT ALL PRIVILEGES ON punto_venta_rd.* TO 'pos_deploy'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Actualizar `.env` en shared:**
```env
DB_USER=pos_deploy
DB_PASSWORD=TU_CONTRASEÑA_FUERTE_AQUI
DB_NAME=punto_venta_rd
DB_HOST=localhost
DB_PORT=3306
```

---

## 📦 FASE 1 – Preparar Repositorio (LOCAL)

### 1.1 Verificar .gitignore

El `.gitignore` ya está actualizado para proteger:
- ✅ `.env*` (variables de entorno)
- ✅ `uploads/` (archivos subidos)
- ✅ `public/images/productos/` (imágenes vivas)
- ✅ `node_modules/` y `.next/` (build artifacts)

### 1.2 Inicializar Git (si no está inicializado)

```bash
git init
git add .
git commit -m "Initial commit - CI/CD setup"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/punto_de_venta_rd.git
git push -u origin main
```

---

## 🖥️ FASE 2 – Configurar VPS (Primera vez)

### 2.1 Estructura de directorios

```bash
# Conectarse al VPS
ssh deploy@72.62.128.63

# Crear estructura de directorios
sudo mkdir -p /var/www/punto_de_venta_2025/{repo,releases,shared}
sudo mkdir -p /var/www/punto_de_venta_2025/shared/{uploads,public/images/productos}

# Dar permisos al usuario deploy
sudo chown -R deploy:deploy /var/www/punto_de_venta_2025
```

### 2.2 Clonar repositorio

```bash
cd /var/www/punto_de_venta_2025
git clone https://github.com/TU_USUARIO/punto_de_venta_rd.git repo
```

### 2.3 Configurar shared/.env

```bash
# Copiar .env actual a shared
cp /ruta/actual/de/.env /var/www/punto_de_venta_2025/shared/.env

# O crear uno nuevo con las variables correctas
nano /var/www/punto_de_venta_2025/shared/.env
```

**Contenido mínimo de `.env`:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=pos_deploy
DB_PASSWORD=TU_CONTRASEÑA
DB_NAME=punto_venta_rd

NEXT_PUBLIC_APP_URL=http://72.62.128.63:3000
VPS_UPLOAD_URL=http://72.62.128.63/uploads
VPS_IMAGE_BASE_URL=http://72.62.128.63
```

### 2.4 Migrar imágenes y uploads existentes

```bash
# Si ya tienes imágenes y uploads en producción
# Moverlos a shared (ajusta las rutas según tu caso)

# Ejemplo:
cp -r /ruta/actual/uploads/* /var/www/punto_de_venta_2025/shared/uploads/
cp -r /ruta/actual/public/images/productos/* /var/www/punto_de_venta_2025/shared/public/images/productos/
```

### 2.5 Crear tabla de migraciones

```bash
cd /var/www/punto_de_venta_2025/repo
mysql -u pos_deploy -p punto_venta_rd < _DB/migrations_table.sql
```

### 2.6 Instalar script de deploy

```bash
# Copiar script de deploy
cp deploy.sh /var/www/punto_de_venta_2025/deploy.sh
chmod +x /var/www/punto_de_venta_2025/deploy.sh

# Hacer ejecutable
chmod +x deploy.sh
```

### 2.7 Probar deploy manualmente (primera vez)

```bash
cd /var/www/punto_de_venta_2025
bash deploy.sh
```

Si todo funciona, verás:
```
✅ Deploy completado exitosamente
📊 Release activo: /var/www/punto_de_venta_2025/releases/20260105_1200
```

---

## 🤖 FASE 3 – Configurar GitHub Actions

### 3.1 Crear secretos en GitHub

Ve a tu repositorio en GitHub:
1. **Settings** → **Secrets and variables** → **Actions**
2. Agregar los siguientes secretos:

| Secreto | Descripción | Ejemplo |
|---------|-------------|---------|
| `VPS_SSH_KEY` | Clave privada SSH del usuario deploy | Contenido de `~/.ssh/id_rsa` |
| `VPS_HOST` | IP o hostname del VPS | `72.62.128.63` |
| `VPS_SSH_KNOWN_HOSTS` | Fingerprint del servidor (opcional) | `72.62.128.63 ssh-rsa AAAAB3...` |

**Generar clave SSH (si no tienes):**
```bash
# En tu máquina local
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"
# Copiar la clave PRIVADA completa a VPS_SSH_KEY
cat ~/.ssh/id_rsa

# Copiar la clave PÚBLICA al VPS
ssh-copy-id deploy@72.62.128.63
```

### 3.2 Verificar workflow

El archivo `.github/workflows/deploy.yml` ya está creado. Solo verifica que:
- ✅ El branch es `main` o `master` (según tu repo)
- ✅ El nombre de la app en PM2 es correcto: `punto-venta-2025`

---

## 🔄 FASE 4 – Flujo de Trabajo Diario

### Flujo normal (después de setup)

1. **Desarrollar localmente**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # ... hacer cambios ...
   ```

2. **Commit y push**
   ```bash
   git add .
   git commit -m "Agregar nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

3. **Merge a main** (desde GitHub o localmente)
   ```bash
   git checkout main
   git merge feature/nueva-funcionalidad
   git push origin main
   ```

4. **GitHub Actions se dispara automáticamente**
   - ✅ Hace checkout del código
   - ✅ Se conecta al VPS vía SSH
   - ✅ Ejecuta `deploy.sh`
   - ✅ El script hace `git pull`, build, migraciones, PM2 reload

5. **Verificar deploy**
   - Ve a **Actions** en GitHub para ver el log
   - O verifica en el VPS: `pm2 logs punto-venta-2025`

---

## 🗄️ Sistema de Migraciones Versionadas

### Cómo funciona

1. **Todas las migraciones SQL** van en `_DB/*.sql`
2. **El script de deploy** verifica la tabla `migrations`
3. **Solo ejecuta migraciones nuevas** (no repetidas)
4. **Registra cada migración** ejecutada

### Agregar nueva migración

1. Crear archivo SQL en `_DB/`:
   ```sql
   -- _DB/mi_nueva_migracion.sql
   ALTER TABLE productos ADD COLUMN nuevo_campo VARCHAR(255);
   ```

2. Commit y push:
   ```bash
   git add _DB/mi_nueva_migracion.sql
   git commit -m "Agregar campo nuevo_campo a productos"
   git push origin main
   ```

3. **En el próximo deploy**, la migración se ejecutará automáticamente **UNA SOLA VEZ**.

### Ver migraciones ejecutadas

```sql
SELECT * FROM migrations ORDER BY executed_at DESC;
```

---

## 🔄 Rollback (Si algo sale mal)

### Opción 1: Rollback rápido (symlink)

```bash
# En el VPS
cd /var/www/punto_de_venta_2025

# Ver releases disponibles
ls -la releases/

# Cambiar symlink a release anterior
ln -sfn releases/20260105_1400 current

# Reiniciar PM2
pm2 reload punto-venta-2025
```

### Opción 2: Revertir commit en Git

```bash
# En local
git revert HEAD
git push origin main
# Esto disparará un nuevo deploy con el código anterior
```

---

## 🧪 Testing del Sistema

### Probar deploy manualmente (sin GitHub Actions)

```bash
# En el VPS
cd /var/www/punto_de_venta_2025
bash deploy.sh
```

### Verificar estructura

```bash
# Ver releases
ls -la /var/www/punto_de_venta_2025/releases/

# Ver symlink
ls -la /var/www/punto_de_venta_2025/current

# Verificar PM2
pm2 status
pm2 logs punto-venta-2025
```

---

## 📊 Monitoreo y Logs

### Logs de PM2

```bash
# Ver logs en tiempo real
pm2 logs punto-venta-2025

# Ver últimos 100 líneas
pm2 logs punto-venta-2025 --lines 100

# Ver métricas
pm2 monit
```

### Logs de deploy

Los logs del script `deploy.sh` se muestran en:
- **GitHub Actions** (si se ejecuta desde GitHub)
- **Terminal del VPS** (si se ejecuta manualmente)

---

## ⚠️ Troubleshooting

### Error: "Directorio repo no encontrado"
```bash
# Verificar que el repo está clonado
ls -la /var/www/punto_de_venta_2025/repo
# Si no existe, clonar:
cd /var/www/punto_de_venta_2025
git clone https://github.com/TU_USUARIO/punto_de_venta_rd.git repo
```

### Error: "Archivo .env no encontrado"
```bash
# Crear .env en shared
nano /var/www/punto_de_venta_2025/shared/.env
# Agregar todas las variables necesarias
```

### Error: "Build falló"
```bash
# Ver logs detallados
cd /var/www/punto_de_venta_2025/current
npm run build
# Revisar errores específicos
```

### Error: "Migración falló"
```bash
# Verificar que la tabla migrations existe
mysql -u pos_deploy -p punto_venta_rd -e "SHOW TABLES LIKE 'migrations';"

# Si no existe, crearla:
mysql -u pos_deploy -p punto_venta_rd < /var/www/punto_de_venta_2025/repo/_DB/migrations_table.sql
```

### Error: "PM2 no está corriendo"
```bash
# Verificar estado
pm2 status

# Si la app no existe, iniciarla manualmente:
cd /var/www/punto_de_venta_2025/current
pm2 start npm --name "punto-venta-2025" -- start
pm2 save
```

---

## 🎯 Ventajas de esta Metodología

| Aspecto | Antes (Manual) | Ahora (CI/CD) |
|---------|----------------|---------------|
| **Tiempo de deploy** | 15-30 min | 2-5 min automático |
| **Riesgo de error** | Alto (humano) | Bajo (automatizado) |
| **Rollback** | Difícil | Instantáneo |
| **Migraciones** | Manual, repetibles | Automáticas, versionadas |
| **Historial** | Ninguno | Git + releases |
| **Seguridad** | Root en scripts | Usuario dedicado |
| **Escalabilidad** | Limitada | Alta |

---

## 📝 Checklist de Implementación

### Primera vez (Setup inicial)

- [ ] Cambiar contraseña root
- [ ] Crear usuario `deploy` en VPS
- [ ] Crear usuario `pos_deploy` en MySQL
- [ ] Crear estructura de directorios en VPS
- [ ] Clonar repositorio en VPS
- [ ] Configurar `shared/.env`
- [ ] Migrar imágenes y uploads a `shared/`
- [ ] Crear tabla `migrations`
- [ ] Instalar script `deploy.sh`
- [ ] Probar deploy manualmente
- [ ] Configurar secretos en GitHub
- [ ] Probar deploy desde GitHub Actions

### Uso diario

- [ ] Hacer cambios en código
- [ ] Commit y push a `main`
- [ ] Verificar que GitHub Actions se ejecuta
- [ ] Verificar logs de PM2
- [ ] Probar funcionalidad en producción

---

## 🚀 Próximas Mejoras (Opcional)

1. **Staging environment** - Deploy a ambiente de pruebas antes de producción
2. **Tests automatizados** - Ejecutar tests antes de deploy
3. **Notificaciones** - Slack/Email cuando hay un deploy
4. **Zero-downtime** - Blue-green deployment
5. **Docker** - Containerización (cuando quieras escalar)

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de GitHub Actions
2. Revisa los logs de PM2: `pm2 logs punto-venta-2025`
3. Verifica la estructura de directorios en el VPS
4. Revisa este documento de troubleshooting

---

**Última actualización:** 2025-01-05  
**Versión:** 1.0  
**Autor:** Sistema CI/CD Mejorado

