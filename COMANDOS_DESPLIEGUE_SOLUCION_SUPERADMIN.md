# 🚀 Comandos Paso a Paso: Desplegar Solución Superadmin

## 📋 Archivos a Desplegar

1. `_Pages/main/login/servidor.js` - Cookies seguras
2. `app/(admin)/admin/layout.js` - Route guard admin
3. `app/(superadmin)/superadmin/layout.js` - Route guard superadmin

---

## 🔧 Paso 1: Subir Archivos al VPS (Desde PowerShell)

### Opción A: Comandos Individuales (Recomendado)

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# 1. Subir servidor de login (cookies seguras)
scp "_Pages\main\login\servidor.js" root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/main/login/

# 2. Subir layout de admin (route guard) - NOTA: Usar comillas por los paréntesis
scp "app\(admin)\admin\layout.js" root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/

# 3. Subir layout de superadmin (route guard) - NOTA: Usar comillas por los paréntesis
scp "app\(superadmin)\superadmin\layout.js" root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/
```

**Nota importante:** En PowerShell, las rutas con paréntesis `()` deben ir entre comillas dobles `"..."` para que PowerShell no los interprete como comandos.

**Nota:** Te pedirá la contraseña del VPS: `MEDICENELAMIGO082001a@`

### Opción B: Script Automático

Si prefieres, puedes crear un script temporal:

```powershell
# Crear script temporal
@"
scp "_Pages\main\login\servidor.js" root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/main/login/
scp "app\(admin)\admin\layout.js" root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/
scp "app\(superadmin)\superadmin\layout.js" root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/
"@ | Out-File -FilePath "subir_solucion_superadmin.ps1" -Encoding UTF8

# Ejecutar script
.\subir_solucion_superadmin.ps1
```

---

## 🔧 Paso 2: Conectarse al VPS y Verificar Archivos

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Contraseña: MEDICENELAMIGO082001a@

# Navegar al directorio del proyecto
cd /var/www/punto_de_venta_2025

# Verificar que los archivos se subieron correctamente
ls -la _Pages/main/login/servidor.js
ls -la 'app/(admin)/admin/layout.js'
ls -la 'app/(superadmin)/superadmin/layout.js'
```

**Salida esperada:** Debe mostrar los archivos con fechas recientes.

---

## 🔧 Paso 3: Hacer Build del Proyecto

```bash
# Asegurarse de estar en el directorio correcto
cd /var/www/punto_de_venta_2025

# Verificar que estás en el directorio correcto
pwd
# Debe mostrar: /var/www/punto_de_venta_2025

# Hacer build (esto puede tardar 2-5 minutos)
npm run build
```

**Salida esperada:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**Si hay errores:** Revisa los mensajes y corrígelos antes de continuar.

---

## 🔧 Paso 4: Reiniciar PM2

```bash
# Reiniciar el proceso de Next.js
pm2 restart punto-venta-2025

# Verificar que está corriendo
pm2 status

# Ver los últimos logs (últimas 20 líneas)
pm2 logs punto-venta-2025 --lines 20
```

**Salida esperada de `pm2 status`:**
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ punto-venta-2025 │ online  │ 0       │ 0s       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

**Si el proceso no está corriendo:**
```bash
# Iniciar el proceso
pm2 start npm --name "punto-venta-2025" -- start

# Guardar configuración
pm2 save
```

---

## 🔧 Paso 5: Verificar Logs (Opcional pero Recomendado)

```bash
# Ver logs en tiempo real (presiona Ctrl+C para salir)
pm2 logs punto-venta-2025

# O ver solo los últimos 50 logs
pm2 logs punto-venta-2025 --lines 50

# Ver solo errores
pm2 logs punto-venta-2025 --err --lines 20
```

**Busca errores relacionados con:**
- ❌ "Cannot find module"
- ❌ "SyntaxError"
- ❌ "TypeError"
- ❌ Cualquier error de compilación

**Si no hay errores:** ✅ Continúa al siguiente paso.

---

## 🌐 Paso 6: Limpiar Sesión y Cookies (En el Navegador)

### Opción A: Cerrar Sesión desde la Aplicación (Recomendado)

1. Abre tu navegador
2. Ve a: `https://isiweek.com/admin` o `https://isiweek.com/superadmin`
3. Si estás logueado, haz clic en tu nombre de usuario
4. Selecciona "Cerrar Sesión" o "Logout"
5. Esto te redirigirá a `/login`

### Opción B: Borrar Cookies Manualmente (Si no puedes cerrar sesión)

1. Abre **DevTools** (F12 o clic derecho → Inspeccionar)
2. Ve a la pestaña **Application** (o **Aplicación**)
3. En el menú izquierdo, expande **Cookies**
4. Haz clic en `https://isiweek.com`
5. Busca y **elimina** estas cookies:
   - `userId`
   - `userTipo`
   - `empresaId`
6. **Refresca la página** (F5)

### Opción C: Modo Incógnito (Prueba Rápida)

1. Abre una ventana de incógnito (Ctrl+Shift+N en Chrome/Edge)
2. Ve a: `https://isiweek.com/login`
3. Esto te dará una sesión limpia sin cookies

---

## 🧪 Paso 7: Probar la Solución

### 7.1. Iniciar Sesión como Superadmin

1. Ve a: `https://isiweek.com/login`
2. Ingresa tus credenciales de superadmin:
   - **Email:** `angelluisbm9@gmail.com`
   - **Contraseña:** (tu contraseña)
3. Haz clic en "Iniciar Sesión"

**Resultado esperado:**
- ✅ Debe redirigir automáticamente a `/superadmin`
- ✅ El header debe mostrar "Super Admin" o "ANGEL LUIS BATISTA MENDOZA"
- ✅ Debe mostrar el dashboard de superadmin

### 7.2. Probar Redirección desde /admin

1. Mientras estás logueado como superadmin
2. **Escribe manualmente** en la barra de direcciones: `https://isiweek.com/admin`
3. Presiona Enter

**Resultado esperado:**
- ✅ Debe redirigir automáticamente a `/superadmin`
- ✅ No debe mostrar el dashboard de admin
- ✅ Debe mantener tu sesión de superadmin

### 7.3. Probar Refresh (F5)

1. Estás en `/superadmin`
2. Presiona **F5** o **Ctrl+R** para refrescar

**Resultado esperado:**
- ✅ Debe permanecer en `/superadmin`
- ✅ No debe redirigir a `/admin`
- ✅ Debe mantener tu sesión

### 7.4. Verificar Cookies (Opcional)

1. Abre **DevTools** (F12)
2. Ve a **Application** → **Cookies** → `https://isiweek.com`
3. Verifica que existan:
   - ✅ `userId` = "1" (o tu ID)
   - ✅ `userTipo` = "superadmin" ✅ **IMPORTANTE: Debe ser "superadmin"**
   - ✅ `empresaId` = "1" (si tienes empresa)

**Si `userTipo` NO es "superadmin":**
- ❌ Hay un problema con las cookies
- Revisa los logs del servidor
- Verifica que el build se completó correctamente

---

## ✅ Verificación Final

### Checklist de Verificación

- [ ] Archivos subidos correctamente al VPS
- [ ] Build completado sin errores
- [ ] PM2 reiniciado y corriendo
- [ ] Cookies limpiadas o sesión cerrada
- [ ] Login como superadmin redirige a `/superadmin`
- [ ] Acceso manual a `/admin` redirige a `/superadmin`
- [ ] Refresh mantiene la sesión en `/superadmin`
- [ ] Cookie `userTipo` = "superadmin" en DevTools

---

## 🐛 Solución de Problemas

### Problema 1: "No se puede conectar al VPS"

```bash
# Verificar conectividad
ping 72.62.128.63

# Verificar SSH
ssh -v root@72.62.128.63
```

### Problema 2: "Error al subir archivos con scp"

```bash
# Verificar permisos en el VPS
ssh root@72.62.128.63
ls -la /var/www/punto_de_venta_2025/_Pages/main/login/
```

### Problema 3: "Error en npm run build"

```bash
# Limpiar cache y reinstalar
cd /var/www/punto_de_venta_2025
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Problema 4: "PM2 no inicia"

```bash
# Ver logs de PM2
pm2 logs punto-venta-2025 --err

# Reiniciar completamente
pm2 delete punto-venta-2025
pm2 start npm --name "punto-venta-2025" -- start
pm2 save
```

### Problema 5: "Sigue redirigiendo a /admin"

1. **Verifica que los archivos se subieron:**
   ```bash
   ssh root@72.62.128.63
   cat /var/www/punto_de_venta_2025/app/(admin)/admin/layout.js | grep "superadmin"
   # Debe mostrar: if (userTipo === 'superadmin')
   ```

2. **Verifica que el build se completó:**
   ```bash
   ls -la /var/www/punto_de_venta_2025/.next
   ```

3. **Limpia cookies completamente:**
   - DevTools → Application → Cookies → Borrar todo
   - O usa modo incógnito

4. **Verifica logs del servidor:**
   ```bash
   pm2 logs punto-venta-2025 --lines 50
   ```

---

## 📝 Comandos Rápidos (Copy & Paste)

### Desde PowerShell (Windows)

```powershell
# Subir archivos (usar comillas para rutas con paréntesis)
scp "_Pages\main\login\servidor.js" root@72.62.128.63:/var/www/punto_de_venta_2025/_Pages/main/login/
scp "app\(admin)\admin\layout.js" root@72.62.128.63:/var/www/punto_de_venta_2025/app/(admin)/admin/
scp "app\(superadmin)\superadmin\layout.js" root@72.62.128.63:/var/www/punto_de_venta_2025/app/(superadmin)/superadmin/
```

### Desde SSH (VPS)

```bash
# Conectarse
ssh root@72.62.128.63

# Build y reiniciar
cd /var/www/punto_de_venta_2025 && npm run build && pm2 restart punto-venta-2025 && pm2 logs punto-venta-2025 --lines 20
```

---

## 🎯 Resumen Ejecutivo

1. **Subir 3 archivos** al VPS con `scp`
2. **Conectarse al VPS** con `ssh`
3. **Hacer build** con `npm run build`
4. **Reiniciar PM2** con `pm2 restart punto-venta-2025`
5. **Limpiar cookies** en el navegador
6. **Probar login** como superadmin
7. **Verificar redirección** desde `/admin`

**Tiempo estimado:** 5-10 minutos

---

**Última actualización:** Comandos de despliegue detallados  
**Estado:** Listo para ejecutar

