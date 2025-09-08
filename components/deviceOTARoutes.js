const express = require('express');
const router = express.Router();
const path = require('path');

const { firmwareLatestVersion, VALID_TOKEN } = require('./firebaseService');

/**
 * @swagger
 * /api/v1/ota/latest:
 *   get:
 *     summary: Get latest firmware version
 *     tags: [OTA]
 *     responses:
 *       200:
 *         description: Latest firmware version (plain text)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "1.2.3"
 */

router.get('/api/v1/ota/latest', (req, res) => {
      try {
            if (!firmwareLatestVersion) {
                  return res.status(500).type('application/json').json({
                        success: false,
                        message: 'Firmware version not available',
                  });
            }

            res.type('text/plain');
            res.send(firmwareLatestVersion);
      } catch (error) {
            res.status(500).json({
                  success: false,
                  message: 'Internal server error',
            });
      }
});

/**
 * @swagger
 * /api/v1/ota/espfirmware{version}.bin:
 *   get:
 *     summary: Download firmware binary
 *     tags: [OTA]
 *     parameters:
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: Firmware version number
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token
 *     responses:
 *       200:
 *         description: Firmware binary file
 *       403:
 *         description: Forbidden (invalid token)
 */

router.get(`/api/v1/ota/espfirmware${firmwareLatestVersion}.bin`, (req, res) => {
      try {
            if (req.query.token !== VALID_TOKEN) {
                  return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
            }

            if (!firmwareLatestVersion) {
                  return res.status(500).json({ success: false, message: 'Firmware version not available' });
            }

            const firmwarePath = path.join(__dirname, '../firmware/bin', `espfirmware${firmwareLatestVersion}.bin`);

            // Timeout safeguard (30s)
            res.setTimeout(30000, () => {
                  if (!res.headersSent) {
                        res.status(504).json({ success: false, message: 'Firmware download timed out' });
                  }
            });

            res.sendFile(firmwarePath, (err) => {
                  if (!err) return;

                  console.error('Error sending firmware file:', err);

                  if (err.code === 'ENOENT') {
                        return res.status(404).json({
                              success: false,
                              message: 'Firmware file not found',
                              version: `espfirmware${firmwareLatestVersion}.bin`,
                        });
                  }

                  res.status(500).json({ success: false, message: 'Failed to send firmware file' });
            });
      } catch (error) {
            console.error('Unexpected error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
      }
});


module.exports = router;