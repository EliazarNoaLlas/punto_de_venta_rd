# Archivos Faltantes - Subida Manual

## Archivos que NO se subieron correctamente

Según la ejecución del script, estos archivos fallaron al subir:

### 1. Rutas Admin - Catálogo (FALLARON)

**Archivos que faltan:**
- `app/(admin)/admin/catalogo/pedidos/page.js`
- `app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js`

**Comandos manuales para subir (CORRECCIÓN FINAL - USANDO COMILLAS SIMPLES):**

```powershell
$VPS = "root@72.62.128.63"

# Crear directorios primero (USANDO COMILLAS SIMPLES - PowerShell no interpreta nada)
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos'
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]'

# Subir archivos (TODO EN COMILLAS SIMPLES - PowerShell pasa literal a bash)
scp 'app/(admin)/admin/catalogo/pedidos/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/'
scp 'app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/'
```

**🔑 IMPORTANTE:** 
- En PowerShell → usa COMILLAS SIMPLES `'` para que PowerShell NO interprete nada
- PowerShell pasa la cadena literal a bash
- Bash maneja los paréntesis correctamente cuando vienen en comillas simples

---

### 2. Tienda IsiWeek (Verificar)

**Nota:** El `mkdir` falló, pero según la salida parece que `page.js` sí se subió (línea 89). Verificar si existe en el VPS.

**Archivo a verificar:**
- `app/(admin)/admin/tienda-isiweek/page.js`

**Comando de verificación (USANDO COMILLAS SIMPLES):**
```powershell
ssh root@72.62.128.63 "ls -la '/var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/'"
```

**Si falta, subirlo (USANDO COMILLAS SIMPLES):**
```powershell
ssh root@72.62.128.63 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek'
scp 'app/(admin)/admin/tienda-isiweek/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/'
```

---

### 3. Tienda B2B Superadmin (Verificar)

**Nota:** El `mkdir` falló, pero según la salida los `page.js` sí se subieron (líneas 114-116). Verificar si existen en el VPS.

**Archivos a verificar:**
- `app/(superadmin)/superadmin/tienda-b2b/page.js`
- `app/(superadmin)/superadmin/tienda-b2b/pedidos/page.js`
- `app/(superadmin)/superadmin/tienda-b2b/productos/page.js`

**Comando de verificación (USANDO COMILLAS SIMPLES):**
```powershell
ssh root@72.62.128.63 'ls -la /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/'
```

**Si falta alguno, crear directorios y subir (USANDO COMILLAS SIMPLES):**
```powershell
ssh root@72.62.128.63 'mkdir -p /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos'
ssh root@72.62.128.63 'mkdir -p /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos'

scp 'app/(superadmin)/superadmin/tienda-b2b/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/'
scp 'app/(superadmin)/superadmin/tienda-b2b/pedidos/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/'
scp 'app/(superadmin)/superadmin/tienda-b2b/productos/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/'
```

---

## Script PowerShell Completo para Subir Solo los Faltantes

Copia y pega este bloque completo en PowerShell:

```powershell
$VPS = "root@72.62.128.63"
$VPS_PATH = "/var/www/punto_de_venta_2025"

Write-Host "Subiendo archivos faltantes..." -ForegroundColor Yellow

# 1. Crear directorios para pedidos catalogo (USANDO COMILLAS SIMPLES)
Write-Host "Creando directorios para pedidos catalogo..." -ForegroundColor Cyan
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos'
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]'

# 2. Subir archivos de pedidos catalogo (USANDO COMILLAS SIMPLES)
Write-Host "Subiendo archivos de pedidos catalogo..." -ForegroundColor Cyan
scp 'app/(admin)/admin/catalogo/pedidos/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/'
scp 'app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/'

# 3. Verificar y subir tienda-isiweek si falta
Write-Host "Verificando tienda-isiweek..." -ForegroundColor Cyan
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek'
$testResult = ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/page.js' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Subiendo page.js de tienda-isiweek..." -ForegroundColor Yellow
    scp 'app/(admin)/admin/tienda-isiweek/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/'
}

# 4. Verificar y subir tienda-b2b si falta
Write-Host "Verificando tienda-b2b..." -ForegroundColor Cyan
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos'
ssh $VPS 'mkdir -p /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos'

$testResult = ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/page.js' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Subiendo page.js de tienda-b2b..." -ForegroundColor Yellow
    scp 'app/(superadmin)/superadmin/tienda-b2b/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/'
}
$testResult = ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/page.js' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Subiendo pedidos/page.js de tienda-b2b..." -ForegroundColor Yellow
    scp 'app/(superadmin)/superadmin/tienda-b2b/pedidos/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/'
}
$testResult = ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/page.js' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Subiendo productos/page.js de tienda-b2b..." -ForegroundColor Yellow
    scp 'app/(superadmin)/superadmin/tienda-b2b/productos/page.js' 'root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/'
}

Write-Host "`nArchivos faltantes subidos correctamente!" -ForegroundColor Green

# 5. Verificación en el VPS
Write-Host "`nVerificando archivos en el VPS..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

Write-Host "`nVerificando pedidos catalogo:" -ForegroundColor Yellow
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/'
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/'

Write-Host "`nVerificando tienda-isiweek:" -ForegroundColor Yellow
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/'

Write-Host "`nVerificando tienda-b2b:" -ForegroundColor Yellow
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/'
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/'
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/'

Write-Host "`nVerificación completa!" -ForegroundColor Green
```

---

## Comandos SSH Directos (Alternativa)

Si prefieres ejecutar comandos directamente en el servidor:

```bash
# Conectarse al servidor
ssh root@72.62.128.63

# Crear directorios (Directamente en bash, puedes usar (admin) sin escape o con comillas)
mkdir -p '/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos'
mkdir -p '/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]'
mkdir -p '/var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek'
mkdir -p '/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos'
mkdir -p '/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos'

# Verificar que se crearon correctamente
ls -R '/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos'

# Salir del servidor
exit
```

Luego, desde tu máquina local, ejecuta los comandos `scp` mostrados arriba.

---

## 🔍 Comandos de Verificación en el VPS

Después de subir los archivos, puedes verificar que todo se subió correctamente:

### Verificación Completa (Desde PowerShell)

```powershell
$VPS = "root@72.62.128.63"

Write-Host "Verificando archivos en el VPS..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n1. Pedidos Catalogo:" -ForegroundColor Yellow
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/'
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/'

Write-Host "`n2. Tienda IsiWeek:" -ForegroundColor Yellow
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/'

Write-Host "`n3. Tienda B2B Superadmin:" -ForegroundColor Yellow
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/'
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/'
ssh $VPS 'ls -lah /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/'

Write-Host "`n4. Verificación recursiva completa:" -ForegroundColor Yellow
ssh $VPS 'find /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/pedidos -type f'
ssh $VPS 'find /var/www/punto_de_venta_2025/app/\(admin\)/admin/tienda-isiweek -type f'
ssh $VPS 'find /var/www/punto_de_venta_2025/app/\(superadmin\)/superadmin/tienda-b2b -type f'

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Verificación completada!" -ForegroundColor Green
```

### Verificación Individual (Desde PowerShell)

```powershell
$VPS = "root@72.62.128.63"

# Verificar pedidos catalogo
Write-Host "Verificando pedidos catalogo..." -ForegroundColor Cyan
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/page.js && echo "✓ page.js existe" || echo "✗ page.js NO existe"'
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js && echo "✓ ver/[id]/page.js existe" || echo "✗ ver/[id]/page.js NO existe"'

# Verificar tienda-isiweek
Write-Host "`nVerificando tienda-isiweek..." -ForegroundColor Cyan
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/page.js && echo "✓ page.js existe" || echo "✗ page.js NO existe"'

# Verificar tienda-b2b
Write-Host "`nVerificando tienda-b2b..." -ForegroundColor Cyan
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/page.js && echo "✓ page.js existe" || echo "✗ page.js NO existe"'
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/page.js && echo "✓ pedidos/page.js existe" || echo "✗ pedidos/page.js NO existe"'
ssh $VPS 'test -f /var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/page.js && echo "✓ productos/page.js existe" || echo "✗ productos/page.js NO existe"'
```

### Verificación Rápida (Solo Confirmar Existencia)

```powershell
$VPS = "root@72.62.128.63"

# Lista todos los archivos que deberían existir
$archivos = @(
    '/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/page.js',
    '/var/www/punto_de_venta_2025/app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js',
    '/var/www/punto_de_venta_2025/app/(admin)/admin/tienda-isiweek/page.js',
    '/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/page.js',
    '/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/pedidos/page.js',
    '/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/tienda-b2b/productos/page.js'
)

Write-Host "Verificando archivos..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($archivo in $archivos) {
    $resultado = ssh $VPS "test -f '$archivo' && echo 'OK' || echo 'FALTA'"
    if ($resultado -eq 'OK') {
        Write-Host "✓ $archivo" -ForegroundColor Green
    } else {
        Write-Host "✗ $archivo - NO EXISTE" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan
```

### Verificación Directa en el VPS (SSH)

Si prefieres conectarte directamente al servidor:

```bash
# Conectarse al servidor
ssh root@72.62.128.63

# Verificar estructura de directorios
echo "=== Verificando Pedidos Catalogo ==="
ls -lah /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/pedidos/
ls -lah /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/pedidos/ver/\[id\]/

echo "=== Verificando Tienda IsiWeek ==="
ls -lah /var/www/punto_de_venta_2025/app/\(admin\)/admin/tienda-isiweek/

echo "=== Verificando Tienda B2B ==="
ls -lah /var/www/punto_de_venta_2025/app/\(superadmin\)/superadmin/tienda-b2b/
ls -lah /var/www/punto_de_venta_2025/app/\(superadmin\)/superadmin/tienda-b2b/pedidos/
ls -lah /var/www/punto_de_venta_2025/app/\(superadmin\)/superadmin/tienda-b2b/productos/

# Verificación recursiva (ver todos los archivos)
echo "=== Listado Recursivo ==="
find /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/pedidos -type f
find /var/www/punto_de_venta_2025/app/\(admin\)/admin/tienda-isiweek -type f
find /var/www/punto_de_venta_2025/app/\(superadmin\)/superadmin/tienda-b2b -type f

# Verificar que los archivos tengan contenido (no estén vacíos)
echo "=== Verificando que los archivos no estén vacíos ==="
find /var/www/punto_de_venta_2025/app/\(admin\)/admin/catalogo/pedidos -type f -exec ls -lh {} \;
find /var/www/punto_de_venta_2025/app/\(admin\)/admin/tienda-isiweek -type f -exec ls -lh {} \;
find /var/www/punto_de_venta_2025/app/\(superadmin\)/superadmin/tienda-b2b -type f -exec ls -lh {} \;

# Salir del servidor
exit
```

---

## 📋 REGLA DE ORO PARA PARÉNTESIS EN SSH (CORRECCIÓN FINAL)

| Contexto | Cómo escribir rutas | Ejemplo |
|----------|---------------------|---------|
| **PowerShell → ssh/scp** | **COMILLAS SIMPLES `'`** | `ssh $VPS 'mkdir -p /path/(admin)/...'` |
| **Bash local (directo en servidor)** | Escape con `\(` | `mkdir -p /path/\(admin\)/...` |
| **Next.js App Router** | `(admin)` es válido | `app/(admin)/page.js` |
| **scp desde PowerShell** | **COMILLAS SIMPLES en origen Y destino** | `scp 'local/(admin)/file.js' 'user@host:/path/(admin)/'` |

**🔑 REGLA CRÍTICA:**
- ❌ **NO usar** `\(admin\)` en PowerShell → PowerShell interpreta `\(` incorrectamente
- ✅ **SÍ usar** comillas simples `'` en PowerShell → PowerShell NO interpreta, pasa literal a bash
- ✅ Bash recibe la ruta con `(admin)` y la maneja correctamente cuando está en comillas simples
- ✅ Si ejecutas comandos directamente en el servidor bash, SÍ necesitas `\(admin\)`

**Por qué funciona:**
1. PowerShell con comillas simples `'` → NO interpreta nada, pasa literalmente a ssh/scp
2. ssh/scp recibe la cadena exacta con `(admin)`
3. Bash en el servidor maneja `(admin)` correctamente cuando está en comillas simples

