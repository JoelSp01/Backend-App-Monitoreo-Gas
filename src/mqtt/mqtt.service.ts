import { Injectable } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

@Injectable()
export class MqttService {
    private readonly client: MqttClient;
    private readonly influxDB: InfluxDB;

    constructor() {
        // Inicializa el cliente MQTT con la URL del broker
        this.client = connect('mqtt://192.168.1.10:1883', {
            clientId: 'nestjs-mqtt-client'
        });

        // Configura la conexión a tu base de datos InfluxDB
        this.influxDB = new InfluxDB({
            url: 'http://localhost:8086',
            token: 'B6FuBSJ2PHbKlt_NUcpG3ocWgnVt7-VNR9tMjMaW_jsZwkuxW4azGATxSIpjMZMXkk7igjP6XgW06KP2ZViTcg==',
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

            // Inserta los datos en la base de datos InfluxDB
            const writeApi = this.influxDB.getWriteApi('titulacion', 'titulacion');
            const point = new Point('lecturas')
                .tag('topic', topic)
                .floatField('peso', data.peso)
                .floatField('temperatura', data.temperatura)
                .timestamp(new Date());

            writeApi.writePoint(point);
            writeApi.close();
            console.log('Datos insertados correctamente en la base de datos InfluxDB.');
        } catch (error) {
            console.error('Error al parsear el mensaje JSON:', error);
        }
    }

}
