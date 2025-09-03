const express = require('express');
const axios = require('axios');
const { saveDeviceId, getDeviceId } = require('./firebaseService');
const router = express.Router();


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

router.post("/api/v1/device/update/:id", (req, res) => {
      const { id } = req.params;
      const inputData = req.body;

      const date = Date.now();
      const updateData = {
            lastUpdated: date,
            status: "Online",
            signal: inputData.sg || "0",
            relayStates: inputData.rl || 0
      };

      if ('name' in inputData) updateData.name = inputData.name;

      saveDeviceId(id, updateData);
      res.json({ message: "Device updated successfully." });
});

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

router.get('/device/details/:id', async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) return res.status(404).send('Device not found');
      res.render('device/details', { id: deviceId, device });
});

router.get('/device/:id', async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) return res.status(404).send('<h2>404 - Device not found</h2>');
      res.render('device/controlPanel', { id: deviceId, device });
});

module.exports = router;
