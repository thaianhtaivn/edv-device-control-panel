const express = require('express');
const axios = require('axios');
const { saveDeviceId, getDeviceId } = require('../components/firebaseService');
const router = express.Router();


/**
 * @swagger
 * /device/{id}:
 *   get:
 *     summary: Get device control panel
 *     tags: [Devices]
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
 *     tags: [Devices]
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
 *     tags: [Devices]
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
 *     tags: [Devices]
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
      console.log(field);

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
 *     tags: [Devices]
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

      if (!id) return res.status(400).json({ success: false, message: "Device ID is required." });

      const date = Date.now();
      const device_data = {
            state: state || 0,
            lastUpdated: date
      };

      saveDeviceId(id, device_data);
      return res.status(200).json({ success: true, message: "Device state updated successfully.", device_data });
});



module.exports = router;
