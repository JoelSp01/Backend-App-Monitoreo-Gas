import { Injectable } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import * as mysql from 'mysql';

@Injectable()
export class MqttService {
    private readonly client: MqttClient;
    private readonly dbConnection: mysql.Connection;

    constructor() {
        // Inicializa el cliente MQTT con la URL del broker
        this.client = connect('mqtt://192.168.1.11:1883', {
            clientId: 'nestjs-mqtt-client'
        });

        // Inicializa la conexión a la base de datos MySQL
        this.dbConnection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'bdd_titulacion'
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

        try {
            // Parsea el mensaje JSON recibido
            const data = JSON.parse(message);

            // Inserta los datos en la base de datos MySQL
            const query = `INSERT INTO tbl_lecturas (lec_peso, lec_temperatura) VALUES (?, ?)`;
            this.dbConnection.query(query, [data.peso, data.temperatura], (error, results, fields) => {
                if (error) {
                    console.error('Error al insertar datos en la base de datos:', error);
                } else {
                    console.log('Datos insertados correctamente en la base de datos.');
                }
            });
        } catch (error) {
            console.error('Error al parsear el mensaje JSON:', error);
        }
    }


}
