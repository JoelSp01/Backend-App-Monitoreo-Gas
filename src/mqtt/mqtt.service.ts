import { Injectable } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

@Injectable()
export class MqttService {
  private readonly client: MqttClient;
  private readonly influxDB: InfluxDB;

  constructor() {
    this.client = connect('mqtt://www.pucei.edu.ec:1883', {
      clientId: 'nestjs-mqtt-client'
    });

    this.influxDB = new InfluxDB({
      url: 'http://www.pucei.edu.ec:8086',
      token: 'jVNa1s5OkthFsHVgQNVdpb7Luu13sb1nyegGzRgwb5iSbuOd_FP_Tvt5r_ySEhO_K6d9vZiAPQ-xCm06c0iL6w==',
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

  async handleMessage(topic, message) {
    try {
      console.log(`Mensaje recibido en el topic ${topic}:`);
      console.log(message);

      // Procesar el mensaje recibido como texto plano
      const data = message.trim(); // Asegurar que no haya espacios u otros caracteres extraños
      const [peso, temperatura] = data.split(',');

      console.log('Peso:', peso);
      console.log('Temperatura:', temperatura);

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
