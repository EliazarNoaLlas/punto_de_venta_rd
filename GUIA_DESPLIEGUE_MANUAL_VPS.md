# 📦 Guía Detallada: Despliegue Manual de Archivos Modificados - VPS Hostinger

## 🎯 Objetivo
Esta guía te permitirá subir **solo los archivos modificados** del proyecto al VPS de Hostinger de forma manual y segura.

---

## 📋 Información del VPS

- **IP:** `72.62.128.63`
- **Usuario:** `root`
- **Contraseña:** `MEDICENELAMIGO082001a@`
- **Ruta del Proyecto:** `/var/www/punto_de_venta_2025`
- **Puerto SSH:** `22` (por defecto)

---

## 🔐 Paso 1: Verificar Conexión SSH

### En PowerShell (Windows)

```powershell
# Probar conexión SSH
ssh root@72.62.128.63

# Si es la primera vez, acepta el fingerprint escribiendo "yes"
# Ingresa la contraseña cuando se solicite: MEDICENELAMIGO082001a@
```

**Si la conexión es exitosa**, verás el prompt del servidor. Escribe `exit` para salir.

---

## 📁 Paso 2: Identificar Archivos Modificados

### Opción A: Usando Git (Recomendado)

```powershell
# Ver archivos modificados
git status

# Ver diferencias
git diff --name-only

# Ver archivos modificados con rutas completas
git ls-files -m
```

### Opción B: Comparar con Backup Local

Si tienes un backup del código en producción, compara manualmente los archivos.

### Archivos Modificados Recientemente (Ejemplo)

Basado en los cambios recientes, estos son los archivos que probablemente necesitas subir:

```
_Pages/superadmin/usuarios/servidor.js
_Pages/superadmin/usuarios/usuarios.js
_Pages/superadmin/usuarios/usuarios.module.css
_Pages/superadmin/empresas/servidor.js
_Pages/superadmin/empresas/empresas.js
```

---

## 📤 Paso 3: Subir Archivos Modificados (Métodos)

### Método 1: SCP - Subir Archivos Individuales (Recomendado)

#### Desde PowerShell (Windows)

```powershell
# Navegar a la raíz del proyecto
cd C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd

# Subir archivo específico (ejemplo: servidor.js de usuarios)
scp _Pages\superadmin\usuarios\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/usuarios/

# Subir múltiples archivos de una carpeta
scp _Pages\superadmin\usuarios\*.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/usuarios/

# Subir archivo CSS
scp _Pages\superadmin\usuarios\usuarios.module.css root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/usuarios/

# Subir archivos de empresas
scp _Pages\superadmin\empresas\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/empresas/
scp _Pages\superadmin\empresas\empresas.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/empresas/
```

**Nota:** Te pedirá la contraseña cada vez. Ingresa: `MEDICENELAMIGO082001a@`

---

### Método 2: SCP - Subir Carpeta Completa

```powershell
# Subir toda la carpeta usuarios (preserva estructura)
scp -r _Pages\superadmin\usuarios root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

# Subir toda la carpeta empresas
scp -r _Pages\superadmin\empresas root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/
```

---

### Método 3: Crear Script PowerShell para Subida Automatizada

Crea un archivo `subir_archivos_modificados.ps1`:

```powershell
# subir_archivos_modificados.ps1

$VPS_IP = "72.62.128.63"
$VPS_USER = "root"
$VPS_PATH = "/var/www/punto_de_venta_2025"
$PROJECT_ROOT = "C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd"

# Archivos a subir (agrega los que necesites)
$archivos = @(
    "_Pages\superadmin\usuarios\servidor.js",
    "_Pages\superadmin\usuarios\usuarios.js",
    "_Pages\superadmin\usuarios\usuarios.module.css",
    "_Pages\superadmin\empresas\servidor.js",
    "_Pages\superadmin\empresas\empresas.js"
)

Write-Host "🚀 Iniciando subida de archivos modificados..." -ForegroundColor Green

foreach ($archivo in $archivos) {
    $rutaCompleta = Join-Path $PROJECT_ROOT $archivo
    
    if (Test-Path $rutaCompleta) {
        # Extraer ruta relativa y directorio destino
        $directorioDestino = Split-Path $archivo -Parent
        $rutaDestino = "$VPS_PATH/$directorioDestino"
        
        Write-Host "📤 Subiendo: $archivo" -ForegroundColor Yellow
        
        # Crear directorio si no existe en el VPS
        ssh ${VPS_USER}@${VPS_IP} "mkdir -p $rutaDestino"
        
        # Subir archivo
        scp $rutaCompleta ${VPS_USER}@${VPS_IP}:$rutaDestino/
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $archivo subido exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al subir $archivo" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Archivo no encontrado: $archivo" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Proceso completado!" -ForegroundColor Green
```

**Ejecutar el script:**

```powershell
# Dar permisos de ejecución (si es necesario)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ejecutar script
.\subir_archivos_modificados.ps1
```

---

### Método 4: Usar WinSCP (Interfaz Gráfica)

1. **Descargar WinSCP:** https://winscp.net/
2. **Configurar conexión:**
   - **Protocolo:** SFTP
   - **Host:** `72.62.128.63`
   - **Usuario:** `root`
   - **Contraseña:** `MEDICENELAMIGO082001a@`
   - **Puerto:** `22`

3. **Conectar y arrastrar archivos:**
   - Navega a la carpeta local del proyecto
   - Navega a `/var/www/punto_de_venta_2025` en el VPS
   - Arrastra y suelta los archivos modificados
   - ⚠️ **IMPORTANTE:** NO arrastres la carpeta `public/images/productos` completa (usa symlink - ver sección "Configuración de Symlink")

---

## 🔗 Paso 3.5: Configuración de Symlink para Imágenes (Una Sola Vez)

### ⚠️ Problema: Subir `public` Completo Borra Imágenes Dinámicas

**NO hacer esto:**
```powershell
# ❌ Esto BORRA todas las imágenes dinámicas guardadas en producción
scp -r public root@72.62.128.63:/var/www/punto_de_venta_2025/
```

### ✅ Solución Profesional: Symlink a Carpeta Persistente

Las imágenes se guardan dinámicamente en producción. Para evitar borrarlas en cada deploy, usar un **symlink** a una carpeta persistente fuera del proyecto.

#### Configuración Inicial (Una Sola Vez en el VPS)

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# 1. Crear carpeta persistente para imágenes
mkdir -p /var/data/pdv_images/productos
chmod -R 755 /var/data/pdv_images
chown -R root:root /var/data/pdv_images

# 2. Eliminar carpeta actual (si existe)
cd /var/www/punto_de_venta_2025
rm -rf public/images/productos

# 3. Crear symlink
ln -s /var/data/pdv_images/productos public/images/productos

# 4. Verificar
ls -l public/images/
# Debe mostrar: productos -> /var/data/pdv_images/productos
```

**Arquitectura resultante:**
```
/var/www/punto_de_venta_2025/public/images/productos  ->  /var/data/pdv_images/productos  (SYMLINK)
```

**Ventajas:**
- ✅ Next.js sirve `/images/productos/...` normalmente
- ✅ El deploy NO toca las imágenes dinámicas
- ✅ Las imágenes persisten entre deploys
- ✅ No necesitas cambiar tu código

**Ver documentación completa:** `CONFIGURAR_SYMLINK_IMAGENES.md`

---

## 🔄 Paso 4: Verificar Archivos en el VPS

### Conectarse al VPS

```powershell
ssh root@72.62.128.63
```

### Verificar que los archivos se subieron correctamente

```bash
# Ir al proyecto
cd /var/www/punto_de_venta_2025

# Verificar archivos subidos
ls -la _Pages/superadmin/usuarios/
ls -la _Pages/superadmin/empresas/

# Verificar contenido de un archivo (opcional)
cat _Pages/superadmin/usuarios/servidor.js | head -20
```

---

## 🏗️ Paso 5: Reconstruir y Reiniciar la Aplicación

### En el VPS (SSH)

```bash
# 1. Ir al proyecto
cd /var/www/punto_de_venta_2025

# 2. Verificar que estás en la rama correcta (si usas Git)
git status

# 3. Instalar dependencias (si agregaste nuevas)
npm install

# 4. Hacer build de la aplicación
npm run build

# 5. Verificar que el build fue exitoso
# Deberías ver: "✓ Compiled successfully"

# 6. Reiniciar la aplicación con PM2
pm2 restart punto-venta-2025

# 7. Verificar que está corriendo
pm2 status

# 8. Ver logs para verificar que no hay errores
pm2 logs punto-venta-2025 --lines 50
```

---

## 🔍 Paso 6: Verificar que Todo Funciona

### Verificar Estado de la Aplicación

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs punto-venta-2025

# Verificar que el puerto 3000 está escuchando
netstat -tulpn | grep 3000

# Probar localmente en el VPS
curl http://localhost:3000
```

### Verificar desde el Navegador

1. Abre tu navegador
2. Ve a: `https://tu-dominio.com` (o la IP del VPS)
3. Verifica que la aplicación carga correctamente
4. Prueba las funcionalidades modificadas:
   - Eliminación de usuarios (con confirmación)
   - Eliminación de empresas (con confirmación)

---

## 📝 Checklist de Despliegue Manual

Usa esta lista para asegurarte de que todo está correcto:

- [ ] **Paso 1:** Conexión SSH verificada
- [ ] **Paso 2:** Archivos modificados identificados
- [ ] **Paso 3:** Archivos subidos al VPS
- [ ] **Paso 4:** Archivos verificados en el VPS
- [ ] **Paso 5:** `npm install` ejecutado (si hubo nuevas dependencias)
- [ ] **Paso 5:** `npm run build` ejecutado exitosamente
- [ ] **Paso 5:** PM2 reiniciado
- [ ] **Paso 6:** Aplicación accesible desde el navegador
- [ ] **Paso 6:** Funcionalidades nuevas probadas
- [ ] **Paso 6:** Logs sin errores críticos

---

## 🚨 Solución de Problemas

### Error: "Permission denied" al subir archivos

```bash
# En el VPS, verificar permisos
cd /var/www/punto_de_venta_2025
ls -la

# Si es necesario, cambiar permisos
chown -R root:root /var/www/punto_de_venta_2025
chmod -R 755 /var/www/punto_de_venta_2025
```

### Error: "No such file or directory"

```bash
# Crear directorios faltantes
mkdir -p /var/www/punto_de_venta_2025/_Pages/superadmin/usuarios
mkdir -p /var/www/punto_de_venta_2025/_Pages/superadmin/empresas
```

### Error en el Build

```bash
# Limpiar y reconstruir
cd /var/www/punto_de_venta_2025
rm -rf .next
npm run build
```

### La aplicación no inicia después del build

```bash
# Ver logs detallados
pm2 logs punto-venta-2025 --err

# Reiniciar PM2 completamente
pm2 delete punto-venta-2025
pm2 start npm --name "punto-venta-2025" -- start
pm2 save
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
cd /var/www/punto_de_venta_2025
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart punto-venta-2025
```

---

## 🔄 Proceso Rápido de Actualización (Resumen)

### Desde PowerShell

```powershell
# 1. Subir archivos modificados
scp _Pages\superadmin\usuarios\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/usuarios/
scp _Pages\superadmin\usuarios\usuarios.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/usuarios/
scp _Pages\superadmin\empresas\servidor.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/empresas/
scp _Pages\superadmin\empresas\empresas.js root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/empresas/
```

### En el VPS (SSH)

```bash
ssh root@72.62.128.63
cd /var/www/punto_de_venta_2025
npm run build
pm2 restart punto-venta-2025
pm2 logs punto-venta-2025 --lines 20
```

---

## 📊 Comandos PM2 Útiles

```bash
pm2 status                    # Ver estado de procesos
pm2 logs punto-venta-2025          # Ver logs completos
pm2 logs punto-venta-2025 --lines 50  # Últimas 50 líneas
pm2 restart punto-venta-2025       # Reiniciar aplicación
pm2 stop punto-venta-2025          # Detener aplicación
pm2 delete punto-venta-2025         # Eliminar proceso
pm2 monit                     # Monitor en tiempo real
pm2 save                      # Guardar configuración actual
pm2 startup                   # Configurar inicio automático
```

---

## 🔐 Seguridad: Usar Clave SSH (Opcional pero Recomendado)

Para evitar escribir la contraseña cada vez:

### Generar Clave SSH (en tu computadora)

```powershell
# Generar clave SSH
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"

# Presiona Enter para usar la ubicación por defecto
# Ingresa una frase de contraseña (opcional)
```

### Copiar Clave al VPS

```powershell
# Copiar clave pública al VPS
ssh-copy-id root@72.62.128.63

# Si ssh-copy-id no está disponible, usar:
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@72.62.128.63 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Probar Conexión sin Contraseña

```powershell
# Ahora deberías poder conectarte sin contraseña
ssh root@72.62.128.63
```

---

## 📚 Archivos de Referencia

- **Guía Completa de Despliegue:** `GUIA_DESPLIEGUE_PRODUCCION.md`
- **Script PowerShell (Recomendado):** `SUBIR_CARPETAS_MODIFICADAS.ps1` (sube carpetas sin borrar imágenes)
- **Configuración Symlink:** `CONFIGURAR_SYMLINK_IMAGENES.md` (solución profesional para imágenes)
- **Solución Problema Imágenes:** `SOLUCION_PROBLEMA_IMAGENES.md` (troubleshooting de imágenes)
- **Script Bash de Despliegue:** `deploy.sh` (si existe en el proyecto)

---

## 🎯 Resumen de Comandos Esenciales

### Subir Archivos (PowerShell)

```powershell
# Subir carpeta específica
scp -r _Pages\superadmin\usuarios root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

# ❌ NO subir public completo (usa script que excluye images/productos)
# ✅ Usar: .\SUBIR_CARPETAS_MODIFICADAS.ps1
```

### En el VPS (Bash)

```bash
cd /var/www/punto_de_venta_2025
npm run build
pm2 restart punto-venta-2025
pm2 logs punto-venta-2025
```

---

**Última actualización:** Solución symlink para imágenes persistentes  
**Proceso PM2:** `punto-venta-2025`  
**Contraseña VPS:** `MEDICENELAMIGO082001a@`  
**IP VPS:** `72.62.128.63`

