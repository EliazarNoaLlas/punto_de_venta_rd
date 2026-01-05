# 🔍 Solución: Superadmin con empresa_id accediendo a /admin

## 📊 Datos del Usuario

Según la base de datos proporcionada:

**Usuario:** ANGEL LUIS BATISTA MENDOZA (id: 1)
- `tipo`: `"superadmin"` ✅
- `empresa_id`: `1` ⚠️ (NO es null)
- `email`: `angelluisbm9@gmail.com`

## 🔬 Análisis del Problema

### Problema Identificado

El usuario superadmin **SÍ tiene `empresa_id = 1`**, no es `null`. Esto causa que:

1. **Al hacer login**, se establecen las cookies:
   - `userId` = "1"
   - `userTipo` = "superadmin" ✅
   - `empresaId` = "1" ⚠️ (se establece porque tiene empresa_id)

2. **La redirección inicial funciona correctamente:**
   - `login.js` detecta `tipo === 'superadmin'`
   - Redirige a `/superadmin` ✅

3. **PERO si el usuario navega a `/admin` (por error o por URL directa):**
   - El layout de `/admin` carga `HeaderAdmin`
   - `HeaderAdmin` llama a `obtenerDatosAdmin()`
   - `obtenerDatosAdmin()` verifica: `userTipo !== 'admin' && userTipo !== 'vendedor'`
   - Como `userTipo === 'superadmin'`, la validación **FALLA** ✅ (correcto)
   - PERO el layout se sigue cargando y muestra el header de admin

## 🎯 Solución

### Opción 1: Middleware de Redirección (Opcional)

**Nota:** Si decides usar middleware, recuerda que en middleware NO se puede usar `cookies()` de `next/headers`. Debes usar `request.cookies`.

**Crear:** `middleware.js` en la raíz del proyecto (`/middleware.js`)

```javascript
import { NextResponse } from 'next/server'

export function middleware(request) {
    const { pathname } = request.nextUrl
    const userTipo = request.cookies.get('userTipo')?.value

    if (!userTipo) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (userTipo === 'superadmin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/superadmin', request.url))
    }

    if ((userTipo === 'admin' || userTipo === 'vendedor') && pathname.startsWith('/superadmin')) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (userTipo === 'vendedor' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/vendedor', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/superadmin/:path*', '/vendedor/:path*']
}
```

### Opción 2: Verificación en Layouts (Recomendada)

Agregar verificación en los layouts para redirigir:

**Modificar:** `app/(admin)/admin/layout.js`

```javascript
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper"
import HeaderAdmin from "@/_Pages/admin/header/header"

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies()
    const userTipo = cookieStore.get('userTipo')?.value

    // ❌ Superadmin NO debe estar aquí
    if (userTipo === 'superadmin') {
        redirect('/superadmin')
    }

    // ❌ Solo admin o vendedor
    if (userTipo !== 'admin' && userTipo !== 'vendedor') {
        redirect('/login')
    }

    return (
        <>
            <ClienteWrapper>
                <HeaderAdmin />
            </ClienteWrapper>
            {children}
        </>
    )
}
```

**Modificar:** `app/(superadmin)/superadmin/layout.js`

```javascript
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper"
import HeaderSuperAdmin from "@/_Pages/superadmin/header/header"

export default async function SuperAdminLayout({ children }) {
    const cookieStore = await cookies()
    const userTipo = cookieStore.get('userTipo')?.value

    if (userTipo !== 'superadmin') {
        redirect('/login')
    }

    return (
        <>
            <ClienteWrapper>
                <HeaderSuperAdmin />
            </ClienteWrapper>
            {children}
        </>
    )
}
```

## ✅ Recomendación

**Usar Opción 2 (Verificación en Layouts)** porque:
- ✅ Más simple
- ✅ No requiere crear middleware
- ✅ Funciona con el sistema de layouts de Next.js
- ✅ Fácil de mantener

## 📝 Cambios Necesarios

1. **Modificar:** `app/(admin)/admin/layout.js`
   - Agregar verificación de `userTipo`
   - Redirigir superadmin a `/superadmin`
   - Redirigir usuarios sin sesión a `/login`

2. **Modificar:** `app/(superadmin)/superadmin/layout.js`
   - Agregar verificación de `userTipo`
   - Redirigir admin/vendedor a `/admin`
   - Redirigir usuarios sin sesión a `/login`

3. **Opcional:** Crear `middleware.js` (Opción 1) si prefieres una solución centralizada

---

**Última actualización:** Solución para superadmin con empresa_id  
**Prioridad:** Alta (afecta seguridad y UX)

