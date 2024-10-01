import fp from "fastify-plugin";
import type { IClientOptions, MqttClient } from "mqtt";
import mqtt from "mqtt";
import type {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyPluginOptions,
} from "fastify";

declare module 'fastify' {
  interface FastifyInstance {
    mqtt: MqttClient;
  }
}
interface MqttPluginOptions extends FastifyPluginOptions {
  mqttUrl: string;
  mqttOptions?: IClientOptions;
  mqttIsDebug?: boolean;
  // mqttUsesAuth?: boolean;
  // mqttUsername?: string;
  // mqttPassword?: string;
}

function decorateFastifyInstance(fastify: FastifyInstance, client: MqttClient, next: (err?: Error) => void) {
  fastify.addHook('onClose', () => {
    client.end();
  });

  if (!fastify.mqtt) {
    fastify.decorate('mqtt', client);
  } else {
    next(new Error('fastifyMqtt has already registered'));
    return;
  }

  next();
}

const fastifyMqttPlugin: FastifyPluginCallback<MqttPluginOptions> = (fastify, opts, next) => {
  const client = mqtt.connect(opts.mqttUrl, opts.mqttOptions);
  const isDebug = opts.mqttIsDebug;
  fastify.log.info('Connecting to mqtt broker at %s', opts.mqttUrl);
  client.on("connect", () => {
    decorateFastifyInstance(fastify, client, next);
    fastify.log.info('Connected to mqtt broker at %s', opts.mqttUrl);
  });
  client.on('reconnect', () => {
    fastify.log.info('Reconnecting to mqtt broker at %s', opts.url);
  });
  client.on('close', () => {
    fastify.log.info('Connection to mqtt broker closed');
  });
  if (isDebug) {
    client.on('packetsend', (packet) => {
      fastify.log.debug('packetsend', packet);
    });
    client.on('packetreceive', (packet) => {
      fastify.log.debug('packetreceive', packet);
    });
    client.on('message', (topic, message, packet) => {
      fastify.log.debug('message', topic, message, packet);
    });
  }
  client.on('error', (err) => {
    next(err);
  });
};

const fastifyMqtt = fp(fastifyMqttPlugin, {
  fastify: '4.x',
  name: 'fastifyMqtt'
});

export default fastifyMqtt;