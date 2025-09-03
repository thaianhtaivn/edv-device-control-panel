const express = require('express');
const axios = require('axios');
const { getAllDevices, firmwareLatestVersion } = require('./firebaseService');

const router = express.Router();

router.get('/', async (req, res) => {
      const allDevices = await getAllDevices();
      res.render('home/index', {
            firmwareVersion: firmwareLatestVersion,
            devices: allDevices
      });
});

module.exports = router;
