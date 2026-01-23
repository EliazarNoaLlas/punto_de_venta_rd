"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { obtenerClientes } from '../servidor'
import { obtenerClientePorId } from '../ver/servidor'
import { actualizarClienteYCredito } from './servidor'
import estilos from './editar.module.css'

export default function EditarClienteAdmin() {
    const router = useRouter()
    const params = useParams()
    const [tema, setTema] = useState('light')
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)

    // Datos maestros
    const [tiposDocumento, setTiposDocumento] = useState([])

    // Estados del formulario
    const [tipoDocumentoId, setTipoDocumentoId] = useState('')
    const [numeroDocumento, setNumeroDocumento] = useState('')
    const [nombre, setNombre] = useState('')
    const [apellidos, setApellidos] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [direccion, setDireccion] = useState('')
    const [activo, setActivo] = useState(true)

    // Foto e Identificación
    const [fotoUrl, setFotoUrl] = useState('')
    const [fotoArchivo, setFotoArchivo] = useState(null)
    const [previewFoto, setPreviewFoto] = useState(null)
    const fileInputRef = useRef(null)

    // Crédito Profesional
    const [tieneCredito, setTieneCredito] = useState(false)
    const [limiteCredito, setLimiteCredito] = useState('')
    const [frecuenciaPago, setFrecuenciaPago] = useState('mensual')
    const [diasGracia, setDiasGracia] = useState(30)
    const [observacionCredito, setObservacionCredito] = useState('')

    useEffect(() => {
        const temaLocal = localStorage.getItem('tema') || 'light'
        setTema(temaLocal)

        const manejarCambioTema = () => {
            const nuevoTema = localStorage.getItem('tema') || 'light'
            setTema(nuevoTema)
        }

        window.addEventListener('temaChange', manejarCambioTema)
        window.addEventListener('storage', manejarCambioTema)

        return () => {
            window.removeEventListener('temaChange', manejarCambioTema)
            window.removeEventListener('storage', manejarCambioTema)
        }
    }, [])

    useEffect(() => {
        if (params.id) {
            cargarDatos()
        }
    }, [params.id])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            // Cargar tipos de documento
            const resMaestros = await obtenerClientes()
            if (resMaestros.success) {
                setTiposDocumento(resMaestros.tiposDocumento)
            }

            // Cargar datos del cliente
            const resCliente = await obtenerClientePorId(params.id)
            if (resCliente.success) {
                const c = resCliente.cliente

                // Datos básicos (mapeo desde estructura anidada)
                setTipoDocumentoId(c.documento?.tipoId?.toString() || '')
                setNumeroDocumento(c.documento?.numero || '')
                setNombre(c.nombre || '')
                setApellidos(c.apellidos || '')
                setTelefono(c.contacto?.telefono || '')
                setEmail(c.contacto?.email || '')
                setDireccion(c.contacto?.direccion || '')
                setActivo(c.clienteActivo)
                setFotoUrl(c.fotoUrl || '')
                setPreviewFoto(c.fotoUrl || null)

                // Datos de crédito
                if (c.credito) {
                    setTieneCredito(c.credito.activo)
                    setLimiteCredito(c.credito.limite || '')
                    setFrecuenciaPago(c.credito.frecuenciaPago || 'mensual')
                    setDiasGracia(c.credito.diasPlazo || 30)
                }
            } else {
                alert(resCliente.mensaje || 'Error al cargar el cliente')
                router.push('/admin/clientes')
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al cargar datos')
            router.push('/admin/clientes')
        } finally {
            setCargando(false)
        }
    }

    const manejarImagen = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen no debe superar 2MB')
            return
        }

        setFotoArchivo(file)
        setPreviewFoto(URL.createObjectURL(file))
        setFotoUrl(`/uploads/clientes/temp_${Date.now()}.jpg`) // Simulación
    }

    const validarFormulario = () => {
        if (!tipoDocumentoId) { alert('Selecciona un tipo de documento'); return false; }
        if (!numeroDocumento.trim()) { alert('El número de documento es obligatorio'); return false; }
        if (!nombre.trim()) { alert('El nombre es obligatorio'); return false; }
        if (tieneCredito && (!limiteCredito || parseFloat(limiteCredito) < 0)) {
            alert('Debes definir un límite de crédito válido');
            return false;
        }
        return true
    }

    const manejarSubmit = async (e) => {
        e.preventDefault()
        if (!validarFormulario()) return

        setProcesando(true)
        try {
            const dataToUpdate = {
                cliente_id: parseInt(params.id),
                cliente: {
                    tipo_documento_id: parseInt(tipoDocumentoId),
                    numero_documento: numeroDocumento.trim(),
                    nombre: nombre.trim(),
                    apellidos: apellidos.trim() || null,
                    telefono: telefono.trim() || null,
                    email: email.trim() || null,
                    direccion: direccion.trim() || null,
                    activo: activo,
                    // Si hay una foto local (base64) se podría enviar aquí para guardarImagenCliente
                    // Por ahora conservamos la fotoUrl existente si no se cambió
                    foto_url: fotoUrl || null
                },
                credito: {
                    limite: tieneCredito ? parseFloat(limiteCredito) : 0,
                    frecuencia_pago: tieneCredito ? frecuenciaPago : 'mensual',
                    dias_plazo: tieneCredito ? parseInt(diasGracia) : 30,
                    activo: tieneCredito
                }
            }

            const resultado = await actualizarClienteYCredito(dataToUpdate)

            if (resultado.success) {
                alert(resultado.mensaje)
                router.push('/admin/clientes')
            } else {
                alert(resultado.mensaje || 'Error al actualizar cliente')
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error)
            alert('Error al procesar la solicitud')
        } finally {
            setProcesando(false)
        }
    }

    if (cargando) {
        return (
            <div className={`${estilos.contenedor} ${estilos[tema]}`}>
                <div className={estilos.cargando}>
                    <ion-icon name="sync-outline" className={estilos.iconoCargando}></ion-icon>
                    <span>Cargando datos del cliente...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${estilos.contenedor} ${estilos[tema]}`}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Editar Cliente</h1>
                    <p className={estilos.subtitulo}>Actualiza el perfil y la configuración de crédito</p>
                </div>
                <button
                    className={estilos.btnCancelarHeader}
                    onClick={() => router.push('/admin/clientes')}
                >
                    <ion-icon name="close-outline"></ion-icon>
                    <span>Cancelar</span>
                </button>
            </div>

            <form onSubmit={manejarSubmit} className={estilos.formulario}>
                <div className={estilos.layoutPrincipal}>

                    <div className={estilos.columnaIzquierda}>
                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="person-circle-outline"></ion-icon>
                                <span>Información del Cliente</span>
                            </h3>

                            <div className={estilos.gridDosColumnas}>
                                <div className={estilos.grupoInput}>
                                    <label>Tipo de Documento *</label>
                                    <select
                                        value={tipoDocumentoId}
                                        onChange={(e) => setTipoDocumentoId(e.target.value)}
                                        className={estilos.select}
                                        required
                                        disabled={procesando}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {tiposDocumento.map(tipo => (
                                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={estilos.grupoInput}>
                                    <label>Número de Documento *</label>
                                    <input
                                        type="text"
                                        value={numeroDocumento}
                                        onChange={(e) => setNumeroDocumento(e.target.value)}
                                        className={estilos.input}
                                        required
                                        disabled={procesando}
                                    />
                                </div>
                            </div>

                            <div className={estilos.gridDosColumnas}>
                                <div className={estilos.grupoInput}>
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className={estilos.input}
                                        required
                                        disabled={procesando}
                                    />
                                </div>

                                <div className={estilos.grupoInput}>
                                    <label>Apellidos</label>
                                    <input
                                        type="text"
                                        value={apellidos}
                                        onChange={(e) => setApellidos(e.target.value)}
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>
                            </div>

                            <div className={estilos.gridDosColumnas}>
                                <div className={estilos.grupoInput}>
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>

                                <div className={estilos.grupoInput}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={estilos.input}
                                        disabled={procesando}
                                    />
                                </div>
                            </div>

                            <div className={estilos.grupoInput}>
                                <label>Dirección</label>
                                <textarea
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    className={estilos.textarea}
                                    disabled={procesando}
                                />
                            </div>

                            <div className={estilos.grupoInputCheck}>
                                <label className={estilos.labelCheck}>
                                    <input
                                        type="checkbox"
                                        checked={activo}
                                        onChange={(e) => setActivo(e.target.checked)}
                                        disabled={procesando}
                                    />
                                    <span>Cliente Activo</span>
                                </label>
                            </div>
                        </div>

                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="card-outline"></ion-icon>
                                <span>Configuración de Crédito</span>
                            </h3>

                            <div className={estilos.grupoInputCheck}>
                                <label className={estilos.labelCheck}>
                                    <input
                                        type="checkbox"
                                        checked={tieneCredito}
                                        onChange={(e) => setTieneCredito(e.target.checked)}
                                        disabled={procesando}
                                    />
                                    <span>Habilitar crédito para este cliente</span>
                                </label>
                            </div>

                            {tieneCredito && (
                                <div className={estilos.gridDosColumnas}>
                                    <div className={estilos.grupoInput}>
                                        <label>Límite de Crédito *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={limiteCredito}
                                            onChange={(e) => setLimiteCredito(e.target.value)}
                                            className={estilos.input}
                                            required
                                            disabled={procesando}
                                        />
                                    </div>

                                    <div className={estilos.grupoInput}>
                                        <label>Frecuencia de Pago *</label>
                                        <select
                                            value={frecuenciaPago}
                                            onChange={(e) => setFrecuenciaPago(e.target.value)}
                                            className={estilos.select}
                                            disabled={procesando}
                                        >
                                            <option value="semanal">Semanal</option>
                                            <option value="quincenal">Quincenal</option>
                                            <option value="mensual">Mensual</option>
                                            <option value="personalizada">Personalizada</option>
                                        </select>
                                    </div>

                                    <div className={estilos.grupoInput}>
                                        <label>Días de Plazo / Gracia</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={diasGracia}
                                            onChange={(e) => setDiasGracia(e.target.value)}
                                            className={estilos.input}
                                            disabled={procesando}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={estilos.columnaDerecha}>
                        <div className={`${estilos.seccion} ${estilos[tema]}`}>
                            <h3 className={estilos.tituloSeccion}>
                                <ion-icon name="camera-outline"></ion-icon>
                                <span>Identificación Visual</span>
                            </h3>

                            <div className={estilos.seccionFoto}>
                                <div className={estilos.contenedorPreview} onClick={() => fileInputRef.current?.click()}>
                                    {previewFoto ? (
                                        <img src={previewFoto} alt="Preview" className={estilos.previewImg} />
                                    ) : (
                                        <div className={estilos.placeholderFoto}>
                                            <ion-icon name="person-add-outline"></ion-icon>
                                            <span>Actualizar Foto</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    capture="user"
                                    onChange={manejarImagen}
                                    style={{ display: 'none' }}
                                />
                                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Click para cambiar imagen</p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className={estilos.footerFormulario}>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/clientes')}
                        className={estilos.btnCancelarForm}
                        disabled={procesando}
                    >
                        <span>Cancelar</span>
                    </button>
                    <button
                        type="submit"
                        className={estilos.btnGuardar}
                        disabled={procesando}
                    >
                        {procesando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    )
}
