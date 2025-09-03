const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const axios = require('axios');


const FIREBASE_URL = "https://esp-test-c3f00-default-rtdb.asia-southeast1.firebasedatabase.app/";
const app = express();
const PORT = process.env.PORT || 3000;
const DEVICE_LIST_VAR = "endava_iot_test";
const VALID_TOKEN = "Th@iT@iESP8266";
const firmwareLatestVersion = '0.0.1';

app.use(cors());
app.use(helmet());
app.use(express.json());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));

// APIs 

async function getDeviceId(deviceId) {
      try {
            const response = await axios.get(`${FIREBASE_URL}${DEVICE_LIST_VAR}/${deviceId}.json`);
            return response.data;
      } catch (error) {
            console.error("Error get device ID:", error);
            return null;
      }
}

async function getAllDevices() {
      try {
            const response = await axios.get(`${FIREBASE_URL}${DEVICE_LIST_VAR}.json`);
            return response.data;
      } catch (error) {
            console.error("Error get all devices:", error);
            return null;
      }
}

async function delDeviceId(deviceId) {
      try {
            await axios.delete(`${FIREBASE_URL}${DEVICE_LIST_VAR}/${deviceId}.json`);
      } catch (error) {
            console.error("Error deleting device ID:", error);
      }
}

async function saveDeviceId(deviceId, data) {
      try {
            await axios.patch(`${FIREBASE_URL}${DEVICE_LIST_VAR}/${deviceId}.json`, data);
      } catch (error) {
            console.error("Error saving device ID:", error);
      }
}


// Routes
app.get('/', async (req, res) => {
      const allDevices = await getAllDevices();
      res.render('home/index', { firmwareVersion: firmwareLatestVersion, devices: allDevices });
});

app.post("/api/v1/device/register", (req, res) => {
      const { id, fw, ma, ip, si, pa, gw, sm, sg, pt, st } = req.body;

      if (!id) { return res.status(400).json({ success: false, message: "Device ID is required." }); }

      const date = Date.now();
      device_data = {
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

app.post("/api/v1/device/update/:id", (req, res) => {
      const { id } = req.params;
      const inputData = req.body;

      // Add/update fields
      const date = Date.now();
      updateData = {
            lastUpdated: date,
            status: "Online",
            signal: inputData.sg || "0",
            relayStates: inputData.rl || 0
      };
      if ('name' in inputData) {
            updateData.name = inputData.name;
      }
      // Persist the updated data
      saveDeviceId(id, updateData);

      res.json({ message: "Device updated successfully." });
});

app.get('/device/details/:id', async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) {
            return res.status(404).send('Device not found');
      }

      res.render('device/details', { id: deviceId, device });
});

app.get('/device/:id', async (req, res) => {
      const deviceId = req.params.id;
      const device = await getDeviceId(deviceId);

      if (!device) {
            return res.status(404).send('<h2>404 - Device not found</h2>');
      }

      res.render('device/controlPanel', {
            id: deviceId,
            device
      });
});

app.post("/api/v1/device/toggle", (req, res) => {
      console.log(req.body);

      const { id, state } = req.body;

      if (!id) { return res.status(400).json({ success: false, message: "Device ID is required." }); }

      const date = Date.now();
      device_data = {
            state: state || 0,
            lastUpdated: date
      };

      saveDeviceId(id, device_data);
      return res.status(200).json({ success: true, message: "Device state updated successfully.", device_data });
});

(async () => {
      app.listen(PORT, () => {
            console.log(`Local server running on http://localhost:${PORT}`);
      });
})();


module.exports = app;