import fp from 'fastify-plugin';
import mqtt, {MqttClient} from 'mqtt';
import type { FastifyInstance, FastifyPluginOptions, FastifyPluginCallback } from 'fastify';
import type { Client, IClientOptions } from 'mqtt';
import "./fastify";

interface MqttPluginOptions extends FastifyPluginOptions {
  url: string;
  options?: IClientOptions;
    isDebug?: boolean;
}


function decorateFastifyInstance (fastify:FastifyInstance , client: MqttClient , next:(err?: Error) => void) {
  fastify.addHook('onClose', () => {
    client.end()
  })

  if (!fastify.mqtt) {
    fastify.decorate('mqtt', client)
  } else {
    next(new Error('fastifyMqtt has already registered'))
    return
  }

  next()
}

const fastifyMqttPlugin: FastifyPluginCallback<MqttPluginOptions> = (fastify:FastifyInstance, opts, next) =>{
  const client = mqtt.connect(opts.url, opts.options)
  const  isDebug  = opts.isDebug

  client.on("connect", () => {
    decorateFastifyInstance(fastify, client, next);
  });
  client.on('reconnect', () => {
    fastify.log.info('Reconnecting to mqtt broker at %s', opts.url)
  })
  client.on('close', () => {
    fastify.log.info('Connection to mqtt broker closed')
  })
  if(isDebug){
    client.on('packetsend', (packet) => {
      fastify.log.debug('packetsend', packet)
    })
    client.on('packetreceive', (packet) => {
      fastify.log.debug('packetreceive', packet)
    })
    client.on('message', (topic, message, packet) => {
        fastify.log.debug('message', topic, message, packet)
    })
  }
  client.on('error', (err) => {
    next(err)
  })
}

const fastifyMqtt = fp(decorateFastifyInstance, {
  fastify: '4.x',
  name: 'fastifyMqtt'
})

export default fastifyMqtt