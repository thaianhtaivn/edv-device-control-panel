const express = require('express');
const serverless = require("serverless-http");
const setupMiddleware = require('./components/middleware');
const deviceRoutes = require('./components/deviceRoutes');
const userRoutes = require('./components/userRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
setupMiddleware(app);

// Register routes
app.use('/', userRoutes);
app.use('/', deviceRoutes);


// Start server
(async () => {
      app.listen(PORT, () => {
            console.log(`Local server running on http://localhost:${PORT}`);
      });
})();

module.exports = serverless(app);