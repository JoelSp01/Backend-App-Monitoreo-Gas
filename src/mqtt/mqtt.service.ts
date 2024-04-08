import { Injectable } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';

@Injectable()
export class MqttService {
    private readonly client: MqttClient;

    constructor() {
        // Inicializa el cliente MQTT con la URL del broker
        this.client = connect('mqtt://192.168.1.11:1883', {
            clientId: 'nestjs-mqtt-client'
        });

        // Maneja los eventos de conexión y mensaje recibido
        this.client.on('connect', () => {
            console.log('Conectado al broker MQTT');
            // Una vez conectado, suscríbete al tema deseado
            this.subscribe('datosTest');
        });

        this.client.on('message', (topic, message) => {
            // Llama al método para manejar los mensajes recibidos en el controlador
            this.handleMessage(topic, message.toString());
        });
    }

    // Método para suscribirse a un topic específico
    async subscribe(topic: string) {
        await this.client.subscribe(topic);
        console.log(`Suscripción al topic ${topic} exitosa`);
    }

    // Método para manejar los mensajes recibidos (puede ser opcional)
    handleMessage(topic: string, message: string) {
        // Implementa el manejo de mensajes si es necesario
        console.log(`Mensaje recibido en el topic ${topic}: ${message}`);
    }
}
