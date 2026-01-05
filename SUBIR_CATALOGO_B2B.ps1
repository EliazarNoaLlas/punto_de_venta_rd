# ==========================================================
# Script para Subir Archivos del Catálogo B2B al VPS
# Incluye: Configuración catálogo, pedidos, API routes, páginas públicas
# Uso: .\SUBIR_CATALOGO_B2B.ps1
# ==========================================================

Clear-Host

Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Subiendo Catálogo B2B al VPS' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ""

# ========================
# CONFIGURACIÓN VPS
# ========================
$VPS_IP   = "72.62.128.63"
$VPS_USER = "root"
$VPS_PATH = "/var/www/punto_de_venta_2025"

$VPS = "$VPS_USER@$VPS_IP"

# ========================
# 1. CATALOGO ADMIN
# ========================
Write-Host 'CATALOGO ADMIN - CONFIGURACIÓN:' -ForegroundColor Yellow
Write-Host '1. Subiendo carpeta ADMIN/CATALOGO...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/_Pages/admin"
scp -r "_Pages/admin/catalogo" "${VPS}:${VPS_PATH}/_Pages/admin/"

# ========================
# 2. HEADER ADMIN
# ========================
Write-Host ""
Write-Host 'HEADER ADMIN (botón Pedidos):' -ForegroundColor Yellow
Write-Host '2. Subiendo header admin...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/_Pages/admin/header"
scp "_Pages/admin/header/header.js" "${VPS}:${VPS_PATH}/_Pages/admin/header/"

# ========================
# 3. CATALOGO PÚBLICO
# ========================
Write-Host ""
Write-Host 'CATALOGO PÚBLICO:' -ForegroundColor Yellow
Write-Host '3. Subiendo catálogo público y checkout...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/_Pages/public/catalogo/checkout"
scp -r "_Pages/public/catalogo" "${VPS}:${VPS_PATH}/_Pages/public/"

# ========================
# 4. API ROUTES - CATALOGO
# ========================
Write-Host ""
Write-Host 'API ROUTES - CATÁLOGO:' -ForegroundColor Yellow
Write-Host '4. Subiendo API routes...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/app/api/catalogo/\[slug\]/config"
ssh $VPS "mkdir -p $VPS_PATH/app/api/catalogo/\[slug\]/productos"
ssh $VPS "mkdir -p $VPS_PATH/app/api/catalogo/\[slug\]/producto/\[id\]"
ssh $VPS "mkdir -p $VPS_PATH/app/api/catalogo/\[slug\]/pedido"

scp "app/api/catalogo/[slug]/config/route.js"      "${VPS}:${VPS_PATH}/app/api/catalogo/[slug]/config/"
scp "app/api/catalogo/[slug]/productos/route.js"   "${VPS}:${VPS_PATH}/app/api/catalogo/[slug]/productos/"
scp "app/api/catalogo/[slug]/producto/[id]/route.js" "${VPS}:${VPS_PATH}/app/api/catalogo/[slug]/producto/[id]/"
scp "app/api/catalogo/[slug]/pedido/route.js"      "${VPS}:${VPS_PATH}/app/api/catalogo/[slug]/pedido/"

# ========================
# 5. RUTAS ADMIN
# ========================
Write-Host ""
Write-Host 'RUTAS ADMIN - CATÁLOGO:' -ForegroundColor Yellow
Write-Host '5. Subiendo rutas admin...' -ForegroundColor White

ssh $VPS "mkdir -p `"$VPS_PATH/app/(admin)/admin/catalogo/pedidos/ver/[id]`""

scp "app/(admin)/admin/catalogo/page.js" "${VPS}:$VPS_PATH/app/(admin)/admin/catalogo/"

scp "app/(admin)/admin/catalogo/pedidos/page.js" "${VPS}:$VPS_PATH/app/(admin)/admin/catalogo/pedidos/"

scp "app/(admin)/admin/catalogo/pedidos/ver/[id]/page.js" "${VPS}:$VPS_PATH/app/(admin)/admin/catalogo/pedidos/ver/[id]/"

# ========================
# 6. RUTAS PUBLICAS
# ========================
Write-Host ""
Write-Host 'RUTAS PÚBLICAS - CATÁLOGO:' -ForegroundColor Yellow
Write-Host '6. Subiendo rutas públicas...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/app/catalogo/\[slug\]/checkout"
scp -r "app/catalogo" "${VPS}:${VPS_PATH}/app/"

# ========================
# 7. TIENDA ISIWEEK (Admin)
# ========================
Write-Host ""
Write-Host 'TIENDA ISIWEEK (Admin):' -ForegroundColor Yellow
Write-Host '7. Subiendo tienda IsiWeek para empresas...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/_Pages/admin/tienda-isiweek"
scp -r "_Pages/admin/tienda-isiweek" "${VPS}:${VPS_PATH}/_Pages/admin/"

ssh $VPS "mkdir -p `"$VPS_PATH/app/(admin)/admin/tienda-isiweek`""
scp -r "app/(admin)/admin/tienda-isiweek" "${VPS}:$VPS_PATH/app/(admin)/admin/"

# ========================
# 8. TIENDA B2B (Superadmin)
# ========================
Write-Host ""
Write-Host 'TIENDA B2B (Superadmin):' -ForegroundColor Yellow
Write-Host '8. Subiendo tienda B2B superadmin...' -ForegroundColor White

ssh $VPS "mkdir -p $VPS_PATH/_Pages/superadmin/tienda-b2b"
scp -r "_Pages/superadmin/tienda-b2b" "${VPS}:${VPS_PATH}/_Pages/superadmin/"

ssh $VPS "mkdir -p `"$VPS_PATH/app/(superadmin)/superadmin/tienda-b2b`""
scp -r "app/(superadmin)/superadmin/tienda-b2b" "${VPS}:$VPS_PATH/app/(superadmin)/superadmin/"

# ========================
# 9. BASE DE DATOS
# ========================
Write-Host ""
Write-Host 'BASE DE DATOS (Migración SQL):' -ForegroundColor Yellow
Write-Host '9. Subiendo script SQL...' -ForegroundColor White

$SQL_FILE = "_DB/migracion_catalogo_b2b.sql"

if (Test-Path $SQL_FILE) {
    ssh $VPS "mkdir -p $VPS_PATH/_DB"
    scp $SQL_FILE "${VPS}:${VPS_PATH}/_DB/"
    Write-Host '   [OK] Script SQL subido correctamente' -ForegroundColor Green
    Write-Host '   [AVISO] Ejecutar migracion antes del build' -ForegroundColor Yellow
} else {
    Write-Host '   [ADVERTENCIA] migracion_catalogo_b2b.sql no encontrado' -ForegroundColor Yellow
}

# ========================
# FINAL
# ========================
Write-Host ""
Write-Host '========================================' -ForegroundColor Green
Write-Host ' Catálogo B2B subido exitosamente' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ""

Write-Host 'SIGUIENTES PASOS EN EL VPS:' -ForegroundColor Cyan
Write-Host '----------------------------------------' -ForegroundColor Cyan
Write-Host ('ssh ' + $VPS) -ForegroundColor Yellow
Write-Host ('cd ' + $VPS_PATH) -ForegroundColor Yellow
Write-Host 'mysql -u root -p nombre_base_datos < _DB/migracion_catalogo_b2b.sql' -ForegroundColor Yellow
Write-Host 'npm install' -ForegroundColor Yellow
Write-Host 'npm run build' -ForegroundColor Yellow
Write-Host 'pm2 restart punto-venta-2025' -ForegroundColor Yellow
Write-Host 'pm2 logs punto-venta-2025 --lines 50' -ForegroundColor Yellow
Write-Host ""
