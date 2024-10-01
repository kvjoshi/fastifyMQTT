"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_plugin_1 = require("fastify-plugin");
var mqtt_1 = require("mqtt");
function decorateFastifyInstance(fastify, client, next) {
    fastify.addHook('onClose', function () {
        client.end();
    });
    if (!fastify.mqtt) {
        fastify.decorate('mqtt', client);
    }
    else {
        next(new Error('fastifyMqtt has already registered'));
        return;
    }
    next();
}
var fastifyMqttPlugin = function (fastify, opts, next) {
    var client = mqtt_1.default.connect(opts.mqttUrl, opts.mqttOptions);
    var isDebug = opts.mqttIsDebug;
    fastify.log.info('Connecting to mqtt broker at %s', opts.mqttUrl);
    client.on("connect", function () {
        decorateFastifyInstance(fastify, client, next);
        fastify.log.info('Connected to mqtt broker at %s', opts.mqttUrl);
    });
    client.on('reconnect', function () {
        fastify.log.info('Reconnecting to mqtt broker at %s', opts.url);
    });
    client.on('close', function () {
        fastify.log.info('Connection to mqtt broker closed');
    });
    if (isDebug) {
        client.on('packetsend', function (packet) {
            fastify.log.debug('packetsend', packet);
        });
        client.on('packetreceive', function (packet) {
            fastify.log.debug('packetreceive', packet);
        });
        client.on('message', function (topic, message, packet) {
            fastify.log.debug('message', topic, message, packet);
        });
    }
    client.on('error', function (err) {
        next(err);
    });
};
var fastifyMqtt = (0, fastify_plugin_1.default)(fastifyMqttPlugin, {
    fastify: '4.x',
    name: 'fastifyMqtt'
});
exports.default = fastifyMqtt;
