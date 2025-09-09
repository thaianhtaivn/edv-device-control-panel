const axios = require('axios');

const FIREBASE_URL = "https://esp-test-c3f00-default-rtdb.asia-southeast1.firebasedatabase.app/";
const DEVICE_LIST_VAR = "endava_iot_test";
const firmwareLatestVersion = '1.0.2';
const VALID_TOKEN = "edv@token2025";

async function getDeviceId(deviceId) {
      try {
            const response = await axios.get(`${FIREBASE_URL}${DEVICE_LIST_VAR}/${deviceId}.json`);
            return response.data;
      } catch (error) {
            console.error("Error getting device ID:", error);
            return null;
      }
}

async function getAllDevices() {
      try {
            const response = await axios.get(`${FIREBASE_URL}${DEVICE_LIST_VAR}.json`);
            return response.data;
      } catch (error) {
            console.error("Error getting all devices:", error);
            return null;
      }
}

async function saveDeviceId(deviceId, data) {
      try {
            await axios.patch(`${FIREBASE_URL}${DEVICE_LIST_VAR}/${deviceId}.json`, data);
      } catch (error) {
            console.error("Error saving device ID:", error);
      }
}

async function delDeviceId(deviceId) {
      try {
            await axios.delete(`${FIREBASE_URL}${DEVICE_LIST_VAR}/${deviceId}.json`);
      } catch (error) {
            console.error("Error deleting device ID:", error);
      }
}

module.exports = {
      getDeviceId,
      getAllDevices,
      saveDeviceId,
      delDeviceId,
      firmwareLatestVersion,
      VALID_TOKEN
};
