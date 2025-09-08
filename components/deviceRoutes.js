const express = require('express');
const axios = require('axios');
const { saveDeviceId, getDeviceId } = require('./firebaseService');
const router = express.Router();


/**
 * @swagger
 * /device/{id}:
 *   get:
 *     summary: Get device information for control panel view
 *     tags: [Device UI]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Rendered control panel
 *       404:
 *         description: Device not found
 */
router.get('/device/:id', async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) return res.status(404).send('<h2>404 - Device not found</h2>');
      res.render('device/controlPanel', { id: deviceId, device });
});

/**
 * @swagger
 * /device/details/{id}:
 *   get:
 *     summary: Get device details
 *     tags: [Device UI]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Rendered device details view
 *       404:
 *         description: Device not found
 */


router.get('/device/details/:id', async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) return res.status(404).send('Device not found');
      res.render('device/details', { id: deviceId, device });
});

/**
 * @swagger
 * /api/v1/device/register:
 *   post:
 *     summary: Register a new device
 *     tags: [Devices API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *               fw:
 *                 type: string
 *               ma:
 *                 type: string
 *               ip:
 *                 type: string
 *               si:
 *                 type: string
 *               pa:
 *                 type: string
 *               gw:
 *                 type: string
 *               sm:
 *                 type: string
 *               sg:
 *                 type: string
 *               pt:
 *                 type: string
 *               st:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device registered successfully
 */

router.post("/api/v1/device/register", (req, res) => {
      const { id, fw, ma, ip, si, pa, gw, sm, sg, pt, st } = req.body;
      if (!id) return res.status(400).json({ success: false, message: "Device ID is required." });

      const date = Date.now();
      const device_data = {
            firmwareVersion: fw || "1.0.0",
            mac: ma || "00:00:00:00:00:00",
            ipAddress: ip || "",
            wifiSSID: si || "",
            wifiPass: pa || "",
            gateway: gw || "",
            subnetMask: sm || "",
            signal: sg || "0",
            devicePort: pt || "",
            status: st || "Online",
            state: se || 0,
            lastUpdated: date,
      };

      saveDeviceId(id, device_data);
      return res.status(200).json({ success: true, message: "Device registered successfully.", device_data });
});

/**
 * @swagger
 * /api/v1/device/update:
 *   post:
 *     summary: Update a specific field of a device
 *     tags: [Devices API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, field, value]
 *             properties:
 *               id:
 *                 type: string
 *               field:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device field updated successfully
 */


router.post("/api/v1/device/update", async (req, res) => {
      const { id, field, value } = req.body;

      if (!id || !field) return res.status(400).json({ success: false, message: "Device ID and field are required." });

      const date = Date.now();
      const updateData = {
            lastUpdated: date
      };
      updateData[field] = value;

      saveDeviceId(id, updateData);
      return res.status(200).json({ success: true, message: "Device field updated successfully.", updateData });
});

/**
 * @swagger
 * /api/v1/device/toggle:
 *   post:
 *     summary: Toggle device state
 *     tags: [Devices API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *               state:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Device state updated successfully
 */

router.post("/api/v1/device/toggle", (req, res) => {
      const { id, state } = req.body;
      console.log("Toggle request received:", { id, state });


      if (!id) return res.status(400).json({ success: false, message: "Device ID is required." });

      const date = Date.now();
      const device_data = {
            state: state || 0,
            lastUpdated: date
      };

      saveDeviceId(id, device_data);

      // Publish to MQTT
      try {
            const mqttClient = req.app.locals.mqttClient;
            const topic = `${id}/command`;  // e.g., "esp8266-abc123/command"
            const message = device_data.state.toString();

            // Publish to MQTT
            mqttClient.publish(topic, message, { qos: 1, retain: false }, (err) => {
                  if (err) {
                        console.error(`MQTT publish error: ${err.message}`);
                  } else {
                        console.log(`📤 Published to ${topic}: ${message}`);
                  }
            });
      } catch (error) {
            console.error("Error publishing to MQTT:", error);
      }

      return res.status(200).json({ success: true, message: "Device state updated successfully.", device_data });
});


/**
 * @swagger
 * /api/v1/device/info/{id}:
 *   get:
 *     summary: Get device information by ID
 *     tags: [Devices API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device info retrieved successfully 
 *       404:
 *         description: Device not found 
 */

router.get("/api/v1/device/info/:id", async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) {
            return res.status(404).json({ success: false, message: "Device not found." });
      }

      return res.status(200).json({ success: true, device });
});


router.get('/api/v1/ping', async (req, res) => {
      res.status(200).json({ success: true, message: "Test endpoint is working." });
});

module.exports = router;
