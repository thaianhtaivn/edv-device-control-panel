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
