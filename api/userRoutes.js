const express = require('express');
const axios = require('axios');
const { getAllDevices, firmwareLatestVersion } = require('./firebaseService');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Render the home page with all devices
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully rendered the home page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<!DOCTYPE html><html><head>...</head><body>Home Page</body></html>"
 */

router.get('/', async (req, res) => {
      const allDevices = await getAllDevices();
      res.render('home/index', {
            firmwareVersion: firmwareLatestVersion,
            devices: allDevices
      });
});

module.exports = router;
