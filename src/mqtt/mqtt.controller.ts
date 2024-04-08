import { Controller } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  // Método para suscribirse a un topic específico
  async subscribeToTopic(topic: string) {
    await this.mqttService.subscribe(topic);
  }

  // Método para manejar los mensajes recibidos
  handleMessage(topic: string, message: string) {
    // Aquí puedes procesar los mensajes recibidos del broker MQTT
    console.log(`Mensaje recibido en el topic ${topic}: ${message}`);
  }
}
