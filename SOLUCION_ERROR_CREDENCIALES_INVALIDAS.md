# 🔐 Solución: Error "Credenciales Inválidas" después del Deploy

## 🚨 Problema

Después de desplegar los cambios, al intentar iniciar sesión como superadmin aparece:
- ❌ "Credenciales invalidas"

## 🧠 Causas Posibles

1. **Cookies viejas** (más probable) - Las cookies antiguas con configuración diferente interfieren
2. Contraseña incorrecta
3. Usuario no existe o está inactivo
4. Problema con el servidor de login

---

## ✅ Solución Paso a Paso

### Paso 1: Limpiar Cookies Completamente (OBLIGATORIO)

#### Opción A: Desde DevTools (Recomendado)

1. **Abre DevTools:**
   - Presiona `F12` o `Ctrl + Shift + I`
   - O clic derecho → "Inspeccionar"

2. **Ve a la pestaña Application (o Aplicación)**

3. **En el menú izquierdo:**
   - Expande **Cookies**
   - Haz clic en `https://isiweek.com`

4. **Elimina TODAS las cookies:**
   - Selecciona cada cookie una por una y presiona `Delete`
   - O usa el botón derecho → "Clear" (Limpiar todo)
   - Cookies a eliminar:
     - `userId`
     - `userTipo`
     - `empresaId`
     - Cualquier otra cookie relacionada

5. **Cierra DevTools**

6. **Refresca la página:**
   - Presiona `F5` o `Ctrl + R`
   - O cierra y abre el navegador nuevamente

#### Opción B: Modo Incógnito (Prueba Rápida)

1. Abre una **ventana de incógnito:**
   - Chrome/Edge: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`

2. Ve a: `https://isiweek.com/login`

3. Intenta iniciar sesión

**Si funciona en incógnito:** Confirma que el problema son las cookies viejas.

---

### Paso 2: Verificar Credenciales

**Usuario Superadmin:**
- **Email:** `angelluisbm9@gmail.com`
- **Contraseña:** (tu contraseña actual)

**Verificar en la base de datos (opcional):**

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Conectarse a MySQL
mysql -u root -p

# Seleccionar base de datos
USE punto_venta_rd;

# Verificar usuario
SELECT id, email, tipo, activo FROM usuarios WHERE email = 'angelluisbm9@gmail.com';

# Debe mostrar:
# id: 1
# email: angelluisbm9@gmail.com
# tipo: superadmin
# activo: 1
```

---

### Paso 3: Verificar Logs del Servidor

Si el problema persiste después de limpiar cookies, revisa los logs:

```bash
# Conectarse al VPS
ssh root@72.62.128.63

# Ver logs de PM2
pm2 logs punto-venta-2025 --lines 50

# Ver solo errores
pm2 logs punto-venta-2025 --err --lines 50
```

**Busca errores relacionados con:**
- ❌ "Error al iniciar sesion"
- ❌ "bcrypt"
- ❌ "database connection"
- ❌ "cookie"

---

### Paso 4: Probar Login Nuevamente

1. **Asegúrate de haber limpiado las cookies** (Paso 1)

2. **Ve a:** `https://isiweek.com/login`

3. **Ingresa tus credenciales:**
   - Email: `angelluisbm9@gmail.com`
   - Contraseña: (tu contraseña)

4. **Haz clic en "Iniciar Sesión"**

5. **Resultado esperado:**
   - ✅ Debe redirigir a `/superadmin`
   - ✅ No debe mostrar "Credenciales invalidas"

---

## 🔍 Diagnóstico Adicional

### Si el error persiste después de limpiar cookies:

#### 1. Verificar que el archivo servidor.js se subió correctamente

```bash
# En el VPS
ssh root@72.62.128.63
cd /var/www/punto_de_venta_2025
cat _Pages/main/login/servidor.js | grep -A 5 "secure"
```

**Debe mostrar:**
```javascript
secure: isSecure,
```

#### 2. Verificar que PM2 reinició correctamente

```bash
pm2 status
pm2 logs punto-venta-2025 --lines 10
```

#### 3. Probar el endpoint de login directamente

```bash
# En el VPS
curl -X POST https://isiweek.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"angelluisbm9@gmail.com","password":"TU_CONTRASEÑA"}'
```

**NOTA:** Esto no funcionará porque requiere autenticación, pero puedes ver si hay errores de conexión.

#### 4. Verificar variables de entorno

```bash
# En el VPS
cd /var/www/punto_de_venta_2025
cat .env.local | grep -E "DB_|NODE_ENV"
```

---

## 🐛 Solución de Problemas Específicos

### Problema 1: "Credenciales invalidas" incluso con cookies limpias

**Posibles causas:**
1. Contraseña incorrecta
2. Usuario inactivo en BD
3. Problema con bcrypt

**Solución:**
```bash
# Verificar usuario en BD
mysql -u root -p punto_venta_rd -e "SELECT id, email, tipo, activo FROM usuarios WHERE email = 'angelluisbm9@gmail.com';"

# Si activo = 0, activarlo:
mysql -u root -p punto_venta_rd -e "UPDATE usuarios SET activo = 1 WHERE email = 'angelluisbm9@gmail.com';"
```

### Problema 2: Redirige pero luego muestra error

**Causa:** Layout está haciendo redirección pero hay problema con cookies

**Solución:**
1. Limpiar cookies completamente (Paso 1)
2. Verificar logs del servidor (Paso 3)

### Problema 3: Funciona en incógnito pero no en navegador normal

**Causa definitiva:** Cookies viejas

**Solución:**
1. Limpiar TODAS las cookies de `isiweek.com`
2. Cerrar todas las pestañas del sitio
3. Cerrar y reabrir el navegador
4. Probar nuevamente

---

## ✅ Checklist de Verificación

- [ ] Cookies limpiadas completamente (DevTools → Application → Cookies)
- [ ] Página refrescada después de limpiar cookies
- [ ] Credenciales correctas (email y contraseña)
- [ ] Usuario existe y está activo en BD
- [ ] PM2 está corriendo correctamente
- [ ] No hay errores en los logs
- [ ] Probado en modo incógnito (para confirmar)

---

## 📋 Comandos Rápidos (Copy & Paste)

### Limpiar Cookies (Navegador)

1. `F12` → Application → Cookies → `https://isiweek.com` → Eliminar todas
2. `F5` para refrescar

### Verificar Usuario en BD

```bash
ssh root@72.62.128.63
mysql -u root -p punto_venta_rd -e "SELECT id, email, tipo, activo FROM usuarios WHERE email = 'angelluisbm9@gmail.com';"
```

### Ver Logs del Servidor

```bash
ssh root@72.62.128.63
pm2 logs punto-venta-2025 --err --lines 50
```

---

## 🎯 Resumen

**Pasos obligatorios:**
1. ✅ **Limpiar cookies completamente** (Paso 1)
2. ✅ **Refrescar página** después de limpiar
3. ✅ **Probar login** nuevamente

**Si persiste:**
- Verificar logs del servidor
- Verificar usuario en BD
- Probar en modo incógnito

---

**Última actualización:** Solución error credenciales inválidas  
**Causa más probable:** Cookies viejas interfiriendo

