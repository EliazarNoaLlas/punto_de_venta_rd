# Script para Subir Carpetas Modificadas y Adicionales al VPS
# NO sube public/images/productos (usa symlink a carpeta persistente)
# Uso: .\SUBIR_CARPETAS_MODIFICADAS.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Subiendo Carpetas al VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "CARPETAS MODIFICADAS:" -ForegroundColor Yellow
Write-Host "1. Subiendo carpeta USUARIOS (superadmin)..." -ForegroundColor White
scp -r _Pages\superadmin\usuarios root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

Write-Host "2. Subiendo carpeta EMPRESAS (superadmin)..." -ForegroundColor White
scp -r _Pages\superadmin\empresas root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/superadmin/

Write-Host "3. Subiendo carpetas ADMIN modificadas..." -ForegroundColor White
Write-Host "   3.1. Subiendo carpeta ADMIN/CLIENTES..." -ForegroundColor Gray
scp -r _Pages\admin\clientes root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/

Write-Host "   3.2. Subiendo carpeta ADMIN/CONFIGURACION..." -ForegroundColor Gray
scp -r _Pages\admin\configuracion root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/

Write-Host "   3.3. Subiendo carpeta ADMIN/PRODUCTOS..." -ForegroundColor Gray
scp -r _Pages\admin\productos root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/

Write-Host "   3.4. Subiendo carpeta ADMIN/VENTAS..." -ForegroundColor Gray
scp -r _Pages\admin\ventas root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/admin/

Write-Host ""
Write-Host "CARPETAS ADICIONALES:" -ForegroundColor Yellow
Write-Host "4. Subiendo carpeta UTILS (incluye qzTrayService.js modificado)..." -ForegroundColor White
scp -r utils root@72.62.128.63:/var/www/punto_de_venta_2025/

Write-Host "5. Subiendo carpeta SERVICES..." -ForegroundColor White
scp -r services root@72.62.128.63:/var/www/punto_de_venta_2025/

Write-Host "6. Subiendo carpeta PUBLIC (sin imagenes dinamicas)..." -ForegroundColor White
Write-Host "   NOTA: public/images/productos NO se sube (usa symlink persistente)" -ForegroundColor Yellow

# Subir public pero excluyendo images/productos
# Crear estructura temporal sin images/productos
$tempPublic = "$env:TEMP\pdv_public_temp"
if (Test-Path $tempPublic) {
    Remove-Item -Recurse -Force $tempPublic
}
New-Item -ItemType Directory -Path $tempPublic | Out-Null

# Copiar public excluyendo images/productos
Get-ChildItem -Path "public" -Exclude "images" | Copy-Item -Destination $tempPublic -Recurse
if (Test-Path "public\images") {
    New-Item -ItemType Directory -Path "$tempPublic\images" | Out-Null
    # Copiar solo certificates, no productos
    if (Test-Path "public\images\certificates") {
        Copy-Item -Path "public\images\certificates" -Destination "$tempPublic\images\" -Recurse
    }
}

# Subir public sin images/productos
scp -r "$tempPublic\*" root@72.62.128.63:/var/www/punto_de_venta_2025/public/

# Limpiar temporal
Remove-Item -Recurse -Force $tempPublic

Write-Host ""
Write-Host "ARCHIVOS DE CONFIGURACION:" -ForegroundColor Yellow
Write-Host "7. Subiendo archivos de configuracion..." -ForegroundColor White
scp package.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp package-lock.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp next.config.mjs root@72.62.128.63:/var/www/punto_de_venta_2025/
scp jsconfig.json root@72.62.128.63:/var/www/punto_de_venta_2025/
scp eslint.config.mjs root@72.62.128.63:/var/www/punto_de_venta_2025/

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Carpetas subidas exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Paso adicional: Verificar/crear symlink para imagenes
Write-Host "VERIFICANDO SYMLINK DE IMAGENES:" -ForegroundColor Yellow
Write-Host "Ejecutando comandos en el VPS..." -ForegroundColor White

$setupSymlink = @"
cd /var/www/punto_de_venta_2025 && \
mkdir -p /var/data/pdv_images/productos && \
chmod -R 755 /var/data/pdv_images && \
if [ ! -L public/images/productos ]; then \
    rm -rf public/images/productos 2>/dev/null; \
    ln -s /var/data/pdv_images/productos public/images/productos && \
    echo 'Symlink creado exitosamente'; \
else \
    echo 'Symlink ya existe'; \
fi
"@

try {
    $result = ssh root@72.62.128.63 $setupSymlink 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: Symlink de imagenes verificado/creado" -ForegroundColor Green
    } else {
        Write-Host "  ADVERTENCIA: No se pudo verificar/crear symlink automaticamente" -ForegroundColor Yellow
        Write-Host "  Ejecuta manualmente en el VPS (solo la primera vez):" -ForegroundColor Yellow
        Write-Host "    mkdir -p /var/data/pdv_images/productos" -ForegroundColor White
        Write-Host "    chmod -R 755 /var/data/pdv_images" -ForegroundColor White
        Write-Host "    rm -rf public/images/productos" -ForegroundColor White
        Write-Host "    ln -s /var/data/pdv_images/productos public/images/productos" -ForegroundColor White
    }
} catch {
    Write-Host "  ADVERTENCIA: No se pudo verificar/crear symlink automaticamente" -ForegroundColor Yellow
    Write-Host "  Ejecuta manualmente en el VPS (solo la primera vez):" -ForegroundColor Yellow
    Write-Host "    mkdir -p /var/data/pdv_images/productos" -ForegroundColor White
    Write-Host "    chmod -R 755 /var/data/pdv_images" -ForegroundColor White
    Write-Host "    rm -rf public/images/productos" -ForegroundColor White
    Write-Host "    ln -s /var/data/pdv_images/productos public/images/productos" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SIGUIENTE PASO: Conectarse al VPS y hacer build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos a ejecutar en el VPS:" -ForegroundColor White
Write-Host "  ssh root@72.62.128.63" -ForegroundColor Yellow
Write-Host "  cd /var/www/punto_de_venta_2025" -ForegroundColor Yellow
Write-Host "  npm install" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  pm2 restart punto-venta-2025" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTA IMPORTANTE:" -ForegroundColor Red
Write-Host "  Las imagenes se guardan en /var/data/pdv_images/productos (persistente)" -ForegroundColor White
Write-Host "  NO se sube public/images/productos para evitar borrar imagenes dinamicas" -ForegroundColor White
Write-Host ""
