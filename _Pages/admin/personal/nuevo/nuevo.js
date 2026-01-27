"use client"
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {crearTrabajador} from '../servidor'
import estilos from '../personal.module.css'

export default function NuevoTrabajador() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        tipo_documento_id: 1,
        numero_documento: '',
        telefono: '',
        email: '',
        rol_especialidad: '',
        tarifa_por_hora: '',
        tarifa_por_dia: ''
    })
    const [errors, setErrors] = useState({})
    const [procesando, setProcesando] = useState(false)

    const roles = [
        'Electricista',
        'Albañil',
        'Plomero',
        'Ayudante',
        'Carpintero',
        'Pintor',
        'Soldador',
        'Herrero',
        'Otro'
    ]

    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData(prev => ({...prev, [name]: value}))
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setProcesando(true)

        const datos = {
            ...formData,
            tarifa_por_hora: formData.tarifa_por_hora ? parseFloat(formData.tarifa_por_hora) : null,
            tarifa_por_dia: formData.tarifa_por_dia ? parseFloat(formData.tarifa_por_dia) : null
        }

        const res = await crearTrabajador(datos)
        setProcesando(false)

        if (res.success) {
            router.push('/admin/personal')
        } else {
            if (res.errores) {
                setErrors(res.errores)
            } else {
                alert(res.mensaje || 'Error al crear el trabajador')
            }
        }
    }

    return (
        <div className={estilos.contenedor}>
            <div className={estilos.header}>
                <div>
                    <h1 className={estilos.titulo}>Nuevo Trabajador</h1>
                    <p className={estilos.subtitulo}>Registrar nuevo personal en campo</p>
                </div>
                <button className={estilos.btnNuevo} onClick={() => router.back()}>
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    <span>Volver</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className={estilos.form}>
                <section className={estilos.seccion}>
                    <h3>Datos Personales</h3>
                    <div className={estilos.fila}>
                        <div className={estilos.grupo}>
                            <label>Nombre *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className={errors.nombre ? estilos.error : ''}
                            />
                            {errors.nombre && <span className={estilos.errorMsg}>{errors.nombre}</span>}
                        </div>
                        <div className={estilos.grupo}>
                            <label>Apellidos</label>
                            <input
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className={estilos.fila}>
                        <div className={estilos.grupo}>
                            <label>Número de Documento *</label>
                            <input
                                type="text"
                                name="numero_documento"
                                value={formData.numero_documento}
                                onChange={handleChange}
                                required
                                className={errors.numero_documento ? estilos.error : ''}
                            />
                            {errors.numero_documento &&
                                <span className={estilos.errorMsg}>{errors.numero_documento}</span>}
                        </div>
                        <div className={estilos.grupo}>
                            <label>Teléfono</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className={estilos.grupo}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                <section className={estilos.seccion}>
                    <h3>Datos Laborales</h3>
                    <div className={estilos.grupo}>
                        <label>Rol / Especialidad *</label>
                        <select
                            name="rol_especialidad"
                            value={formData.rol_especialidad}
                            onChange={handleChange}
                            required
                            className={errors.rol_especialidad ? estilos.error : ''}
                        >
                            <option value="">Seleccione...</option>
                            {roles.map(rol => (
                                <option key={rol} value={rol}>{rol}</option>
                            ))}
                        </select>
                        {errors.rol_especialidad && <span className={estilos.errorMsg}>{errors.rol_especialidad}</span>}
                    </div>
                    <div className={estilos.fila}>
                        <div className={estilos.grupo}>
                            <label>Tarifa por Hora (RD$)</label>
                            <input
                                type="number"
                                name="tarifa_por_hora"
                                value={formData.tarifa_por_hora}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                        </div>
                        <div className={estilos.grupo}>
                            <label>Tarifa por Día (RD$)</label>
                            <input
                                type="number"
                                name="tarifa_por_dia"
                                value={formData.tarifa_por_dia}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </section>

                <div className={estilos.modalFooter}>
                    <button type="button" onClick={() => router.back()} disabled={procesando}>
                        Cancelar
                    </button>
                    <button type="submit" className={estilos.btnGuardar} disabled={procesando}>
                        {procesando ? 'Guardando...' : 'Crear Trabajador'}
                    </button>
                </div>
            </form>
        </div>
    )
}

