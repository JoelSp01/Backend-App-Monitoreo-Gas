import { NestFactory } from '@nestjs/core';
import { MqttModule } from './mqtt/mqtt.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(MqttModule, {
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://172.16.131.165:1883',
    },
  });
}
bootstrap();
