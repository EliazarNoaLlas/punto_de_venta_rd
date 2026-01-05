# 🚀 Guía Completa de Despliegue Local - Sistema Punto de Venta RD

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Dependencias](#instalación-de-dependencias)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Ejecución Local](#ejecución-local)
6. [Verificación del Sistema](#verificación-del-sistema)
7. [Problemas Comunes](#problemas-comunes)
8. [Notas Adicionales](#notas-adicionales)

---

## ✅ Requisitos Previos

### Software Necesario

1. **Node.js** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación:
     ```powershell
     node --version
     npm --version
     ```

2. **MySQL o MariaDB** (versión 10.11 o superior)
   - **Opción A - MySQL**: https://dev.mysql.com/downloads/installer/
   - **Opción B - MariaDB**: https://mariadb.org/download/
   - **Opción C - XAMPP** (incluye MySQL): https://www.apachefriends.org/
   - Verificar instalación:
     ```powershell
     mysql --version
     ```

3. **Git** (opcional, para control de versiones)
   - Descargar desde: https://git-scm.com/

4. **JetBrains WebStorm** (IDE recomendado)
   - Descargar desde: https://www.jetbrains.com/webstorm/
   - WebStorm incluye DataGrip integrado para gestión de bases de datos
   - Versión de prueba gratuita disponible (30 días)
   - Para estudiantes: licencia gratuita disponible

---

## 📦 Instalación de Dependencias

### Paso 1: Abrir el Proyecto en WebStorm

1. Abre **WebStorm**
2. Selecciona **File → Open** (o `Ctrl + O`)
3. Navega a la carpeta del proyecto:
   ```
   C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd
   ```
4. Selecciona la carpeta y haz clic en **OK**
5. WebStorm detectará automáticamente que es un proyecto Node.js/Next.js

### Paso 2: Instalar Dependencias de Node.js

**Opción A: Desde la Terminal de WebStorm (Recomendado)**

1. Abre la terminal integrada: **View → Tool Windows → Terminal** (o `Alt + F12`)
2. Ejecuta:
   ```powershell
   npm install
   ```

**Opción B: Desde el Terminal del Sistema**

```powershell
cd "C:\Users\unsaa\OneDrive\Desktop\ProyectoPuntoVenta\punto_de_venta_rd"
npm install
```

Esto instalará todas las dependencias listadas en `package.json`:
- Next.js 16.0.10
- React 19.2.1
- mysql2 3.16.0
- bcrypt 6.0.0
- jsonwebtoken 9.0.3
- qz-tray 2.2.5
- xlsx 0.18.5 ⚠️ (ver nota sobre vulnerabilidad en "Problemas Comunes")
- Y otras...

**⏱️ Tiempo estimado:** 2-5 minutos

**Nota:** Es normal ver una advertencia de vulnerabilidad en el paquete `xlsx` después de la instalación. Ver la sección "Problemas Comunes" para más información.

---

## 🗄️ Configuración de Base de Datos con DataGrip (WebStorm)

### Paso 1: Iniciar MySQL/MariaDB

**Si usas XAMPP:**
- Abre el Panel de Control de XAMPP
- Inicia el servicio "MySQL"

**Si usas MySQL/MariaDB instalado:**
- El servicio debería iniciarse automáticamente
- Verifica que esté corriendo en el puerto 3306

### Paso 2: Crear Conexión a MySQL en DataGrip/WebStorm

1. Abre la herramienta de bases de datos en WebStorm:
   - **View → Tool Windows → Database** (o `Alt + 1` y selecciona Database)
   - O desde el menú lateral derecho, haz clic en el ícono de **Database** (🔌)

2. Haz clic en el botón **+** (Add) → **Data Source → MySQL**

3. Configura la conexión:
   - **Host:** `localhost`
   - **Port:** `3306`
   - **Database:** `punto_venta_rd` (puedes dejarlo vacío por ahora)
   - **User:** `root` (o tu usuario de MySQL)
   - **Password:** Tu contraseña de MySQL
   - **Authentication:** `Native` (recomendado)

4. Haz clic en **Test Connection** para verificar que la conexión funciona
   - Si es la primera vez, WebStorm te pedirá descargar el driver de MySQL, acepta

5. Si la conexión es exitosa, haz clic en **OK**

### Paso 3: Crear la Base de Datos

1. En el panel de **Database**, haz clic derecho sobre tu conexión → **New → Query Console**

2. Ejecuta el siguiente SQL:

```sql
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS punto_venta_rd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Para ejecutar:
   - Selecciona el texto SQL
   - Presiona `Ctrl + Enter` (o haz clic en el botón **Execute** ▶️)

4. Actualiza la conexión:
   - Haz clic derecho sobre tu conexión → **Refresh** (o `F5`)
   - Expande la conexión y verás la base de datos `punto_venta_rd`

### Paso 4: Importar la Base de Datos

Tienes dos opciones para importar la base de datos:

#### Opción A: Importar estructura completa con datos (Recomendado para primera vez)

1. En el panel de **Database**, expande tu conexión → **punto_venta_rd**
2. Haz clic derecho sobre la base de datos → **Import Data from File...**
3. Navega a: `_DB/punto_venta_rd_full.sql`
4. Selecciona el archivo y haz clic en **Open**
5. Se abrirá un diálogo de importación:
   - **Database:** `punto_venta_rd`
   - Verifica que todas las opciones estén correctas
6. Haz clic en **Run** para iniciar la importación
7. Espera a que termine (puede tomar 1-3 minutos)

**Alternativa usando Query Console:**

1. Haz clic derecho sobre `punto_venta_rd` → **New → Query Console**
2. En la consola, abre el archivo SQL:
   - `Ctrl + O` → Navega a `_DB/punto_venta_rd_full.sql`
3. Una vez abierto el archivo en la consola, ejecuta todo el script:
   - `Ctrl + Shift + Enter` (ejecutar todo) o `Ctrl + Enter` (ejecutar línea/selección)

#### Opción B: Crear solo la estructura (tablas vacías)

1. Repite los pasos de la Opción A pero selecciona el archivo `_DB/tablas.sql` en lugar de `punto_venta_rd_full.sql`

**⏱️ Tiempo estimado:** 1-3 minutos (dependiendo del tamaño)

### Paso 5: Aplicar cambios adicionales (opcional)

Si hay un archivo de cambios recientes (`_DB/cambio_ultimo.sql`):

1. Repite el proceso de importación con el archivo `cambio_ultimo.sql`

### Paso 6: Verificar la Importación

1. En el panel de **Database**, expande: **punto_venta_rd → Schemas → punto_venta_rd → Tables**
2. Deberías ver todas las tablas del sistema

3. Para verificar datos, haz clic derecho sobre una tabla (ej: `usuarios`) → **Quick Documentation** o abre una nueva Query Console:

```sql
USE punto_venta_rd;
SHOW TABLES;
SELECT COUNT(*) FROM usuarios;
```

4. Ejecuta la consulta con `Ctrl + Enter`

**Nota importante:** Si importaste `punto_venta_rd_full.sql`, ya tendrás usuarios en el sistema. Si importaste solo `tablas.sql`, necesitarás crear un usuario superadmin (ver sección de creación de superadmin).

### Alternativa: Usar Terminal MySQL (si prefieres línea de comandos)

Si prefieres usar la terminal en lugar de DataGrip:

```powershell
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS punto_venta_rd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar datos completos
mysql -u root -p punto_venta_rd < "_DB\punto_venta_rd_full.sql"

# O solo estructura
mysql -u root -p punto_venta_rd < "_DB\tablas.sql"
```

---

## ⚙️ Configuración del Proyecto

### Paso 1: Crear Archivo de Variables de Entorno en WebStorm

1. En el panel de proyecto (Explorer), haz clic derecho en la raíz del proyecto
2. Selecciona **New → File**
3. Nombra el archivo: `.env.local`
4. Presiona `Enter`

**Alternativa:**
- Puedes crear el archivo manualmente desde el explorador de archivos
- O usar la terminal: `New-Item -ItemType File -Path ".env.local"`

### Paso 2: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en WebStorm (haz doble clic)
2. Agrega el siguiente contenido:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=punto_venta_rd

# Configuración de Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuración de VPS (opcional, para producción)
VPS_UPLOAD_URL=http://72.62.128.63/uploads
VPS_IMAGE_BASE_URL=http://72.62.128.63
```

**⚠️ IMPORTANTE:**
- Reemplaza `tu_contraseña_mysql` con tu contraseña real de MySQL
- Si MySQL no tiene contraseña, deja `DB_PASSWORD=` vacío
- Las variables `VPS_UPLOAD_URL` y `VPS_IMAGE_BASE_URL` son opcionales y solo necesarias si trabajas con imágenes en servidor remoto

### Paso 3: Verificar Configuración de Base de Datos

El archivo `_DB/db.js` ya está configurado para usar variables de entorno:

```javascript
import mysql from 'mysql2/promise';
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
export default db;
```

✅ Esto está correcto, no necesitas modificarlo.

---

## 🚀 Ejecución Local

### Paso 1: Configurar Run Configuration en WebStorm

1. Abre el archivo `package.json`
2. WebStorm detectará automáticamente los scripts de npm
3. Verás iconos de "ejecutar" (▶️) junto a cada script en el editor

**Alternativa - Crear configuración manual:**

1. Ve a **Run → Edit Configurations...**
2. Haz clic en **+** → **npm**
3. Configura:
   - **Name:** `dev` (o el nombre que prefieras)
   - **Command:** `run`
   - **Scripts:** `dev`
   - **Package.json:** (selecciona automáticamente el del proyecto)
4. Haz clic en **OK**

### Paso 2: Iniciar el Servidor de Desarrollo

**Opción A: Desde package.json (Más fácil)**

1. Abre `package.json`
2. Encuentra la línea del script `"dev": "next dev"`
3. Haz clic en el ícono de ejecutar (▶️) que aparece junto a la línea

**Opción B: Desde la Terminal de WebStorm**

1. Abre la terminal: **View → Tool Windows → Terminal** (o `Alt + F12`)
2. Ejecuta:
   ```powershell
   npm run dev
   ```

**Opción C: Desde Run Configuration**

1. En la barra superior, selecciona la configuración que creaste (o "dev" si aparece)
2. Haz clic en el botón **Run** (▶️) o presiona `Shift + F10`

Deberías ver en la terminal algo como:

```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Paso 3: Abrir en el Navegador

**Opción A: Desde WebStorm**
- Haz clic en el enlace `http://localhost:3000` que aparece en la terminal
- O presiona `Ctrl + Click` sobre el enlace

**Opción B: Manualmente**
- Abre tu navegador y ve a: `http://localhost:3000`

### Paso 4: Verificar que Funciona

Deberías ver:
- La página de login o la página principal
- Sin errores en la consola del navegador
- Sin errores en la terminal de WebStorm

**Tip:** WebStorm mostrará una notificación cuando el servidor esté listo, y puedes hacer clic directamente en el enlace para abrir el navegador.

---

## ✅ Verificación del Sistema

### 1. Verificar Conexión a Base de Datos

Abre la consola del navegador (F12) y verifica que no haya errores de conexión.

### 2. Crear Usuario Superadmin (si es necesario)

Si importaste solo `tablas.sql` o la base de datos está vacía, necesitarás crear un usuario superadmin inicial.

**Opción A: Usar el script incluido (Recomendado)**

El proyecto incluye un script para crear el superadmin automáticamente. Este script se ejecuta automáticamente cuando accedes al sistema por primera vez si no existe un superadmin.

Credenciales por defecto:
- **Email:** `admin@gmail.com`
- **Contraseña:** `123456`

**Opción B: Crear manualmente desde MySQL**

```sql
USE punto_venta_rd;

-- Generar hash de contraseña (ejemplo para '123456')
-- Necesitarás usar bcrypt desde Node.js o usar un generador online
-- Por ahora, puedes usar el script incluido en el proyecto
```

### 3. Probar Login

Intenta iniciar sesión con un usuario existente en la base de datos.

**Para ver usuarios en la base de datos usando DataGrip:**

1. En el panel de **Database**, expande: **punto_venta_rd → Tables → usuarios**
2. Haz clic derecho sobre `usuarios` → **Jump to Query Console** (o `F4`)
3. Ejecuta la consulta:

```sql
SELECT id, nombre, email, tipo FROM usuarios LIMIT 5;
```

4. Presiona `Ctrl + Enter` para ejecutar

**Alternativa - Ver datos directamente:**
- Haz clic derecho sobre `usuarios` → **Open Table** (o `F4`)
- Verás los datos en formato tabla directamente en DataGrip

**Credenciales por defecto (si importaste punto_venta_rd_full.sql):**
- Revisa la tabla `usuarios` para ver los usuarios existentes
- Las contraseñas están hasheadas con bcrypt

### 4. Verificar Módulos Principales

Navega por el sistema y verifica que funcionen:
- ✅ Dashboard
- ✅ Productos
- ✅ Ventas
- ✅ Compras
- ✅ Clientes
- ✅ Inventario
- ✅ Reportes
- ✅ Usuarios
- ✅ Configuración

### 5. Verificar Consola del Navegador

Presiona `F12` → Pestaña "Console" y verifica:
- ❌ No debe haber errores en rojo
- ⚠️ Los warnings amarillos son aceptables

### 6. Verificar Terminal de PowerShell

En la terminal donde corre `npm run dev`:
- ❌ No debe haber errores críticos
- ✅ Debe mostrar requests HTTP cuando navegas

---

## 🔧 Problemas Comunes

### ⚠️ Vulnerabilidad de Seguridad en el Paquete xlsx

#### Descripción del problema

Al ejecutar los comandos `npm install` o `npm audit`, puede aparecer la siguiente advertencia de seguridad relacionada con el paquete `xlsx`:

```
1 high severity vulnerability
xlsx  *
Severity: high
Prototype Pollution in sheetJS
SheetJS Regular Expression Denial of Service (ReDoS)
No fix available
```

#### Detalle técnico

El paquete `xlsx` (SheetJS), en su versión actual 0.18.5, presenta dos vulnerabilidades de alta severidad:

- **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6)
- **Regular Expression Denial of Service (ReDoS)** (GHSA-5pgg-2g8v-p4x9)

No existe, hasta el momento, una versión parcheada del paquete (No fix available).

En este proyecto, `xlsx` se utiliza exclusivamente para la exportación de reportes a Excel, ubicado en:

- `_Pages/admin/reportes/reportes.js`

Estas vulnerabilidades afectan principalmente escenarios donde se procesan archivos o datos provenientes de fuentes no confiables.

#### 🧩 Opciones Disponibles

**1️⃣ Aceptar el riesgo (Recomendado para desarrollo local)**

Aplicable cuando:
- El proyecto se usa en entorno local o interno
- Los datos exportados son confiables y controlados
- El riesgo es bajo en este contexto

El proyecto puede seguir funcionando con normalidad.

Comando recomendado para revisión básica:

```powershell
npm audit --production
```

**2️⃣ Mitigar el riesgo (Recomendado para producción)**

Para entornos productivos se recomienda:
- Validar y sanitizar todos los datos antes de generar archivos Excel
- Establecer límites de tamaño para los archivos exportados
- Restringir el acceso a la funcionalidad de exportación
- Monitorear periódicamente actualizaciones del paquete:

```powershell
npm view xlsx version
```

**3️⃣ Reemplazar el paquete (Evaluación futura)**

Si el nivel de seguridad requerido aumenta, se puede considerar migrar a una alternativa más mantenida:

- **exceljs**
  - Mejor mantenimiento activo
  - Menor historial de vulnerabilidades
  - Requiere refactorización del código de exportación

```powershell
npm uninstall xlsx
npm install exceljs
```

#### 🛠️ Comandos Útiles

```powershell
npm audit
npm audit --production   # Audita solo dependencias de producción
```

#### ℹ️ Nota Importante

Esta advertencia no impide el funcionamiento del proyecto.

Se trata de una alerta de seguridad que debe ser considerada especialmente si, en el futuro, la funcionalidad de exportación a Excel procesa datos provenientes de usuarios externos o fuentes no confiables.

#### 📌 Resumen del Problema

- **Paquete afectado:** xlsx@0.18.5
- **Vulnerabilidades:**
  - Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
  - ReDoS (GHSA-5pgg-2g8v-p4x9)
- **Estado:** No existe parche oficial
- **Impacto actual:** Bajo, debido al uso controlado del paquete

#### ✅ Recomendaciones Finales

**Para desarrollo local:**
- Continuar trabajando normalmente
- El riesgo es aceptable en este contexto

**Para producción:**
- Validar datos antes de exportar
- Monitorear actualizaciones del paquete
- Evaluar migración a `exceljs` si el proyecto escala

---

### Error: "Cannot find module 'mysql2'"

**Solución:**
```powershell
npm install mysql2
```

### Error: "Access denied for user 'root'@'localhost'"

**Solución:**
1. Verifica la contraseña en `.env.local`
2. Verifica la conexión en DataGrip:
   - Panel Database → Haz clic derecho en tu conexión → **Modify Connection...**
   - Verifica usuario y contraseña
   - Haz clic en **Test Connection**
3. O crea un usuario nuevo en MySQL usando DataGrip:
   - Abre una Query Console en tu conexión (no en la base de datos específica)
   - Ejecuta:
   ```sql
   CREATE USER 'puntoventa'@'localhost' IDENTIFIED BY 'tu_contraseña';
   GRANT ALL PRIVILEGES ON punto_venta_rd.* TO 'puntoventa'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. Actualiza `.env.local` con el nuevo usuario y contraseña
5. Actualiza la conexión en DataGrip con las nuevas credenciales

### Error: "Port 3000 is already in use"

**Solución:**
```powershell
# Opción 1: Usar otro puerto
npm run dev -- -p 3001

# Opción 2: Cerrar el proceso que usa el puerto 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Error: "Database 'punto_venta_rd' doesn't exist"

**Solución usando DataGrip:**
1. En el panel Database, haz clic derecho sobre tu conexión → **New → Query Console**
2. Ejecuta:
   ```sql
   CREATE DATABASE IF NOT EXISTS punto_venta_rd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Refresca la conexión (`F5`)
4. Luego importa la base de datos de nuevo (ver Paso 4 de Configuración de Base de Datos)

### Error: "Module not found" o errores de importación

**Solución:**
```powershell
# Limpiar e instalar de nuevo
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE" o problemas de autenticación MySQL

**Solución usando DataGrip:**
Si estás usando MySQL 8.0+ y recibes errores de autenticación:

1. En DataGrip, modifica la conexión:
   - Panel Database → Haz clic derecho en tu conexión → **Modify Connection...**
   - En la pestaña **Advanced**, busca `useSSL` y ponlo en `false` si es necesario
   - En **Authentication**, asegúrate de usar `Native`

2. O cambia el método de autenticación del usuario en MySQL:
   - Abre una Query Console en tu conexión
   - Ejecuta:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
   FLUSH PRIVILEGES;
   ```

3. O crea un nuevo usuario:
   ```sql
   CREATE USER 'puntoventa'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
   GRANT ALL PRIVILEGES ON punto_venta_rd.* TO 'puntoventa'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Error al importar archivo SQL grande en DataGrip

**Solución:**
1. Aumenta el tamaño máximo de paquete en MySQL:
   - Abre una Query Console en tu conexión
   - Ejecuta:
   ```sql
   SET GLOBAL max_allowed_packet=1073741824;  -- 1GB
   ```

2. O usa la importación por partes:
   - Abre el archivo SQL grande en WebStorm
   - Copia y ejecuta secciones del archivo en Query Console

3. Alternativa - Importar desde terminal:
   ```powershell
   mysql -u root -p --max_allowed_packet=1G punto_venta_rd < "_DB\punto_venta_rd_full.sql"
   ```

---

## 📝 Notas Adicionales

### Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- **`app/`**: Rutas y páginas de Next.js (App Router)
- **`_Pages/`**: Componentes de página organizados por roles (admin, superadmin, vendedor, main)
- **`_DB/`**: Configuración de base de datos y scripts SQL
- **`_EXTRAS/`**: Scripts adicionales y utilidades
- **`public/`**: Archivos estáticos
- **`utils/`**: Utilidades y helpers

### Roles del Sistema

El sistema tiene tres tipos de usuarios:

1. **Superadmin**: Administrador de la plataforma completa
2. **Admin**: Administrador de una empresa específica
3. **Vendedor**: Usuario con permisos limitados para ventas

### Scripts Disponibles

**En WebStorm puedes ejecutar estos scripts de varias formas:**

1. **Desde package.json:** Haz clic en el ícono ▶️ junto a cada script
2. **Desde la Terminal:** Escribe el comando y presiona Enter
3. **Desde Run Configuration:** Crea configuraciones personalizadas

```powershell
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Verificar código con ESLint
```

### Atajos de Teclado Útiles en WebStorm

- `Alt + F12`: Abrir/Cerrar Terminal
- `Ctrl + Shift + F10`: Ejecutar archivo/script actual
- `Shift + F10`: Ejecutar configuración seleccionada
- `Ctrl + F9`: Compilar proyecto
- `Alt + 1`: Mostrar/Ocultar panel de proyecto
- `Alt + 2`: Mostrar/Ocultar panel de base de datos
- `Ctrl + B`: Ir a definición
- `Ctrl + Click`: Ir a definición (sobre el símbolo)
- `Ctrl + Shift + N`: Buscar archivo
- `Ctrl + E`: Archivos recientes
- `Ctrl + /`: Comentar/descomentar línea

### Comandos Útiles de Base de Datos en DataGrip

**Usando DataGrip (Recomendado):**

- **Abrir Query Console:** Haz clic derecho en base de datos → **New → Query Console**
- **Ver datos de tabla:** Haz clic derecho en tabla → **Open Table** (o `F4`)
- **Ejecutar consulta:** `Ctrl + Enter` (ejecutar línea/selección) o `Ctrl + Shift + Enter` (ejecutar todo)
- **Autocompletar:** `Ctrl + Space` (sugerencias de SQL)
- **Formatear SQL:** `Ctrl + Alt + L`
- **Exportar datos:** Haz clic derecho en tabla → **Export Data to File...**
- **Importar datos:** Haz clic derecho en base de datos → **Import Data from File...**

**Usando Terminal (Alternativa):**

```powershell
# Conectar a la base de datos
mysql -u root -p punto_venta_rd

# Importar SQL
mysql -u root -p punto_venta_rd < archivo.sql

# Exportar base de datos
mysqldump -u root -p punto_venta_rd > backup.sql
```

### Crear Usuario Superadmin Manualmente

Si necesitas crear un superadmin manualmente y el script automático no funciona, puedes usar Node.js:

1. Crea un archivo temporal `crear_admin.js`:

```javascript
import db from './_DB/db.js'
import bcrypt from 'bcrypt'

async function crearSuperAdmin() {
  try {
    const connection = await db.getConnection()
    const passwordHash = await bcrypt.hash('123456', 12)
    
    await connection.execute(
      `INSERT INTO usuarios (empresa_id, rol_id, nombre, cedula, email, password, tipo, activo)
       VALUES (NULL, NULL, 'Super Administrador', '000-0000000-0', 'admin@gmail.com', ?, 'superadmin', true)`,
      [passwordHash]
    )
    
    connection.release()
    console.log('Superadmin creado exitosamente')
    console.log('Email: admin@gmail.com')
    console.log('Contraseña: 123456')
  } catch (error) {
    console.error('Error:', error)
  }
  process.exit()
}

crearSuperAdmin()
```

2. Ejecuta el script:

```powershell
node crear_admin.js
```

3. Elimina el archivo temporal después de usarlo.

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa la sección "Problemas Comunes"
2. Verifica los logs en la terminal de WebStorm
3. Revisa la consola del navegador (F12)
4. Verifica que MySQL esté corriendo (Panel de Control XAMPP o servicios de Windows)
5. Verifica las variables de entorno en `.env.local` (abre el archivo en WebStorm)
6. Verifica la conexión en DataGrip (Panel Database → Test Connection)
7. Verifica que la base de datos esté correctamente importada (Panel Database → expande punto_venta_rd → Tables)

### Consejos para Debugging en WebStorm

- **Logs de la aplicación:** Revisa la pestaña "Run" en la parte inferior cuando ejecutas `npm run dev`
- **Problemas de conexión DB:** Usa el botón "Test Connection" en DataGrip antes de importar
- **Errores de compilación:** Revisa la pestaña "Problems" en WebStorm (`Alt + 6`)
- **Navegación rápida:** Usa `Ctrl + Shift + F` para buscar texto en todo el proyecto

---

## 📋 Checklist de Verificación

Antes de considerar el despliegue completo, verifica:

- [ ] ✅ Node.js está instalado (versión 18+)
- [ ] ✅ MySQL/MariaDB está instalado y corriendo
- [ ] ✅ WebStorm está instalado y configurado
- [ ] ✅ El proyecto está abierto en WebStorm
- [ ] ✅ Las dependencias están instaladas (`npm install` completado)
- [ ] ✅ La conexión a MySQL está configurada en DataGrip
- [ ] ✅ La base de datos `punto_venta_rd` está creada (visible en DataGrip)
- [ ] ✅ La base de datos está importada correctamente (tablas visibles en DataGrip)
- [ ] ✅ El archivo `.env.local` está creado y configurado
- [ ] ✅ La conexión en DataGrip funciona (Test Connection exitoso)
- [ ] ✅ El servidor de desarrollo inicia sin errores desde WebStorm
- [ ] ✅ Puedes acceder a `http://localhost:3000`
- [ ] ✅ Puedes iniciar sesión con un usuario (superadmin o usuario existente)
- [ ] ✅ Los módulos principales cargan correctamente
- [ ] ✅ No hay errores en la consola del navegador (F12)
- [ ] ✅ No hay errores críticos en la terminal de WebStorm
- [ ] ✅ Puedes ejecutar consultas SQL en DataGrip sin problemas
- [ ] ⚠️ Has revisado la advertencia de seguridad del paquete `xlsx` (ver "Problemas Comunes")

---

**¡Listo!** Una vez que el sistema esté funcionando localmente, podrás comenzar a desarrollar y realizar las correcciones necesarias.

**Nota importante:** Si ves advertencias de vulnerabilidad después de `npm install`, revisa la sección "Problemas Comunes" → "Vulnerabilidad en el paquete xlsx" para más información.

---

## 💡 Características Útiles de WebStorm y DataGrip

### DataGrip - Gestión de Base de Datos

**Ventajas de usar DataGrip en WebStorm:**

1. **Autocompletado Inteligente:**
   - DataGrip ofrece autocompletado de SQL muy avanzado
   - Sugiere nombres de tablas, columnas y funciones mientras escribes

2. **Navegación Visual:**
   - Explora la estructura de la base de datos visualmente
   - Ve las relaciones entre tablas (claves foráneas)
   - Inspecciona índices, triggers y procedimientos almacenados

3. **Edición de Datos:**
   - Edita datos directamente en las tablas (haz doble clic en una celda)
   - Inserta, actualiza y elimina registros desde la interfaz
   - Cambios se guardan con `Ctrl + S`

4. **Exportar/Importar:**
   - Exporta resultados de consultas a CSV, Excel, JSON, etc.
   - Importa datos desde archivos
   - Genera scripts de inserción automáticamente

5. **Historial de Consultas:**
   - DataGrip guarda un historial de todas tus consultas SQL
   - Útil para reutilizar consultas frecuentes
   - Accede desde: **View → Tool Windows → History**

### WebStorm - Desarrollo con Next.js

**Características útiles para este proyecto:**

1. **Soporte Nativo de Next.js:**
   - WebStorm reconoce automáticamente la estructura de Next.js
   - Autocompletado para componentes y rutas
   - Navegación entre páginas y componentes

2. **Debugging:**
   - Configura puntos de interrupción (breakpoints) directamente en el código
   - Depura tu aplicación Next.js desde WebStorm
   - Inspecciona variables y call stacks

3. **Refactoring Inteligente:**
   - Renombra variables, funciones y archivos de forma segura
   - Extrae componentes y funciones
   - Busca y reemplaza en todo el proyecto

4. **Git Integration:**
   - Control de versiones integrado
   - Visualiza cambios con diff
   - Commits y pushes desde el IDE

5. **Code Quality:**
   - Inspección de código en tiempo real
   - Sugerencias de mejores prácticas
   - Integración con ESLint (ya configurado en el proyecto)

### Consejos Adicionales

- **Multi-cursor:** `Alt + Click` para editar múltiples líneas a la vez
- **Selección múltiple:** `Ctrl + Shift + Alt + J` para seleccionar todas las ocurrencias de una palabra
- **Estructura del proyecto:** `Alt + 7` para ver la estructura de clases y funciones del archivo actual
- **Búsqueda global:** `Ctrl + Shift + F` para buscar texto en todo el proyecto
- **Reemplazar en archivos:** `Ctrl + Shift + R` para buscar y reemplazar en múltiples archivos

---

*Última actualización: 2025-01-27*

