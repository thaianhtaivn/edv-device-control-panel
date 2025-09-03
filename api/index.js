const express = require('express');
const setupMiddleware = require('./middleware');
const deviceRoutes = require('./deviceRoutes');
const userRoutes = require('./userRoutes');


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

module.exports = app;
