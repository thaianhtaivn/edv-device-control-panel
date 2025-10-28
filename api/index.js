const express = require('express');
const serverless = require("serverless-http");
const setupMiddleware = require('../components/middleware');
const deviceRoutes = require('../components/deviceRoutes');
const deviceOTARoutes = require('../components/deviceOTARoutes');
const userRoutes = require('../components/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
setupMiddleware(app);

// Register routes
app.use('/', userRoutes);
app.use('/', deviceRoutes);
app.use('/', deviceOTARoutes);

// Start server only in local development
if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
            console.log(`Local server running on http://localhost:${PORT}`);
      });
}

// Export for both local development and Vercel serverless
module.exports = app;
module.exports.handler = serverless(app);