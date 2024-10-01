import 'fastify'
import type { Client, IClientOptions, MqttClient } from 'mqtt';

declare module 'fastify' {
  interface FastifyInstance {
    mqtt: MqttClient;
  }
}