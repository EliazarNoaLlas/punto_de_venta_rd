'use client';

import { useState, useEffect } from 'react';
import BluetoothPrintService from '@/utils/bluetooth/BluetoothPrintService';
import styles from './PrinterButton.module.css';
import { FaPrint, FaSpinner, FaCheckCircle, FaTimes, FaLink, FaPlug, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

export default function PrinterButton({ ventaId, compact = false }) {
    const [printer, setPrinter] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('No conectado');

    // Intentar reconexión automática al montar
    useEffect(() => {
        attemptAutoReconnect();
    }, []);

    /**
     * Intentar reconexión automática
     */
    async function attemptAutoReconnect() {
        try {
            setStatus('Verificando última impresora...');
            const reconnected = await BluetoothPrintService.reconnectToLastPrinter();

            if (reconnected) {
                const lastDevice = BluetoothPrintService.currentDevice;
                setPrinter(lastDevice);
                setIsConnected(true);
                setStatus(`Conectado: ${lastDevice.name}`);
            } else {
                setStatus('No conectado');
            }
        } catch (error) {
            console.log('No se pudo reconectar automáticamente');
            setStatus('No conectado');
        }
    }

    /**
     * Conectar a impresora
     */
    async function handleConnect() {
        setIsLoading(true);
        setError(null);
        setStatus('Iniciando conexión...');

        try {
            // Inicializar servicio
            await BluetoothPrintService.initialize();
            setStatus('Selecciona una impresora...');

            // Solicitar selección de impresora (abre diálogo nativo)
            const device = await BluetoothPrintService.selectPrinter();
            setStatus('Conectando...');

            // Conectar
            await BluetoothPrintService.connect(device);

            // Actualizar estado
            setPrinter(device);
            setIsConnected(true);
            setStatus(`Conectado: ${device.name}`);

        } catch (error) {
            setError(error.message);
            setStatus('Error al conectar');
            console.error('Error de conexión:', error);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Imprimir ticket
     */
    async function handlePrint() {
        if (!ventaId) {
            setError('No hay venta seleccionada');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStatus('Obteniendo datos...');

        try {
            // Obtener datos de la venta desde la API
            const response = await fetch(`/api/ventas/${ventaId}`);

            if (!response.ok) {
                throw new Error('No se pudo obtener la venta');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al obtener venta');
            }

            setStatus('Imprimiendo...');

            // Imprimir
            await BluetoothPrintService.printTicket(
                data.venta,
                data.empresa,
                48 // Ancho de papel (48 para 80mm, 32 para 58mm)
            );

            setStatus(`Impreso correctamente`);

            // Resetear status después de 3 segundos
            setTimeout(() => {
                setStatus(`Conectado: ${printer.name}`);
            }, 3000);

        } catch (error) {
            setError(error.message);
            setStatus('Error al imprimir');
            console.error('Error de impresión:', error);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Desconectar
     */
    async function handleDisconnect() {
        try {
            await BluetoothPrintService.disconnect();
            setPrinter(null);
            setIsConnected(false);
            setStatus('Desconectado');
        } catch (error) {
            console.error('Error al desconectar:', error);
        }
    }

    // Modo compacto para el header
    if (compact) {
        return (
            <div className={styles.compactContainer}>
                {!isConnected ? (
                    <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className={styles.btnCompact}
                        title="Conectar impresora Bluetooth"
                    >
                        {isLoading ? <FaSpinner className={styles.spin} /> : <FaPrint />}
                    </button>
                ) : (
                    <div className={styles.compactConnected}>
                        <span className={styles.compactStatus} title={printer.name}>
                            <FaCheckCircle color="#4caf50" /> {printer.name.substring(0, 10)}
                        </span>
                        <button
                            onClick={handleDisconnect}
                            className={styles.btnCompactDisconnect}
                            title="Desconectar"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Modo completo para la página de impresión
    return (
        <div className={styles.container}>
            <div className={styles.statusBar}>
                <span className={styles.statusIcon}>
                    {isConnected ? <FaCheckCircle color="#4caf50" /> : <FaExclamationCircle color="#ef5350" />}
                </span>
                <span className={styles.statusText}>{status}</span>
            </div>

            {error && (
                <div className={styles.error}>
                    <span><FaExclamationTriangle /> {error}</span>
                    <button
                        onClick={() => setError(null)}
                        className={styles.closeError}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className={styles.buttons}>
                {!isConnected ? (
                    <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className={styles.btnConnect}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className={styles.spin} />
                                Conectando...
                            </>
                        ) : (
                            <>
                                <FaLink /> Conectar Impresora
                            </>
                        )}
                    </button>
                ) : (
                    <>
                        {ventaId && (
                            <button
                                onClick={handlePrint}
                                disabled={isLoading}
                                className={styles.btnPrint}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className={styles.spin} />
                                        {status}
                                    </>
                                ) : (
                                    <>
                                        <FaPrint /> Imprimir Ticket
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleDisconnect}
                            disabled={isLoading}
                            className={styles.btnDisconnect}
                        >
                            <FaPlug /> Desconectar
                        </button>
                    </>
                )}
            </div>

            {printer && (
                <div className={styles.printerInfo}>
                    <strong>Impresora:</strong> {printer.name}
                </div>
            )}
        </div>
    );
}
