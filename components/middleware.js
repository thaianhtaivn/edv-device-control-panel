const express = require('express');
const ejs = require("ejs");
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerSpec');
const mqtt = require('mqtt');
const { saveDeviceId, getDeviceId } = require('./firebaseService');

// HiveMQ Cloud credentials
const MQTT_HOST = '22db085eee894127baa4da34ad5568b8.s1.eu.hivemq.cloud';
const MQTT_PORT = 8883;
const MQTT_USERNAME = 'esp8266.tai.thai';
const MQTT_PASSWORD = 'T@i09092025';
const options = {
      host: MQTT_HOST,
      port: MQTT_PORT,
      protocol: 'mqtts',
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: 3000
};

let clients = []; // all SSE connections

function setupMiddleware(app) {
      app.use(cors());
      app.use(helmet());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.set('view engine', 'ejs');
      app.set('views', path.join(__dirname, '../components/views'));
      app.use(express.static(path.join(__dirname, '../public')));
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

      // MQTT Client Setup

      const mqttClient = mqtt.connect(options);
      app.locals.mqttClient = mqttClient;   // <—— make it available to routes
      mqttClient.on('connect', () => {
            console.log('✅ MQTT connected to HiveMQ Cloud');

            // Subscribe to all topics
            mqttClient.subscribe('#', (err) => {
                  if (err) {
                        console.error('❌ MQTT subscribe error:', err.message);
                  } else {
                        console.log('📡 Subscribed to all MQTT topics (#)');
                  }
            });
      });

      mqttClient.on('error', (err) => {
            console.error('🚨 MQTT error:', err.message);
      });

      mqttClient.on('reconnect', () => {
            console.log('🔄 MQTT reconnecting...');
      });

      mqttClient.on('message', (topic, message) => {
            if (process.env.NODE_ENV === 'local') {
                  console.log(`📩 [${topic}]: ${message.toString()}`);
            }
            const deviceId = topic.split('/')[0]; // Assuming topic format: deviceId/...
            // TODO: Emit via WebSocket, store to DB, trigger logic, etc.
            const date = Date.now();
            const updateData = { lastUpdated: date };
            updateData['state'] = parseInt(message.toString()) || 0;

            saveDeviceId(deviceId, updateData);

            // Broadcast update to all clients
            clients.forEach(res => {
                  res.write(`data: ${JSON.stringify({ deviceId, state: parseInt(message.toString()) || 0 })}\n\n`);
            });
      });

      // SSE route (same for all devices)
      app.get("/events", (req, res) => {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            clients.push(res);

            req.on("close", () => {
                  clients = clients.filter(c => c !== res);
            });
      });

}




module.exports = setupMiddleware;
