# 🔗 Explicación Paso a Paso: Crear Symlink para Imágenes

## 🎯 ¿Qué es un Symlink?

Un **symlink** (enlace simbólico) es como un "atajo" que apunta a otra carpeta. En tu caso:
- La aplicación escribe en: `public/images/productos`
- El symlink redirige a: `/var/data/pdv_images/productos` (carpeta persistente)
- Las imágenes se guardan realmente en: `/var/data/pdv_images/productos`
- Next.js las sirve desde: `public/images/productos`

**Resultado:** Las imágenes NO se borran cuando haces deploy porque están fuera del proyecto.

---

## 📍 Situación Actual

Según tu terminal, ya estás en el VPS y ya eliminaste `public/images/productos`:

```bash
# Estás aquí:
root@srv1185711:/var/www/punto_de_venta_2025/public/images# ls
# (carpeta vacía)
```

**¡Perfecto!** Ya hiciste el paso de eliminar la carpeta. Ahora necesitas:

1. ✅ Crear la carpeta persistente (fuera del proyecto)
2. ✅ Crear el symlink (enlace simbólico)
3. ✅ Verificar que funciona

---

## 🛠️ Paso a Paso (Seguir en Orden)

### PASO 1: Salir de la carpeta `images` y volver a la raíz del proyecto

```bash
# Desde donde estás ahora:
# root@srv1185711:/var/www/punto_de_venta_2025/public/images#

# Subir dos niveles:
cd ../..

# Ahora estás aquí:
# root@srv1185711:/var/www/punto_de_venta_2025#
```

**Verifica que estás en la raíz:**
```bash
pwd
# Debe mostrar: /var/www/punto_de_venta_2025
ls
# Debe mostrar: app, _Pages, public, services, utils, etc.
```

---

### PASO 2: Crear la Carpeta Persistente (Fuera del Proyecto)

Esta carpeta se crea **FUERA** del proyecto, en `/var/data/`:

```bash
# Crear la carpeta persistente
mkdir -p /var/data/pdv_images/productos

# Dar permisos correctos
chmod -R 755 /var/data/pdv_images

# Dar ownership correcto
chown -R root:root /var/data/pdv_images
```

**Explicación:**
- `/var/data/` es una carpeta **fuera** de tu proyecto
- `pdv_images/productos` es donde se guardarán las imágenes reales
- Los permisos `755` permiten lectura/escritura
- `root:root` es el dueño de los archivos

**Verificar que se creó:**
```bash
ls -la /var/data/pdv_images/productos
# Debe mostrar: total 0 (carpeta vacía, pero existe)
```

---

### PASO 3: Volver a la Carpeta del Proyecto y Crear el Symlink

```bash
# Asegúrate de estar en la raíz del proyecto
cd /var/www/punto_de_venta_2025

# Crear el symlink (el "atajo")
ln -s /var/data/pdv_images/productos public/images/productos
```

**Explicación del comando:**
- `ln -s` = crear enlace simbólico
- `/var/data/pdv_images/productos` = destino real (donde se guardan las imágenes)
- `public/images/productos` = ubicación aparente (donde la aplicación escribe)

**Ahora la estructura es:**
```
/var/www/punto_de_venta_2025/public/images/productos  ->  /var/data/pdv_images/productos
          ↑ (symlink/atajo)                                   ↑ (carpeta real)
```

---

### PASO 4: Verificar que el Symlink se Creó Correctamente

```bash
# Ver el symlink
ls -l public/images/

# Debe mostrar algo como:
# productos -> /var/data/pdv_images/productos
```

**Si ves `productos -> /var/data/pdv_images/productos`** → ✅ **¡Perfecto!** El symlink está creado.

**Si NO ves la flecha (`->`)** → ❌ El symlink no se creó. Vuelve al PASO 3.

---

### PASO 5: Probar que Funciona (Opcional)

```bash
# Crear un archivo de prueba en la carpeta persistente
touch /var/data/pdv_images/productos/test.txt

# Verificar que aparece en el symlink
ls public/images/productos/

# Debe mostrar: test.txt

# Eliminar el archivo de prueba
rm /var/data/pdv_images/productos/test.txt
```

**Si puedes ver el archivo desde ambas ubicaciones** → ✅ **¡El symlink funciona!**

---

## 📋 Comandos Completos (Copiar y Pegar Todo Junto)

Si prefieres copiar todos los comandos de una vez:

```bash
# 1. Ir a la raíz del proyecto
cd /var/www/punto_de_venta_2025

# 2. Crear carpeta persistente (fuera del proyecto)
mkdir -p /var/data/pdv_images/productos
chmod -R 755 /var/data/pdv_images
chown -R root:root /var/data/pdv_images

# 3. Crear el symlink
ln -s /var/data/pdv_images/productos public/images/productos

# 4. Verificar
ls -l public/images/
# Debe mostrar: productos -> /var/data/pdv_images/productos

# 5. Verificar que la carpeta persistente existe
ls -la /var/data/pdv_images/productos
# Debe mostrar: total 0 (carpeta vacía pero existe)
```

---

## 🎯 Resumen Visual

### ANTES (sin symlink):
```
/var/www/punto_de_venta_2025/
└── public/
    └── images/
        └── productos/          ← Las imágenes están AQUÍ
            ├── imagen1.jpg     ← Se BORRAN cuando haces deploy
            └── imagen2.jpg
```

### DESPUÉS (con symlink):
```
/var/www/punto_de_venta_2025/
└── public/
    └── images/
        └── productos  ──SYMLINK──→  /var/data/pdv_images/productos/
                                          ├── imagen1.jpg    ← Las imágenes están AQUÍ
                                          └── imagen2.jpg    ← NO se borran con deploy
```

---

## ❓ Preguntas Frecuentes

### ¿Dónde se guardan las imágenes realmente?

**En:** `/var/data/pdv_images/productos/`

Esta carpeta está **fuera** del proyecto, por eso no se borra cuando haces deploy.

### ¿Dónde escribe la aplicación?

**En:** `public/images/productos`

Pero el symlink redirige automáticamente a `/var/data/pdv_images/productos/`.

### ¿Qué pasa si elimino el symlink?

Las imágenes seguirán existiendo en `/var/data/pdv_images/productos/`, pero la aplicación no podrá acceder a ellas hasta que recrees el symlink.

### ¿Cómo verifico que funciona?

```bash
# Ver el symlink
ls -l public/images/
# Debe mostrar: productos -> /var/data/pdv_images/productos

# Crear imagen de prueba desde la aplicación
# (subir un producto con imagen)

# Verificar que se guardó
ls /var/data/pdv_images/productos/
# Debe mostrar el archivo de imagen creado
```

---

## 🚨 Solución de Problemas

### Error: "File exists"

Si aparece este error:
```bash
ln: failed to create symbolic link 'public/images/productos': File exists
```

**Solución:**
```bash
# Eliminar la carpeta/symlink existente
rm -rf public/images/productos

# Volver a crear el symlink
ln -s /var/data/pdv_images/productos public/images/productos
```

### Error: "Permission denied"

Si aparece este error:
```bash
mkdir: cannot create directory '/var/data/pdv_images': Permission denied
```

**Solución:**
```bash
# Verificar que eres root
whoami
# Debe mostrar: root

# Si no eres root, usar sudo:
sudo mkdir -p /var/data/pdv_images/productos
sudo chmod -R 755 /var/data/pdv_images
sudo chown -R root:root /var/data/pdv_images
```

### El symlink no aparece

```bash
# Verificar que estás en la ubicación correcta
pwd
# Debe mostrar: /var/www/punto_de_venta_2025

# Ver qué hay en public/images/
ls -la public/images/

# Si no existe "productos", crear el symlink:
ln -s /var/data/pdv_images/productos public/images/productos

# Verificar nuevamente
ls -l public/images/
```

---

## ✅ Checklist Final

Después de ejecutar todos los pasos, verifica:

- [ ] La carpeta persistente existe: `ls -la /var/data/pdv_images/productos`
- [ ] El symlink existe: `ls -l public/images/` muestra `productos -> /var/data/pdv_images/productos`
- [ ] Los permisos son correctos: `ls -ld /var/data/pdv_images/productos` muestra permisos `755`
- [ ] Puedes crear archivos: `touch /var/data/pdv_images/productos/test.txt` funciona
- [ ] Puedes ver archivos desde el symlink: `ls public/images/productos/` muestra el archivo

---

**Última actualización:** Guía paso a paso para crear symlink  
**Para más información:** `CONFIGURAR_SYMLINK_IMAGENES.md`

