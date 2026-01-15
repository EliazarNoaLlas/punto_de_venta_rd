"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import estilos from './modal-terminos.module.css'
import { verificarAceptacionUsuario, aceptarTerminos } from '@/_Pages/superadmin/terminos/servidor'

export default function ModalTerminos() {
    const router = useRouter()
    const [tema, setTema] = useState('light')
    const [mostrar, setMostrar] = useState(false)
    const [terminos, setTerminos] = useState(null)
    const [aceptando, setAceptando] = useState(false)
    const [leido, setLeido] = useState(false)

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)

        const manejarCambioTema = () => {
            setTema(localStorage.getItem('tema') || 'light')
        }

        window.addEventListener('temaChange', manejarCambioTema)
        window.addEventListener('storage', manejarCambioTema)

        return () => {
            window.removeEventListener('temaChange', manejarCambioTema)
            window.removeEventListener('storage', manejarCambioTema)
        }
    }, [])

    useEffect(() => {
        verificarTerminos()
    }, [])

    const verificarTerminos = async () => {
        try {
            const resultado = await verificarAceptacionUsuario()

            if (resultado.success && resultado.requiereAceptacion) {
                setTerminos(resultado.terminos)
                setMostrar(true)
            }
        } catch (error) {
            console.error('Error al verificar términos:', error)
        }
    }

    const formatearContenido = (contenido = '') => {
        if (!contenido) return ''

        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false
        })

        const html = marked.parse(contenido)

        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'hr',
                'ul', 'ol', 'li',
                'strong', 'em', 'u', 's',
                'a', 'code', 'pre',
                'blockquote',
                'table', 'thead', 'tbody', 'tr', 'th', 'td'
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        })
    }

    const manejarScroll = (e) => {
        const elemento = e.target
        const scrollRestante = elemento.scrollHeight - elemento.scrollTop - elemento.clientHeight

        // Si está cerca del final (menos de 50px), marcar como leído
        if (scrollRestante < 50) {
            setLeido(true)
        }
    }

    const manejarAceptar = async () => {
        if (!leido) {
            alert('Por favor, lee los términos completos antes de aceptar')
            return
        }

        setAceptando(true)
        try {
            const resultado = await aceptarTerminos(terminos.id)

            if (resultado.success) {
                setMostrar(false)
                // Refrescar la página para actualizar el estado de sesión
                router.refresh()
            } else {
                alert(resultado.mensaje || 'Error al aceptar términos')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al procesar la aceptación')
        } finally {
            setAceptando(false)
        }
    }

    const manejarCerrarSesion = () => {
        // Limpiar cookies y redirigir al login
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
        router.push('/login')
    }

    if (!mostrar || !terminos) {
        return null
    }

    return (
        <div className={`${estilos.overlay} ${estilos[tema]}`}>
            <div className={`${estilos.modal} ${estilos[tema]}`}>
                <div className={estilos.header}>
                    <div className={estilos.iconoHeader}>
                        <ion-icon name="shield-checkmark"></ion-icon>
                    </div>
                    <h2 className={estilos.titulo}>Aceptación Requerida</h2>
                    <p className={estilos.subtitulo}>
                        Se han actualizado los Términos y Condiciones. Debes leerlos y aceptarlos para continuar usando el sistema.
                    </p>
                </div>

                <div
                    className={estilos.contenido}
                    onScroll={manejarScroll}
                >
                    <div className={estilos.versionInfo}>
                        <span className={estilos.badge}>Versión {terminos.version}</span>
                        <h3>{terminos.titulo}</h3>
                    </div>

                    <div
                        className={estilos.textoTerminos}
                        dangerouslySetInnerHTML={{
                            __html: formatearContenido(terminos.contenido)
                        }}
                    />

                    {!leido && (
                        <div className={estilos.avisoScroll}>
                            <ion-icon name="arrow-down-circle"></ion-icon>
                            <p>Desplázate hasta el final para habilitar el botón de aceptación</p>
                        </div>
                    )}
                </div>

                <div className={estilos.footer}>
                    <div className={estilos.avisoLegal}>
                        <ion-icon name="information-circle"></ion-icon>
                        <p>
                            Al aceptar, confirmas que has leído y comprendido estos términos.
                            Quedarán registrados tu IP y fecha de aceptación para fines legales.
                        </p>
                    </div>

                    <div className={estilos.acciones}>
                        <button
                            onClick={manejarCerrarSesion}
                            className={estilos.btnRechazar}
                            disabled={aceptando}
                        >
                            <ion-icon name="log-out-outline"></ion-icon>
                            <span>Rechazar y Cerrar Sesión</span>
                        </button>

                        <button
                            onClick={manejarAceptar}
                            className={estilos.btnAceptar}
                            disabled={!leido || aceptando}
                        >
                            {aceptando ? (
                                <>
                                    <ion-icon name="hourglass-outline" className={estilos.iconoCargando}></ion-icon>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <ion-icon name="checkmark-circle"></ion-icon>
                                    <span>Acepto los Términos y Condiciones</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
