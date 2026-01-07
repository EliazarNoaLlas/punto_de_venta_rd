# ⚡ Quick Start - CI/CD Setup

Guía rápida para activar CI/CD en 15 minutos.

---

## 🎯 Paso 1: Preparar VPS (5 min)

### 1.1 Crear usuario deploy

```bash
ssh root@72.62.128.63
adduser deploy
usermod -aG sudo deploy
exit
```

### 1.2 Configurar SSH (en tu máquina local)

```bash
# Generar clave SSH si no tienes
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copiar clave al VPS
ssh-copy-id deploy@72.62.128.63

# Probar conexión
ssh deploy@72.62.128.63
```

### 1.3 Crear usuario MySQL

```bash
mysql -u root -p
```

```sql
CREATE USER 'pos_deploy'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_FUERTE';
GRANT ALL PRIVILEGES ON punto_venta_rd.* TO 'pos_deploy'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🖥️ Paso 2: Configurar VPS (5 min)

### 2.1 Ejecutar script de setup

```bash
ssh deploy@72.62.128.63

# Subir setup-vps.sh al VPS (o clonarlo)
cd /tmp
# ... copiar setup-vps.sh aquí ...

chmod +x setup-vps.sh
bash setup-vps.sh
```

**O manualmente:**

```bash
# Crear estructura
sudo mkdir -p /var/www/punto_de_venta_2025/{repo,releases,shared}
sudo mkdir -p /var/www/punto_de_venta_2025/shared/{uploads,public/images/productos}
sudo chown -R deploy:deploy /var/www/punto_de_venta_2025

# Clonar repo
cd /var/www/punto_de_venta_2025
git clone https://github.com/TU_USUARIO/punto_de_venta_rd.git repo

# Crear .env
nano shared/.env
# Pegar contenido de tu .env actual, actualizando DB_USER=pos_deploy

# Instalar script
cp repo/deploy.sh ./
chmod +x deploy.sh

# Crear tabla migraciones
mysql -u pos_deploy -p punto_venta_rd < repo/_DB/migrations_table.sql
```

### 2.2 Migrar datos existentes

```bash
# Si tienes imágenes y uploads en producción actual
# Moverlos a shared (ajusta rutas según tu caso)
cp -r /ruta/actual/uploads/* /var/www/punto_de_venta_2025/shared/uploads/
cp -r /ruta/actual/public/images/productos/* /var/www/punto_de_venta_2025/shared/public/images/productos/
```

### 2.3 Probar deploy manual

```bash
cd /var/www/punto_de_venta_2025
bash deploy.sh
```

Si funciona, verás: `✅ Deploy completado exitosamente`

---

## 🔐 Paso 3: Configurar GitHub (3 min)

### 3.1 Subir código a GitHub

```bash
# En tu máquina local
git add .
git commit -m "Setup CI/CD"
git push origin main
```

### 3.2 Configurar secretos

1. Ve a: **GitHub repo → Settings → Secrets and variables → Actions**
2. Agregar secretos:

| Nombre | Valor |
|--------|-------|
| `VPS_SSH_KEY` | Contenido completo de `~/.ssh/id_rsa` (clave PRIVADA) |
| `VPS_HOST` | `72.62.128.63` |
| `VPS_SSH_KNOWN_HOSTS` | `72.62.128.63 ssh-rsa AAAAB3...` (opcional) |

**Obtener known_hosts:**
```bash
ssh-keyscan 72.62.128.63
```

---

## ✅ Paso 4: Probar (2 min)

### 4.1 Hacer un cambio de prueba

```bash
# En local
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "Test: CI/CD deployment"
git push origin main
```

### 4.2 Verificar en GitHub

1. Ve a **Actions** en tu repo
2. Deberías ver el workflow ejecutándose
3. Espera 2-5 minutos
4. Verifica que termine con ✅ verde

### 4.3 Verificar en VPS

```bash
ssh deploy@72.62.128.63
pm2 status
pm2 logs punto-venta-2025 --lines 20
```

---

## 🎉 ¡Listo!

Ahora cada `git push` a `main` despliega automáticamente.

---

## 🔧 Troubleshooting Rápido

### Error: "Permission denied"
```bash
# Verificar permisos
ls -la /var/www/punto_de_venta_2025
sudo chown -R deploy:deploy /var/www/punto_de_venta_2025
```

### Error: "SSH connection failed"
- Verificar que `VPS_SSH_KEY` está correcto (clave PRIVADA completa)
- Probar conexión manual: `ssh deploy@72.62.128.63`

### Error: "Build failed"
```bash
# Ver logs detallados
cd /var/www/punto_de_venta_2025/current
npm run build
```

### Error: "PM2 not found"
```bash
# Instalar PM2 globalmente
npm install -g pm2
```

---

## 📚 Documentación Completa

Para detalles completos, revisa: `METODOLOGIA_CICD_MEJORADA.md`

