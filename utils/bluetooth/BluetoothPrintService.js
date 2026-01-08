import { WebBluetoothAdapter } from './adapters/WebBluetoothAdapter';
import { RawBTAdapter } from './adapters/RawBTAdapter';
import { generateTicket } from './ESCPOSBuilder';

/**
 * Servicio principal de impresión Bluetooth
 * Selecciona automáticamente el mejor adaptador disponible
 */
class BluetoothPrintService {
    constructor() {
        this.adapter = null;
        this.currentDevice = null;
        this.isInitialized = false;
    }

    /**
     * Inicializar servicio (detectar plataforma y seleccionar adaptador)
     */
    async initialize() {
        if (this.isInitialized && this.adapter) {
            return true;
        }

        console.log('🚀 Inicializando BluetoothPrintService...');

        try {
            this.adapter = await this._selectBestAdapter();
            this.isInitialized = true;

            console.log('✅ Adaptador seleccionado:', this.adapter.constructor.name);
            return true;

        } catch (error) {
            console.error('❌ Error al inicializar:', error);
            throw new Error('No hay método de impresión disponible en este dispositivo');
        }
    }

    /**
     * Seleccionar el mejor adaptador según plataforma y capacidades
     */
    async _selectBestAdapter() {
        // 1. Prioridad: Web Bluetooth API (Android Chrome/Edge, Windows)
        const webBTAdapter = new WebBluetoothAdapter();
        if (await webBTAdapter.isSupported()) {
            console.log('✅ Web Bluetooth API disponible');
            return webBTAdapter;
        }

        // 2. Fallback: RawBT (Android con app externa)
        const rawBTAdapter = new RawBTAdapter();
        if (await rawBTAdapter.isSupported()) {
            console.log('⚠️  Usando RawBT como fallback');
            return rawBTAdapter;
        }

        // Si llegamos aquí, no hay método disponible
        throw new Error('Plataforma no soportada');
    }

    /**
     * Solicitar selección de impresora al usuario
     */
    async selectPrinter() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const device = await this.adapter.requestDevice();
            this.currentDevice = device;

            // Guardar en localStorage para reconexión automática
            this._saveDeviceToStorage(device);

            console.log('✅ Impresora seleccionada:', device.name);
            return device;

        } catch (error) {
            throw new Error('Error al seleccionar impresora: ' + error.message);
        }
    }

    /**
     * Conectar a impresora
     */
    async connect(device = null) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const deviceToConnect = device || this.currentDevice;

        if (!deviceToConnect) {
            throw new Error('No hay impresora seleccionada');
        }

        try {
            const connected = await this.adapter.connect(deviceToConnect);

            if (connected) {
                this.currentDevice = deviceToConnect;
                console.log('✅ Conectado a:', deviceToConnect.name);
            }

            return connected;

        } catch (error) {
            throw new Error('Error al conectar: ' + error.message);
        }
    }

    /**
     * Imprimir ticket de venta
     */
    async printTicket(ventaData, empresaData, paperWidth = 48) {
        if (!this.isInitialized) {
            throw new Error('Servicio no inicializado');
        }

        if (!await this.isConnected()) {
            throw new Error('No hay impresora conectada');
        }

        try {
            console.log('🖨️  Generando ticket...');

            // Generar comandos ESC/POS
            const escposCommands = generateTicket(ventaData, empresaData, paperWidth);

            console.log('📄 Ticket generado, enviando a impresora...');

            // Enviar a impresora
            await this.adapter.print(escposCommands);

            console.log('✅ Ticket impreso correctamente');
            return true;

        } catch (error) {
            console.error('❌ Error al imprimir ticket:', error);
            throw new Error('Error al imprimir: ' + error.message);
        }
    }

    /**
     * Verificar si hay conexión activa
     */
    async isConnected() {
        if (!this.adapter) return false;
        return await this.adapter.isDeviceConnected();
    }

    /**
     * Desconectar impresora
     */
    async disconnect() {
        if (this.adapter) {
            await this.adapter.disconnect();
            this.currentDevice = null;
            console.log('✅ Desconectado');
        }
    }

    /**
     * Reconectar a última impresora usada
     */
    async reconnectToLastPrinter() {
        const lastDevice = this._getDeviceFromStorage();

        if (!lastDevice) {
            return false;
        }

        try {
            console.log('🔄 Intentando reconectar a:', lastDevice.name);
            await this.connect(lastDevice);
            return true;
        } catch (error) {
            console.log('❌ No se pudo reconectar:', error.message);
            return false;
        }
    }

    /**
     * Guardar dispositivo en localStorage
     */
    _saveDeviceToStorage(device) {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('isiweek_last_printer', JSON.stringify({
                    id: device.id,
                    name: device.name,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('No se pudo guardar impresora:', error);
            }
        }
    }

    /**
     * Obtener dispositivo de localStorage
     */
    _getDeviceFromStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                const stored = localStorage.getItem('isiweek_last_printer');
                if (stored) {
                    const device = JSON.parse(stored);

                    // Verificar que no sea muy antiguo (7 días)
                    const age = Date.now() - device.timestamp;
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días

                    if (age < maxAge) {
                        return device;
                    }
                }
            } catch (error) {
                console.warn('Error al leer impresora guardada:', error);
            }
        }
        return null;
    }

    /**
     * Limpiar caché de impresora
     */
    clearSavedPrinter() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('isiweek_last_printer');
        }
    }
}

// Exportar instancia singleton
export default new BluetoothPrintService();
