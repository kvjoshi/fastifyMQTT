# fastifyMQTT

Useage:

```javascript

 fastify.register(fastifyMqtt, {
    mqttUrl:'http://broker.emqx.io',
    mqttIsDebug: true,
    mqttOptions:{
        clientId: 'fastify-mqtt',
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        username: '',
        password: '',
    }
  })
```
