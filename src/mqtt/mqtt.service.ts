import { Injectable } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import * as CryptoJS from 'crypto-js';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

@Injectable()
export class MqttService {
    private readonly client: MqttClient;
    private readonly influxDB: InfluxDB;
    private readonly aes_key = '1234567890ABCDEF1234567890ABCDEF';

    constructor() {
        this.client = connect('mqtt://192.168.1.13:1883', {
            clientId: 'nestjs-mqtt-client'
        });

        this.influxDB = new InfluxDB({
            url: 'http://localhost:8086',
            token: 'B6FuBSJ2PHbKlt_NUcpG3ocWgnVt7-VNR9tMjMaW_jsZwkuxW4azGATxSIpjMZMXkk7igjP6XgW06KP2ZViTcg==',
        });

        this.client.on('connect', () => {
            console.log('Conectado al broker MQTT');
            this.subscribe('datosTest');
        });

        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message.toString());
        });
    }

    async subscribe(topic: string) {
        await this.client.subscribe(topic);
        console.log(`Suscripción al topic ${topic} exitosa`);
    }

    async handleMessage(topic: string, message: string) {
        try {
            console.log(`Mensaje recibido en el topic ${topic}:`);
            console.log(message);

            // Decodificar el mensaje Base64
            const encryptedMessage = message;
            const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedMessage);

            // Desencriptar los bytes utilizando AES-128 ECB
            const decryptedBytes = CryptoJS.AES.decrypt(
                { ciphertext: encryptedBytes },
                CryptoJS.enc.Hex.parse(this.aes_key),
                { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
            );

            // Convertir los bytes desencriptados a texto UTF-8
            const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
            console.log('Mensaje desencriptado:');
            console.log(decryptedText);

            // Separar los datos de peso y temperatura
            const [peso, temperatura] = decryptedText.split(',');

            // Procesar los datos como sea necesario (insertar en InfluxDB en este caso)
            await this.insertDataIntoInfluxDB(topic, parseFloat(peso), parseFloat(temperatura));

        } catch (error) {
            console.error('Error al procesar el mensaje recibido:', error);
        }
    }

    async insertDataIntoInfluxDB(topic: string, peso: number, temperatura: number) {
        try {
            const writeApi = this.influxDB.getWriteApi('titulacion', 'titulacion');
            const point = new Point('lecturas')
                .tag('topic', topic)
                .floatField('peso', peso)
                .floatField('temperatura', temperatura)
                .timestamp(new Date());

            await writeApi.writePoint(point);
            writeApi.close();
            console.log('Datos insertados correctamente en la base de datos InfluxDB.');
        } catch (error) {
            console.error('Error al insertar los datos en InfluxDB:', error);
        }
    }
}
