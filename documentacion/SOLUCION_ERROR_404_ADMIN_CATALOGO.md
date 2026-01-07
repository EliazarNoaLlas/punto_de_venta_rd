# 🔍 Solución Error 404 en `/admin/catalogo`

## 📋 Problemas Identificados

### 1. Error 404 al acceder a `https://isiweek.com/admin/catalogo`

### 2. Verificación de logs con `pm2 logs punto-venta-2025`

---

## 🎯 Causas Posibles del Error 404

### Causa 1: Archivo no subido al VPS ❌

El archivo `app/(admin)/admin/catalogo/page.js` puede no haberse subido correctamente debido a problemas con los paréntesis en el script de despliegue.

**Verificar en el VPS:**

```bash
# Conectarse al servidor
ssh root@72.62.128.63

# Verificar si existe el archivo
ls -la /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/page.js

# Verificar si existe el directorio completo
ls -la /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/

# Ver estructura completa
find /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo -type f
```

**Si el archivo NO existe:**

```powershell
# Desde PowerShell, subir el archivo manualmente
$VPS = "root@72.62.128.63"

# Crear directorio si no existe
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo'

# Subir el archivo
scp 'app/(admin)/admin/catalogo/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/'
```

---

### Causa 2: Componente dependiente no subido ❌

El archivo `page.js` importa `CatalogoAdmin` desde `@/_Pages/admin/catalogo/catalogo`. Si este componente no está, también dará 404.

**Verificar componente:**

```bash
# En el VPS
ls -la /var/www/punto_de_venta_2025/_Pages/admin/catalogo/catalogo.js
ls -la /var/www/punto_de_venta_2025/_Pages/admin/catalogo/catalogo.module.css
```

**Si faltan, subirlos:**

```powershell
# Desde PowerShell
$VPS = "root@72.62.128.63"

# Subir componente
scp -r '_Pages/admin/catalogo' "${VPS}:/var/www/punto_de_venta_2025/_Pages/admin/"
```

---

### Causa 3: Next.js no ha hecho build del cambio ❌

Si los archivos están pero Next.js no los ha compilado, puede dar 404.

**Solución: Rehacer build y reiniciar PM2**

```bash
# En el VPS
cd /var/www/punto_de_venta_2025

# Rehacer build
npm run build

# Reiniciar PM2
pm2 restart punto-venta-2025

# Ver logs para verificar errores
pm2 logs punto-venta-2025 --lines 50
```

---

### Causa 4: Archivo existe pero tiene errores de sintaxis ❌

Si el archivo tiene errores, Next.js no lo compilará correctamente.

**Verificar logs de PM2:**

```bash
# Ver últimos 100 líneas de logs
pm2 logs punto-venta-2025 --lines 100

# Ver logs en tiempo real (Ctrl+C para salir)
pm2 logs punto-venta-2025

# Ver solo errores
pm2 logs punto-venta-2025 --err --lines 50
```

**Buscar errores específicos:**

```bash
# Buscar errores relacionados con catalogo
pm2 logs punto-venta-2025 --lines 200 | grep -i "catalogo\|error\|404"
```

---

## ✅ Solución Paso a Paso (Recomendada)

### Paso 1: Verificar archivos en el VPS

```powershell
# Desde PowerShell
$VPS = "root@72.62.128.63"

Write-Host "Verificando archivos necesarios..." -ForegroundColor Cyan

# Verificar página principal
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/page.js && echo "✓ page.js existe" || echo "✗ page.js NO existe"'

# Verificar componente
ssh $VPS 'test -f /var/www/punto_de_venta_2025/_Pages/admin/catalogo/catalogo.js && echo "✓ catalogo.js existe" || echo "✗ catalogo.js NO existe"'

# Verificar CSS
ssh $VPS 'test -f /var/www/punto_de_venta_2025/_Pages/admin/catalogo/catalogo.module.css && echo "✓ catalogo.module.css existe" || echo "✗ catalogo.module.css NO existe"'

# Verificar servidor actions
ssh $VPS 'test -f /var/www/punto_de_venta_2025/_Pages/admin/catalogo/servidor.js && echo "✓ servidor.js existe" || echo "✗ servidor.js NO existe"'
```

### Paso 2: Subir archivos faltantes

```powershell
$VPS = "root@72.62.128.63"

Write-Host "Subiendo archivos faltantes..." -ForegroundColor Yellow

# Crear directorio si no existe
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo'

# Subir página principal
scp 'app/(admin)/admin/catalogo/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/'

# Subir componente y archivos relacionados
scp -r '_Pages/admin/catalogo' "${VPS}:/var/www/punto_de_venta_2025/_Pages/admin/"
```

### Paso 3: Rehacer build y reiniciar

```bash
# En el VPS (conectarse primero)
ssh root@72.62.128.63

cd /var/www/punto_de_venta_2025

# Verificar que no haya errores de sintaxis antes del build
npm run build 2>&1 | tee build.log

# Si el build fue exitoso, reiniciar PM2
if [ $? -eq 0 ]; then
    pm2 restart punto-venta-2025
    echo "✓ Aplicación reiniciada correctamente"
else
    echo "✗ Error en el build. Revisar build.log"
    cat build.log | grep -i error
fi

# Ver logs
pm2 logs punto-venta-2025 --lines 50
```

### Paso 4: Verificar que funciona

```bash
# En el VPS
# Verificar que la ruta esté disponible en Next.js
curl -I http://localhost:3000/admin/catalogo

# O probar desde el navegador accediendo a:
# https://isiweek.com/admin/catalogo
```

---

## 🔍 Comandos Útiles para Debugging

### Ver estructura completa de rutas admin

```bash
# En el VPS
find /var/www/punto_de_venta_2025/app/\(admin\)/admin -type f -name "page.js" | sort
```

### Ver todos los archivos de catálogo

```bash
# En el VPS
find /var/www/punto_de_venta_2025 -path "*/catalogo*" -type f | grep -E "\.(js|css|jsx)$" | sort
```

### Verificar imports en el archivo

```bash
# En el VPS
cat /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/page.js
```

### Ver logs de Next.js en tiempo real

```bash
# En el VPS
pm2 logs punto-venta-2025 --lines 0 | grep -E "GET|POST|404|error|Error"
```

---

## 📝 Script Completo de Verificación y Reparación

Copia y pega este script completo en PowerShell:

```powershell
$VPS = "root@72.62.128.63"
$VPS_PATH = "/var/www/punto_de_venta_2025"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Verificación y Reparación /admin/catalogo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar archivos
Write-Host "1. Verificando archivos..." -ForegroundColor Yellow

$archivos = @(
    @{ Path = "$VPS_PATH/app/(admin)/admin/catalogo/page.js"; Local = "app/(admin)/admin/catalogo/page.js"; Nombre = "page.js (ruta admin)" },
    @{ Path = "$VPS_PATH/_Pages/admin/catalogo/catalogo.js"; Local = "_Pages/admin/catalogo/catalogo.js"; Nombre = "catalogo.js (componente)" },
    @{ Path = "$VPS_PATH/_Pages/admin/catalogo/catalogo.module.css"; Local = "_Pages/admin/catalogo/catalogo.module.css"; Nombre = "catalogo.module.css" },
    @{ Path = "$VPS_PATH/_Pages/admin/catalogo/servidor.js"; Local = "_Pages/admin/catalogo/servidor.js"; Nombre = "servidor.js" }
)

$archivosFaltantes = @()

foreach ($archivo in $archivos) {
    $resultado = ssh $VPS "test -f '$($archivo.Path)' && echo 'OK' || echo 'FALTA'"
    if ($resultado -eq 'OK') {
        Write-Host "  ✓ $($archivo.Nombre)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($archivo.Nombre) - NO EXISTE" -ForegroundColor Red
        $archivosFaltantes += $archivo
    }
}

# 2. Subir archivos faltantes
if ($archivosFaltantes.Count -gt 0) {
    Write-Host ""
    Write-Host "2. Subiendo archivos faltantes..." -ForegroundColor Yellow
    
    foreach ($archivo in $archivosFaltantes) {
        Write-Host "  Subiendo $($archivo.Nombre)..." -ForegroundColor Cyan
        
        # Determinar si es un archivo o directorio
        if (Test-Path $archivo.Local -PathType Container) {
            # Es un directorio
            $directorioDestino = ($archivo.Path -replace '/[^/]+$', '')
            ssh $VPS "mkdir -p '$directorioDestino'"
            scp -r $archivo.Local "${VPS}:$directorioDestino/"
        } else {
            # Es un archivo
            $directorioDestino = ($archivo.Path -replace '/[^/]+$', '')
            ssh $VPS "mkdir -p '$directorioDestino'"
            scp $archivo.Local "${VPS}:$($archivo.Path)"
        }
    }
    
    Write-Host "  ✓ Archivos subidos" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "2. Todos los archivos existen" -ForegroundColor Green
}

# 3. Instrucciones para rebuild
Write-Host ""
Write-Host "3. PRÓXIMOS PASOS EN EL VPS:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Conectarse al servidor:" -ForegroundColor Cyan
Write-Host "  ssh $VPS" -ForegroundColor White
Write-Host ""
Write-Host "Ejecutar:" -ForegroundColor Cyan
Write-Host "  cd $VPS_PATH" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  pm2 restart punto-venta-2025" -ForegroundColor White
Write-Host "  pm2 logs punto-venta-2025 --lines 50" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host " Verificación completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
```

---

## 🧠 Explicación del Comando `pm2 logs punto-venta-2025`

### ¿Qué hace este comando?

- **`pm2 logs`**: Muestra los logs de una aplicación gestionada por PM2
- **`punto-venta-2025`**: Nombre de la aplicación Next.js
- Sin opciones adicionales: muestra logs en tiempo real (Ctrl+C para salir)

### ¿Por qué es importante revisar los logs?

Los logs te permiten ver:
- ✅ **Errores de compilación** de Next.js
- ✅ **Errores de ejecución** en tiempo de ejecución
- ✅ **Errores de API** (404, 500, etc.)
- ✅ **Errores de base de datos** (conexión, queries fallidos)
- ✅ **Advertencias** de Next.js
- ✅ **Requests HTTP** (GET, POST, etc.)
- ✅ **Estado de la aplicación** (reinicios, crashes)

### Ejemplo de logs normales:

```
0|punto-venta-2025 | ✓ Ready in 2.5s
0|punto-venta-2025 | ○ Compiling /admin/catalogo
0|punto-venta-2025 | ✓ Compiled /admin/catalogo in 234ms
```

### Ejemplo de logs con errores:

```
0|punto-venta-2025 | ⨯ Error: Cannot find module '@/component'
0|punto-venta-2025 | GET /admin/catalogo 404 in 12ms
0|punto-venta-2025 | ⨯ Error: Connection refused to database
```

### Comandos relacionados:

```bash
# Ver últimas 50 líneas
pm2 logs punto-venta-2025 --lines 50

# Ver solo errores (últimas 100 líneas)
pm2 logs punto-venta-2025 --err --lines 100

# Ver solo output normal
pm2 logs punto-venta-2025 --out --lines 50

# Limpiar logs
pm2 flush punto-venta-2025

# Ver estado de la aplicación
pm2 status punto-venta-2025

# Ver información detallada
pm2 info punto-venta-2025
```

### Qué buscar en los logs para el error 404:

```bash
# Buscar errores 404
pm2 logs punto-venta-2025 --lines 200 | grep -i "404"

# Buscar errores de routing
pm2 logs punto-venta-2025 --lines 200 | grep -i "route\|routing"

# Buscar errores de compilación
pm2 logs punto-venta-2025 --lines 200 | grep -i "error\|failed\|cannot"
```

---

## 📋 Checklist de Verificación

- [ ] Archivo `app/(admin)/admin/catalogo/page.js` existe en el VPS
- [ ] Archivo `_Pages/admin/catalogo/catalogo.js` existe en el VPS
- [ ] Archivo `_Pages/admin/catalogo/catalogo.module.css` existe en el VPS
- [ ] Archivo `_Pages/admin/catalogo/servidor.js` existe en el VPS
- [ ] Next.js build se ejecutó sin errores
- [ ] PM2 reinició correctamente después del build
- [ ] No hay errores en los logs de PM2
- [ ] La ruta `/admin/catalogo` responde correctamente (no 404)

---

## 🚨 Si Nada Funciona

Si después de seguir todos los pasos sigue dando 404:

1. **Verificar configuración de NGINX** (si aplica):
   ```bash
   # Ver configuración de NGINX
   cat /etc/nginx/sites-available/isiweek.com
   ```

2. **Verificar que Next.js esté escuchando en el puerto correcto:**
   ```bash
   # Ver en qué puerto está corriendo
   pm2 info punto-venta-2025 | grep port
   
   # Verificar que el puerto esté abierto
   netstat -tlnp | grep :3000
   ```

3. **Verificar que el dominio esté apuntando correctamente:**
   ```bash
   # Ver configuración DNS
   nslookup isiweek.com
   ```

4. **Revisar logs de NGINX:**
   ```bash
   tail -f /var/log/nginx/error.log
   tail -f /var/log/nginx/access.log
   ```

